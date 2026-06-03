/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AppointmentEntity {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  complaint?: string | null;
  notes?: string | null;
  symptoms?: string | null;
  queueNumber: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AppointmentEntity>) {
    Object.assign(this, partial);
  }

  // Pure domain constraint rule: block cancellation of completed sessions
  canCancel(): boolean {
    return this.status !== 'COMPLETED' && this.status !== 'CANCELLED';
  }

  // State Transition Machine
  transitionTo(newStatus: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'): void {
    if (this.status === 'COMPLETED' && newStatus === 'SCHEDULED') {
      throw new Error('Illegal transition: can not reschedule completed appointment.');
    }
    this.status = newStatus;
  }
}
