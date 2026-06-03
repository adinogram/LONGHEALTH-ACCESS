/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { CryptoUtils } from '../auth/utils/crypto.utils';

@Injectable()
export class PatientUseCase {
  private readonly logger = new Logger(PatientUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registers a new patient, atomically provisioning their user identity login block with tenant containment
   */
  async registerPatient(
    tenantId: string,
    operatorId: string,
    dto: CreatePatientDto,
  ): Promise<any> {
    this.logger.log(`Executing Patient registration flow [Tenant: ${tenantId}] - ${dto.email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(`Registered user found matching email ${dto.email} inside tenant.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Generate unique sequential patient code
      const currentCount = await tx.patient.count({ where: { tenantId } });
      const year = new Date().getFullYear();
      const patientCode = `LH-PAT-${year}-${(currentCount + 1).toString().padStart(5, '0')}`;

      // 2. Hash default secure patient password
      const passwordHash = CryptoUtils.hashPassword('PatientLongHealthPrivate123!');

      // 3. Create core User profile
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          passwordHash,
          role: 'PATIENT',
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isActive: true,
        },
      });

      // 4. Create matching Patient registration entry
      const patient = await tx.patient.create({
        data: {
          tenantId,
          userId: user.id,
          patientCode,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender as any,
          bloodGroup: dto.bloodGroup as any,
          emergencyContact: dto.emergencyContact,
          address: dto.address,
          status: (dto.status || 'OUTPATIENT') as any,
        },
        include: {
          user: true,
        },
      });

      // 5. Commit HIPAA audit control
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'REGISTER_PATIENT_RECORD',
          targetResource: `patients/${patient.id}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          originalPayload: {
            patientCode,
            email: dto.email,
            status: patient.status,
          },
        },
      });

      return patient;
    });
  }

  /**
   * Updates clinical patient files within tenant sandboxing
   */
  async updatePatient(
    tenantId: string,
    operatorId: string,
    patientId: string,
    dto: UpdatePatientDto,
  ): Promise<any> {
    this.logger.log(`Modifying clinical record files for patient ID: ${patientId}`);

    const record = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: { user: true },
    });

    if (!record) {
      throw new NotFoundException(`Patient clinical profile not found inside your tenant domain.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Update general user credential settings if passed
      if (dto.firstName || dto.lastName || dto.phone) {
        await tx.user.update({
          where: { id: record.userId },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
          },
        });
      }

      // 2. Perform field mutations mapping and cleanings
      const patientUpdateData: any = {};
      if (dto.dateOfBirth) patientUpdateData.dateOfBirth = new Date(dto.dateOfBirth);
      if (dto.gender) patientUpdateData.gender = dto.gender as any;
      if (dto.bloodGroup) patientUpdateData.bloodGroup = dto.bloodGroup as any;
      if (dto.emergencyContact !== undefined) patientUpdateData.emergencyContact = dto.emergencyContact;
      if (dto.address !== undefined) patientUpdateData.address = dto.address;
      if (dto.status) patientUpdateData.status = dto.status as any;

      const updatedPatient = await tx.patient.update({
        where: { id: patientId },
        data: patientUpdateData,
        include: {
          user: true,
        },
      });

      // 3. Commit modification delta logging
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'UPDATE_PATIENT_RECORD',
          targetResource: `patients/${patientId}`,
          requestIp: '127.0.0.1',
          userAgent: 'LONGHEALTH Management System Core',
          changeDelta: { ...dto },
        },
      });

      return updatedPatient;
    });
  }

  /**
   * Retrieves single patient clinical chart
   */
  async findPatientById(tenantId: string, operatorId: string, patientId: string): Promise<any> {
    const record = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: {
        user: true,
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 5,
        },
        prescriptions: {
          orderBy: { issuedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Patient clinical document was not found inside matches.`);
    }

    // HIPAA audit logging for security monitoring on single records access
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        operatorId,
        action: 'ACCESS_PATIENT_CHART_DETAIL',
        targetResource: `patients/${patientId}`,
        requestIp: '127.0.0.1',
        userAgent: 'LONGHEALTH Management System Core',
      },
    });

    return record;
  }

  /**
   * Lists patients inside this modular tenant domain
   */
  async listPatients(
    tenantId: string,
    queryParams: { status?: string; search?: string; skip?: number; take?: number },
  ): Promise<any> {
    const { status, search, skip = 0, take = 50 } = queryParams;

    const whereClause: any = {
      tenantId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { patientCode: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, patients] = await Promise.all([
      this.prisma.patient.count({ where: whereClause }),
      this.prisma.patient.findMany({
        where: whereClause,
        include: {
          user: true,
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { patientCode: 'asc' },
      }),
    ]);

    return {
      total,
      patients,
      skip,
      take,
    };
  }
}
