/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class PatientEntity {
  id: string;
  tenantId: string;
  userId: string;
  patientCode: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  status: 'OUTPATIENT' | 'INPATIENT' | 'OBSERVATION' | 'DISCHARGED';

  constructor(partial: Partial<PatientEntity>) {
    Object.assign(this, partial);
  }

  // Pure domain method checking clinical pediatric age constraints
  isChild(currentDate: Date = new Date()): boolean {
    const ageDiff = currentDate.getTime() - this.dateOfBirth.getTime();
    const ageDate = new Date(ageDiff);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    return calculatedAge < 18;
  }
}
