/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AppPermission {
  // Patient record boundaries
  PATIENT_READ = 'patient:read',
  PATIENT_CREATE = 'patient:create',
  PATIENT_UPDATE = 'patient:update',
  PATIENT_DELETE = 'patient:delete',

  // Clinical operation boundaries
  APPOINTMENT_READ = 'appointment:read',
  APPOINTMENT_BOOK = 'appointment:book',
  APPOINTMENT_CANCEL = 'appointment:cancel',
  PRESCRIPTION_WRITE = 'prescription:write',
  PRESCRIPTION_READ = 'prescription:read',

  // Laboratory testing boundaries
  LAB_TEST_MANAGE = 'lab:manage',
  LAB_REPORT_RELEASE = 'lab:release',

  // Financial boundaries
  BILLING_READ = 'billing:read',
  BILLING_MANAGE = 'billing:manage',
  PAYROLL_RUN = 'payroll:run',

  // Administrator boundaries
  EMPLOYEE_MANAGE = 'employee:manage',
  AUDIT_READ = 'audit:read',
  TENANT_SETTINGS = 'tenant:write',
}

/**
 * Enterprise Static Permission Matrix Fallback
 * Used to bootstrap database-backed permissions and validate policies.
 */
export const DEFAULT_PERMISSION_MATRIX: Record<string, AppPermission[]> = {
  SUPER_ADMIN: Object.values(AppPermission),
  OWNER: Object.values(AppPermission),
  ADMIN: [
    AppPermission.PATIENT_READ,
    AppPermission.PATIENT_CREATE,
    AppPermission.PATIENT_UPDATE,
    AppPermission.APPOINTMENT_READ,
    AppPermission.APPOINTMENT_BOOK,
    AppPermission.APPOINTMENT_CANCEL,
    AppPermission.BILLING_READ,
    AppPermission.BILLING_MANAGE,
    AppPermission.EMPLOYEE_MANAGE,
    AppPermission.AUDIT_READ,
  ],
  DOCTOR: [
    AppPermission.PATIENT_READ,
    AppPermission.APPOINTMENT_READ,
    AppPermission.APPOINTMENT_BOOK,
    AppPermission.PRESCRIPTION_WRITE,
    AppPermission.PRESCRIPTION_READ,
    AppPermission.LAB_TEST_MANAGE,
    AppPermission.LAB_REPORT_RELEASE,
  ],
  NURSE: [
    AppPermission.PATIENT_READ,
    AppPermission.PATIENT_UPDATE,
    AppPermission.APPOINTMENT_READ,
    AppPermission.PRESCRIPTION_READ,
  ],
  PHARMACIST: [
    AppPermission.PATIENT_READ,
    AppPermission.PRESCRIPTION_READ,
    AppPermission.BILLING_READ,
  ],
  RECEPTIONIST: [
    AppPermission.PATIENT_READ,
    AppPermission.PATIENT_CREATE,
    AppPermission.PATIENT_UPDATE,
    AppPermission.APPOINTMENT_READ,
    AppPermission.APPOINTMENT_BOOK,
    AppPermission.APPOINTMENT_CANCEL,
    AppPermission.BILLING_READ,
    AppPermission.BILLING_MANAGE,
  ],
  ACCOUNTANT: [
    AppPermission.BILLING_READ,
    AppPermission.BILLING_MANAGE,
    AppPermission.PAYROLL_RUN,
  ],
  PATIENT: [
    AppPermission.PATIENT_READ,
    AppPermission.APPOINTMENT_READ,
    AppPermission.APPOINTMENT_BOOK,
    AppPermission.APPOINTMENT_CANCEL,
    AppPermission.PRESCRIPTION_READ,
    AppPermission.BILLING_READ,
  ],
};
