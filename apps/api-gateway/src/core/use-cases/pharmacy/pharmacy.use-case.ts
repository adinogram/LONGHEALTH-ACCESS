/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AddStockDto, CreatePharmacyOrderDto } from './dto/pharmacy.dto';

@Injectable()
export class PharmacyUseCase {
  private readonly logger = new Logger(PharmacyUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adds an inventory batch block to pharmaceutical stocks catalog
   */
  async addStockBatch(
    tenantId: string,
    operatorId: string,
    dto: AddStockDto,
  ): Promise<any> {
    this.logger.log(`Adding medicine stock batch index for tenant ${tenantId}`);

    // Verify medicine catalog
    const medicine = await this.prisma.medicine.findFirst({
      where: { id: dto.medicineId, tenantId },
    });

    if (!medicine) {
      throw new NotFoundException('Selected medicine item was not found inside the catalog.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const stock = await tx.inventoryItem.create({
        data: {
          tenantId,
          medicineId: dto.medicineId,
          batchNumber: dto.batchNumber,
          manufactureDate: new Date(dto.manufactureDate),
          expiryDate: new Date(dto.expiryDate),
          stockQty: dto.stockQty,
          safetyStockQty: dto.safetyStockQty,
          unitCost: dto.unitCost,
          retailPrice: dto.retailPrice,
          locationIndex: dto.locationIndex || null,
          status: dto.stockQty <= dto.safetyStockQty ? 'SHORTAGE' : 'ACTIVE',
        },
      });

      // Commit audit trail for supply chain tracing
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'REGISTER_INVENTORY_STOCK_BATCH',
          targetResource: `pharmacy/inventory/${stock.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            medicineId: dto.medicineId,
            batchNumber: dto.batchNumber,
            quantity: dto.stockQty,
          },
        },
      });

      return stock;
    });
  }

  /**
   * Enrolls a pharmacy invoice/order from prescription file
   */
  async createPharmacyOrder(
    tenantId: string,
    operatorId: string,
    dto: CreatePharmacyOrderDto,
  ): Promise<any> {
    this.logger.log(`Enrolling new pharmacy order for patient ID: ${dto.patientId}`);

    // Validate patient profile
    const patientRecord = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patientRecord) {
      throw new NotFoundException('Patient record context does not match tenancy workspace.');
    }

    // Validate prescription if attached
    if (dto.prescriptionId) {
      const rx = await this.prisma.prescription.findFirst({
        where: { id: dto.prescriptionId, tenantId, patientId: dto.patientId },
      });
      if (!rx) {
        throw new BadRequestException('Catalog violation: Selection refers to an invalid or unmatched prescription.');
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.pharmacyOrder.create({
        data: {
          tenantId,
          prescriptionId: dto.prescriptionId || null,
          patientId: dto.patientId,
          status: 'IN_PREPARATION',
          totalCost: dto.totalCost,
        },
        include: {
          patient: {
            include: { user: true },
          },
          prescription: true,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'PREPARE_PHARMACY_ORDER',
          targetResource: `pharmacy/orders/${order.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
        },
      });

