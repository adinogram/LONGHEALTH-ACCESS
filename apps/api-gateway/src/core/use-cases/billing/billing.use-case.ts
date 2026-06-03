/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateInvoiceDto, RecordPaymentDto, SubmitClaimDto, ReconcileClaimDto } from './dto/billing.dto';

@Injectable()
export class BillingUseCase {
  private readonly logger = new Logger(BillingUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new patient billing invoice
   */
  async createInvoice(
    tenantId: string,
    operatorId: string,
    dto: CreateInvoiceDto,
  ): Promise<any> {
    this.logger.log(`Creating billing invoice inside isolation boundary [Tenant: ${tenantId}]`);

    // Verify patient profile
    const patientRecord = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patientRecord) {
      throw new NotFoundException('Patient record mismatch within selected corporate tenant namespace.');
    }

    // Mathematical calculations
    const discount = dto.discount || 0;
    const tax = dto.tax || 0;
    const grandTotal = Number(dto.totalAmount) - Number(discount) + Number(tax);

    if (grandTotal < 0) {
      throw new BadRequestException('Calculation violation: grand total amount cannot be a negative value.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const invoice = await tx.billingInvoice.create({
        data: {
          tenantId,
          patientId: dto.patientId,
          totalAmount: dto.totalAmount,
          discount: discount,
          tax: tax,
          grandTotal: grandTotal,
          balanceAmount: grandTotal,
          status: 'UNPAID',
        },
        include: {
          patient: {
            include: { user: true },
          },
        },
      });

      // Commit audit trail
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'CREATE_BILLING_INVOICE',
          targetResource: `patients/${dto.patientId}/invoices/${invoice.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            grandTotal,
            totalAmount: dto.totalAmount,
            discount,
          },
        },
      });

      return invoice;
    });
  }

  /**
   * Records payment transactions against patient invoices
   */
  async recordPayment(
    tenantId: string,
    operatorId: string,
    invoiceId: string,
    dto: RecordPaymentDto,
  ): Promise<any> {
    this.logger.log(`Recording payment on invoice ID ${invoiceId}`);

    const invoice = await this.prisma.billingInvoice.findFirst({
      where: { id: invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoicing document match failure within registered tenancy.');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Accounting state conflict: selected invoice has already been fully paid.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const currentBalance = Number(invoice.balanceAmount);
      const paymentAmount = Number(dto.amountPaid);

      let newBalance = currentBalance - paymentAmount;
      let newStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';

      if (newBalance <= 0) {
        newBalance = 0;
        newStatus = 'PAID';
      } else if (newBalance < Number(invoice.grandTotal)) {
        newStatus = 'PARTIAL';
      }

      const updated = await tx.billingInvoice.update({
        where: { id: invoiceId },
        data: {
          balanceAmount: newBalance,
          status: newStatus,
          paymentMethod: dto.paymentMethod as any,
        },
        include: {
          patient: {
            include: { user: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'RECORD_BILLING_PAYMENT',
          targetResource: `patients/${invoice.patientId}/invoices/${invoiceId}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            amountPaid: paymentAmount,
            paymentMethod: dto.paymentMethod,
            newBalance,
            newStatus,
          },
        },
      });

      return updated;
    });
  }

  /**
   * Electronically submits an insurance claim against an active invoice
   */
  async submitInsuranceClaim(
    tenantId: string,
    operatorId: string,
    invoiceId: string,
    dto: SubmitClaimDto,
  ): Promise<any> {
    this.logger.log(`Filing corporate insurance claim on invoice: ${invoiceId}`);

    const invoice = await this.prisma.billingInvoice.findFirst({
      where: { id: invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Associated invoice not found within patient record limits.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const claim = await tx.insuranceClaim.create({
        data: {
          tenantId,
          invoiceId,
          providerName: dto.providerName,
          policyNumber: dto.policyNumber,
          groupNumber: dto.groupNumber || null,
          claimedAmount: dto.claimedAmount,
          status: 'SUBMITTED',
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'SUBMIT_INSURANCE_CLAIM',
          targetResource: `billing/claims/${claim.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            invoiceId,
            claimedAmount: dto.claimedAmount,
            providerName: dto.providerName,
          },
        },
      });

      return claim;
    });
  }

  /**
   * Reconciles insurance claims payouts, applying approved capital to invoice balances
   */
  async reconcileClaim(
    tenantId: string,
    operatorId: string,
    claimId: string,
    dto: ReconcileClaimDto,
  ): Promise<any> {
    this.logger.log(`Processing clearance audit on insurance claim ID: ${claimId}`);

    const claim = await this.prisma.insuranceClaim.findUnique({
      where: { id: claimId },
      include: { invoice: true },
    });

    if (!claim || claim.tenantId !== tenantId) {
      throw new NotFoundException('Selected insurance claim was not found.');
    }

    if (claim.status === 'APPROVED' || claim.status === 'REJECTED') {
      throw new BadRequestException('State violation: claim has already been resolved.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update claim status
      const updatedClaim = await tx.insuranceClaim.update({
        where: { id: claimId },
        data: {
          status: dto.status as any,
          approvedAmount: dto.approvedAmount || 0,
        },
      });

      // If approved, apply amount as payment on connected invoice
      let updatedInvoice = claim.invoice;
      if (dto.status === 'APPROVED' && dto.approvedAmount && dto.approvedAmount > 0) {
        const currentBalance = Number(claim.invoice.balanceAmount);
        const approvedVal = Number(dto.approvedAmount);

        let newBalance = currentBalance - approvedVal;
        let newStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';

        if (newBalance <= 0) {
          newBalance = 0;
          newStatus = 'PAID';
        } else if (newBalance < Number(claim.invoice.grandTotal)) {
          newStatus = 'PARTIAL';
        }

        updatedInvoice = await tx.billingInvoice.update({
          where: { id: claim.invoiceId },
          data: {
            balanceAmount: newBalance,
            status: newStatus,
            paymentMethod: 'INSURANCE',
          },
        });
      }

      // Record HIPAA audit trails on payment updates
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'RECONCILE_INSURANCE_CLAIM',
          targetResource: `billing/claims/${claimId}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            status: dto.status,
            approvedAmount: dto.approvedAmount,
            resultingInvoiceBalance: updatedInvoice.balanceAmount,
          },
        },
      });

      return {
        claim: updatedClaim,
        invoice: updatedInvoice,
      };
    });
  }

  /**
   * Lists billing audit records
   */
  async listInvoices(
    tenantId: string,
    queryParams: { status?: string; patientId?: string },
  ): Promise<any[]> {
    const where: any = { tenantId };
    if (queryParams.status) where.status = queryParams.status;
    if (queryParams.patientId) where.patientId = queryParams.patientId;

    return await this.prisma.billingInvoice.findMany({
      where,
      include: {
        patient: {
          include: { user: true },
        },
        insuranceClaims: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
