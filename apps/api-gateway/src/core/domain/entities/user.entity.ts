/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class UserEntity {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'RECEPTIONIST' | 'ACCOUNTANT' | 'PATIENT';
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  // Pure domain method verifying active account credentials state
  canAuthenticate(): boolean {
    return this.isActive === true;
  }
}
