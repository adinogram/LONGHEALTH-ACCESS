/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreatePrescriptionDto } from './dto/emr.dto';

@Injectable()
export class EmrUseCase {
  private readonly logger = new Logger(EmrUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Electronically issues a new clinical prescription and records diagnoses
   */
  async issuePrescription(
    tenantId: string,
    operatorId: string,
    dto: CreatePrescriptionDto,
  ): Promise<any> {
    this.logger.log(`Issuing new prescription under isolation domain [Tenant: ${tenantId}]`);

    // 1. Resolve clinical doctor context mapping operator login id
    const docEmployee = await this.prisma.employee.findFirst({
      where: { tenantId, userId: operatorId, department: 'GENERAL_PRACTICE' },
    });

    if (!docEmployee) {
      throw new BadRequestException('Security violation: operating credentials do not belong to an active prescribing Physician.');
    }

    // 2. Resolve patient record state
    const patientRecord = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patientRecord) {
      throw new NotFoundException(`Patient lookup failure: profile does not exist inside your isolation workspace.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // 3. Validate every requested medicine item matches active tenant medicines catalog
      for (const item of dto.items) {
        const med = await tx.medicine.findFirst({
          where: { id: item.medicineId, tenantId },
        });
        if (!med) {
          throw new NotFoundException(`Catalog violation: Medicine ${item.medicineId} is not registered in this hospital catalog.`);
        }
      }

      // 4. If an appointment encounter is mapped, check and verify
      if (dto.appointmentId) {
        const apt = await tx.appointment.findFirst({
          where: { id: dto.appointmentId, tenantId, patientId: dto.patientId },
        });
        if (!apt) {
          throw new BadRequestException('Clinical scheduling context: Selected appointment encounter is invalid.');
        }
      }

      // 5. Commit main Prescription chart
      const prescription = await tx.prescription.create({
        data: {
          tenantId,
          appointmentId: dto.appointmentId || null,
          doctorId: docEmployee.id,
          patientId: dto.patientId,
          diagnosis: dto.diagnosis,
          notes: dto.notes,
        },
      });

      // 6. Commit child item entities matching dosing directives
      const itemCreates = dto.items.map(item => ({
        prescriptionId: prescription.id,
        medicineId: item.medicineId,
        dosage: item.dosage,
        frequency: item.frequency,
        durationDayCount: item.durationDayCount,
        route: item.route,
        quantityRequired: item.quantityRequired,
      }));

      await tx.prescriptionItem.createMany({
        data: itemCreates,
      });

      // 7. Commit HIPAA clinical access audit
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'ISSUE_PRESCRIPTION_EMR',
          targetResource: `patients/${dto.patientId}/prescriptions/${prescription.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            diagnosis: dto.diagnosis,
            prescribedItemsCount: dto.items.length,
          },
        },
      });

      // Fetch completed prescription with relational subfields
      return await tx.prescription.findUnique({
        where: { id: prescription.id },
        include: {
          items: {
            include: {
              medicine: true,
            },
          },
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true },
          },
        },
      });
    });
  }

  /**
   * Retrieves fine-grained single prescription file details
   */
  async getPrescription(tenantId: string, operatorId: string, prescriptionId: string): Promise<any> {
    const record = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, tenantId },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { user: true },
        },
        appointment: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Clinical prescription index not found under matching tenancy.');
    }

    // Capture access trails on sensitive records
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        operatorId,
        action: 'ACCESS_PRESCRIPTION_CHART_DETAIL',
        targetResource: `patients/${record.patientId}/prescriptions/${prescriptionId}`,
        requestIp: '127.0.0.1',
        userAgent: 'LONGHEALTH Management System Core',
      },
    });

    return record;
  }

  /**
   * Retrieves medical chart histories for selected patient
   */
  async getPatientMedicalHistory(
    tenantId: string,
    operatorId: string,
    patientId: string,
  ): Promise<any> {
    const records = await this.prisma.prescription.findMany({
      where: { patientId, tenantId },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        doctor: {
          include: { user: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        operatorId,
        action: 'ACCESS_PATIENT_CLINICAL_TIMELINE',
        targetResource: `patients/${patientId}/prescriptions`,
        requestIp: '127.0.0.1',
        userAgent: 'LONGHEALTH Management System Core',
      },
    });

    return records;
  }
}
