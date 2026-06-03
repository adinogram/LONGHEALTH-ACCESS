/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClinicalRole = 'doctor' | 'nurse' | 'admin' | 'pharmacist' | 'lab' | 'accountant' | 'receptionist' | 'patient';

export interface PatientVitals {
  hr: number;
  spo2: number;
  bpSystolic: number;
  bpDiastolic: number;
  temp: number;
  respiration: number;
}

export interface BedPlacement {
  id: string;
  pt: string;
  age: number;
  condition: string;
  room: string;
  telemetry: string;
}

export interface DrugStockItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  actionCode: 'OPTIMAL' | 'RESTOCK_REQ' | 'LOW_STOCK';
}

export interface LabSpecimen {
  id: string;
  test: string;
  patient: string;
  sample: string;
  elapsed: string;
  status: 'In Processing' | 'Completed' | 'Drawn / Transiting';
}

export interface BillingClaim {
  id: string;
  patient: string;
  insCode: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Overdue';
  provCode: string;
  date: string;
}

export interface EMRLogEvent {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  path: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
