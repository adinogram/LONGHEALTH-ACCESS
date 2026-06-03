/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { OrderTestDto, UpdateResultsDto } from './dto/laboratory.dto';

@Injectable()
export class LaboratoryUseCase {
  private readonly logger = new Logger(LaboratoryUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Electronically orders a laboratory diagnostic test for a patient
   */
  async orderTest(
    tenantId: string,
    operatorId: string,
    dto: OrderTestDto,
  ): Promise<any> {
    this.logger.log(`Ordering diagnostic test index ${dto.testId} inside tenant ${tenantId}`);

    // Verify patient profile
    const patientRecord = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patientRecord) {
      throw new NotFoundException('Patient record mismatch within selected corporate tenant namespace.');
    }

    // Verify laboratory catalog test exists
    const testCatalog = await this.prisma.laboratoryTest.findFirst({
      where: { id: dto.testId, tenantId },
    });

    if (!testCatalog) {
      throw new NotFoundException('Selected laboratory test code was not found inside catalog.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const report = await tx.labReport.create({
        data: {
          tenantId,
          testId: dto.testId,
          patientId: dto.patientId,
          appointmentId: dto.appointmentId || null,
          status: 'PENDING',
        },
        include: {
          test: true,
          patient: {
            include: { user: true },
          },
        },
      });

      // Commit audit trail for record creation
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'ORDER_LABORATORY_TEST',
          targetResource: `patients/${dto.patientId}/lab_reports/${report.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            testId: dto.testId,
            testName: testCatalog.testName,
          },
        },
      });

      return report;
    });
  }

  /**
   * Commits structured result values and metrics by active laboratory technicians
   */
  async updateResults(
    tenantId: string,
    operatorId: string,
    reportId: string,
    dto: UpdateResultsDto,
  ): Promise<any> {
    this.logger.log(`Recording diagnostic results on report ID: ${reportId}`);

    const report = await this.prisma.labReport.findFirst({
      where: { id: reportId, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Selected laboratory report index was not found.');
    }

    // Verify operator belongs to LABORATORY department employee profile
    const labEmployee = await this.prisma.employee.findFirst({
      where: { tenantId, userId: operatorId, department: 'LABORATORY' },
    });

    if (!labEmployee) {
      throw new BadRequestException('Security credential clash: operator is not an active Laboratory staff member.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.labReport.update({
        where: { id: reportId },
        data: {
          resultData: dto.resultData,
          attachmentUrl: dto.attachmentUrl || null,
          technicianId: labEmployee.id,
          status: dto.status as any,
        },
        include: {
          test: true,
          patient: {
            include: { user: true },
          },
        },
      });

      // Audit logs
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'UPDATE_LABORATORY_RESULTS',
          targetResource: `patients/${report.patientId}/lab_reports/${reportId}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            status: dto.status,
            metricKeys: Object.keys(dto.resultData),
          },
        },
      });

      return updated;
    });
  }

  /**
   * Finalizes, signs, and authorizes laboratory reports, releasing results
   */
  async releaseReport(
    tenantId: string,
    operatorId: string,
    reportId: string,
  ): Promise<any> {
    this.logger.log(`Authorizing final medical release on laboratory report: ${reportId}`);

    const report = await this.prisma.labReport.findFirst({
      where: { id: reportId, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Laboratory report reference not resolved.');
    }

    if (report.status === 'FINAL') {
      throw new BadRequestException('Clinical workflow state error: report is already signed and released.');
    }

    const labEmployee = await this.prisma.employee.findFirst({
      where: { tenantId, userId: operatorId, department: 'LABORATORY' },
    });

    if (!labEmployee) {
      throw new BadRequestException('Security mismatch: only authorized Laboratory directors can sign off releases.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.labReport.update({
        where: { id: reportId },
        data: {
          status: 'FINAL',
          releasedAt: new Date(),
        },
        include: {
          test: true,
          patient: {
            include: { user: true },
          },
          technician: {
            include: { user: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'RELEASE_LABORATORY_REPORT_FINAL',
          targetResource: `patients/${report.patientId}/lab_reports/${reportId}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
        },
      });

      return updated;
    });
  }

  /**
   * Lists laboratory files matching filters
   */
  async listReports(
    tenantId: string,
    queryParams: { patientId?: string; status?: string },
  ): Promise<any[]> {
    const where: any = { tenantId };
    if (queryParams.patientId) where.patientId = queryParams.patientId;
    if (queryParams.status) where.status = queryParams.status;

    return await this.prisma.labReport.findMany({
      where,
      include: {
        test: true,
        patient: {
          include: { user: true },
        },
        technician: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
