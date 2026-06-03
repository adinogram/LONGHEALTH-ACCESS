/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatientEntity } from '../entities/patient.entity';
import { AppointmentEntity } from '../entities/appointment.entity';

export interface IDatabaseRepository {
  findPatientById(tenantId: string, id: string): Promise<PatientEntity | null>;
  findPatientByCode(tenantId: string, code: string): Promise<PatientEntity | null>;
  createAppointment(tenantId: string, data: Partial<AppointmentEntity>): Promise<AppointmentEntity>;
  findAppointmentsByDoctor(tenantId: string, doctorId: string, date: Date): Promise<AppointmentEntity[]>;
  getMaxQueueNumber(tenantId: string, doctorId: string, date: Date): Promise<number>;
  createAuditLog(tenantId: string, log: {
    operatorId?: string;
    action: string;
    targetResource: string;
    requestIp?: string;
    userAgent?: string;
    originalPayload?: any;
    changeDelta?: any;
  }): Promise<void>;
}