      return order;
    });
  }

  /**
   * Finalizes medication dispensing, performing atomic inventory stock deductions based on FIFO/FEFO rules
   */
  async dispenseMedications(
    tenantId: string,
    operatorId: string,
    orderId: string,
  ): Promise<any> {
    this.logger.log(`Performing FIFO/FEFO medication dispense on Pharmacy Order ID: ${orderId}`);

    const order = await this.prisma.pharmacyOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        prescription: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pharmacy order reference not resolved.');
    }

    if (order.status === 'COLLECTED') {
      throw new BadRequestException('Medication Dispensing violation: selected order has already been dispensed.');
    }

    // Capture pharmacist context
    const pharmacist = await this.prisma.employee.findFirst({
      where: { tenantId, userId: operatorId, department: 'PHARMACY' },
    });

    if (!pharmacist) {
      throw new BadRequestException('Security mismatch: only active Pharmacy staff can dispense active medication orders.');
    }

    if (!order.prescription) {
      throw new BadRequestException('Verification exception: pharmacy order lacks a linked clinical prescription table.');
    }

    const restockWarnings: string[] = [];

    // Process nested database operations
    const result = await this.prisma.$transaction(async (tx) => {
      // Loop through all medicine items within prescription
      for (const rxItem of order.prescription!.items) {
        let remainingToDeduct = rxItem.quantityRequired;

        // Trace active inventory stock items matching medicine ID, ordered by FEFO (First Expired, First Out)
        const inventoryBatches = await tx.inventoryItem.findMany({
          where: {
            tenantId,
            medicineId: rxItem.medicineId,
            stockQty: { gt: 0 },
            status: { not: 'EXPIRED' },
          },
          orderBy: {
            expiryDate: 'asc', // FEFO priority order
          },
        });

        const totalBatchStock = inventoryBatches.reduce((acc, curr) => acc + curr.stockQty, 0);

        if (totalBatchStock < remainingToDeduct) {
          throw new BadRequestException(
            `Medication Shortage Error: Insufficient stock levels in system for Medicine ID: ${rxItem.medicineId}. ` +
            `Requested: ${remainingToDeduct}, Available active stock: ${totalBatchStock}.`
          );
        }

        // Subtract quantity across active batches following FEFO
        for (const batch of inventoryBatches) {
          if (remainingToDeduct <= 0) break;

          if (batch.stockQty >= remainingToDeduct) {
            const finalQty = batch.stockQty - remainingToDeduct;
            remainingToDeduct = 0;

            await tx.inventoryItem.update({
              where: { id: batch.id },
              data: {
                stockQty: finalQty,
                status: finalQty <= batch.safetyStockQty ? 'SHORTAGE' : 'ACTIVE',
              },
            });

            if (finalQty <= batch.safetyStockQty) {
              restockWarnings.push(
                `Warning: Batch code ${batch.batchNumber} has fallen below target safety stock levels! Qty left: ${finalQty}`
              );
            }
          } else {
            remainingToDeduct -= batch.stockQty;

            await tx.inventoryItem.update({
              where: { id: batch.id },
              data: {
                stockQty: 0,
                status: 'SHORTAGE',
              },
            });

            restockWarnings.push(`Warning: Batch code ${batch.batchNumber} is now fully depleted (0 Qty)!`);
          }
        }
      }

      // Record dispensation completion
      const updatedOrder = await tx.pharmacyOrder.update({
        where: { id: orderId },
        data: {
          status: 'COLLECTED',
          pharmacistId: pharmacist.id,
        },
        include: {
          patient: {
            include: { user: true },
          },
        },
      });

      // Post audit logging
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'DISPENSE_PHARMACEUTICAL_ORDER',
          targetResource: `pharmacy/orders/${orderId}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            dispensedItemsCount: order.prescription!.items.length,
            restockWarnings,
          },
        },
      });

      return updatedOrder;
    });

    return {
      success: true,
      order: result,
      restockWarnings,
    };
  }

  /**
   * Retrieves pharmacy orders lists
   */
  async listOrders(
    tenantId: string,
    queryParams: { patientId?: string; status?: string },
  ): Promise<any[]> {
    const where: any = { tenantId };
    if (queryParams.patientId) where.patientId = queryParams.patientId;
    if (queryParams.status) where.status = queryParams.status;

    return await this.prisma.pharmacyOrder.findMany({
      where,
      include: {
        patient: {
          include: { user: true },
        },
        pharmacist: {
          include: { user: true },
        },
        prescription: true,
      },
      orderBy: { orderedAt: 'desc' },
    });
  }

  /**
   * Fetches active stock levels metrics for dashboard tracking panels
   */
  async getStockAlerts(tenantId: string): Promise<any[]> {
    return await this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        OR: [
          { status: 'SHORTAGE' },
          { expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }, // Expiring within 30 days
        ],
      },
      include: {
        medicine: true,
      },
    });
  }
}
