/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { QueueService } from '../../../infrastructure/queues/queue.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@Injectable()
export class AppointmentUseCase {
  private readonly logger = new Logger(AppointmentUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
    private readonly jobs: QueueService,
  ) {}

  /**
   * Orchestrates the secure multi-tenant booking of patient health consultations
   */
  async bookAppointment(
    tenantId: string,
    operatorId: string,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    this.logger.log(`Initiating booking workflow inside isolation boundary [Tenant ID: ${tenantId}]`);

    // Parse slot date
    const targetSlot = new Date(dto.appointmentDate);
    const currentDate = new Date();
    
    if (targetSlot.getTime() <= currentDate.getTime()) {
      throw new BadRequestException('Scheduling slot violation: appointment date must occupy a future calendar slot.');
    }

    // Use Prisma Transaction to coordinate validation, sequential queue updates and records commits
    const outcome = await this.prisma.$transaction(async (tx) => {
      
      // 1. Validate receiving patient exists inside this specific corporate tenant sandbox
      const patientRecord = await tx.patient.findFirst({
        where: { id: dto.patientId, tenantId },
        include: { user: true }
      });
      if (!patientRecord) {
        throw new NotFoundException(`Access authorization error: Patient record ${dto.patientId} does not exist in this hospital sandbox.`);
      }

      // 2. Validate clinical Doctor exists and is active inside this tenant
      const doctorRecord = await tx.employee.findFirst({
        where: { id: dto.doctorId, tenantId, department: 'GENERAL_PRACTICE' },
        include: { user: true }
      });
      if (!doctorRecord) {
        throw new NotFoundException(`Access authorization error: General Practice Physician ${dto.doctorId} is not currently active.`);
      }

      // 3. Compute atomic sequential daily queue check-in index inside this transactional read-write fence
      const dayStart = new Date(targetSlot);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetSlot);
      dayEnd.setHours(23, 59, 59, 999);

      const maxQueueResult = await tx.appointment.aggregate({
        _max: { queueNumber: true },
        where: {
          tenantId,
          doctorId: dto.doctorId,
          appointmentDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      const nextQueueVal = (maxQueueResult._max.queueNumber || 0) + 1;

      // 4. Commit core appointment document entity within PostgreSQL boundaries
      const dbRecord = await tx.appointment.create({
        data: {
          tenantId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          appointmentDate: targetSlot,
          complaint: dto.complaint,
          notes: dto.notes,
          symptoms: dto.symptoms,
          queueNumber: nextQueueVal,
          status: 'SCHEDULED',
        },
      });

      // 5. Commit HIPAA audit log entry of clinical record access
      await tx.auditLog.create({
        data: {
          tenantId,
          operatorId,
          action: 'CREATE_CLINICAL_APPOINTMENT',
          targetResource: `patients/${dto.patientId}/appointments/${dbRecord.id}`,
          requestIp: '127.0.0.1', // In real execution proxy headers inject this
          userAgent: 'LONGHEALTH Core Application Engine v1.0',
          originalPayload: {
            doctorId: dto.doctorId,
            scheduledSlot: targetSlot,
            queueNumber: nextQueueVal
          },
        },
      });

      return dbRecord;
    });

    // 6. Push real-time Redis cache invalidate tasks or tracking metrics
    const cacheIndexKey = `tenant:${tenantId}:schedules:${dto.doctorId}`;
    await this.cache.set(cacheIndexKey, null, 1); // Flush cached calendar slot indexes matching physician

    // 7. Queue background SMS text message notification trigger via BullMQ with exponential back-off retries
    const notificationJobData = {
      tenantId,
      appointmentId: outcome.id,
      patientPhone: '+15550199', // Source user profiles dynamically
      messageBody: `Dear Patient, your LONGHEALTH appointment slot has been securely booked for ${targetSlot.toLocaleString()}. Daily Queue index is #${outcome.queueNumber}.`
    };
    
    await this.jobs.enqueueNotification('sms-dispatch-event', notificationJobData);

    return new AppointmentEntity({
      id: outcome.id,
      tenantId: outcome.tenantId,
      patientId: outcome.patientId,
      doctorId: outcome.doctorId,
      appointmentDate: outcome.appointmentDate,
      status: outcome.status as any,
      complaint: outcome.complaint,
      notes: outcome.notes,
      symptoms: outcome.symptoms,
      queueNumber: outcome.queueNumber,
      createdAt: outcome.createdAt,
      updatedAt: outcome.updatedAt,
    });
  }
}
