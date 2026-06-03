/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, Link2, Key, List, Eye, ShieldCheck, 
  UserCheck, AlertTriangle, FileSpreadsheet, ArrowRight, Table 
} from 'lucide-react';

interface DBTableField {
  name: string;
  type: string;
  attributes?: string[];
  isPK?: boolean;
  isFK?: boolean;
  desc: string;
}

interface DBTable {
  name: string;
  description: string;
  fields: DBTableField[];
  indexes: string[];
  constraints: string[];
  relations: string[];
}

interface ModuleSchema {
  id: string;
  title: string;
  description: string;
  tables: DBTable[];
  auditStrategy: string;
}

const DATABASE_MODULES_DATA: ModuleSchema[] = [
  {
    id: 'patients',
    title: 'Patients Management',
    description: 'Tracks diagnostic profiles, demographic states, blood classifications, and addresses isolated securely underneath individual corporate tenant containers.',
    auditStrategy: 'Accessing or editing basic patient demographics metadata triggers an automatic immutable entry containing Operator PID, client state IP, event tags, and dynamic signature within public.audit_logs.',
    tables: [
      {
        name: 'patients',
        description: 'Primary clinical registry holding sensitive patient health records.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], isPK: true, desc: 'Global unique clinical primary key identity.' },
          { name: 'tenant_id', type: 'VARCHAR(50)', attributes: ['NOT NULL', 'FK REFERENCES tenants(id)'], isFK: true, desc: 'Tenant isolation boundary key.' },
          { name: 'user_id', type: 'UUID', attributes: ['NOT NULL', 'UNIQUE', 'FK REFERENCES users(id)'], isFK: true, desc: 'Underlying federated security identity pairing.' },
          { name: 'patient_code', type: 'VARCHAR(100)', attributes: ['NOT NULL'], desc: 'Client visible readable medical report number.' },
          { name: 'date_of_birth', type: 'TIMESTAMPTZ', attributes: ['NOT NULL'], desc: 'Patient DOB used in dosage computation algorithms.' },
          { name: 'gender', type: 'VARCHAR(20)', attributes: ['NOT NULL'], desc: 'MALE, FEMALE, or OTHER.' },
          { name: 'blood_group', type: 'VARCHAR(10)', desc: 'Clinical classifications (e.g. O_POSITIVE, AB_NEGATIVE).' },
          { name: 'emergency_contact', type: 'VARCHAR(255)', desc: 'Next of kin telephone.' },
          { name: 'address', type: 'TEXT', desc: 'Secure medical mail address.' },
          { name: 'status', type: 'VARCHAR(30)', attributes: ['DEFAULT OUTPATIENT'], desc: 'INPATIENT, OUTPATIENT, OBSERVATION, or DISCHARGED.' }
        ],
        indexes: [
          'CREATE INDEX idx_patients_tenant_status ON public.patients (tenant_id, status);',
          'CREATE UNIQUE INDEX uq_tenant_patient_code ON public.patients (tenant_id, patient_code);'
        ],
        constraints: [
          'UNIQUE (tenant_id, patient_code) - guarantees code uniqueness within hospital client limits.',
          'FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE',
          'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
        ],
        relations: [
          '1:1 relationship with public.users (federated accounts authentication mapping).',
          '1:N relationship with public.appointments (consultation registries).',
          '1:N relationship with public.billing_invoices (invoices balance ledger).'
        ]
      }
    ]
  },
  {
    id: 'doctors',
    title: 'Doctors & Specialties',
    description: 'Models consultation roles, room assignments, specific diagnostic pricing, and active shift/on-call configurations.',
    auditStrategy: 'Doctor fee modifications or room handovers are committed to audit tracking tables to prevent financial transaction fraud.',
    tables: [
      {
        name: 'doctor_configs',
        description: 'Contains sub-specialty definitions, fee matrices, and on-call metadata.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Record ID.' },
          { name: 'employee_id', type: 'UUID', attributes: ['UNIQUE', 'FK REFERENCES employees(id)'], isFK: true, desc: 'Underlying employee record.' },
          { name: 'consulting_fee', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Charge fee applied during appointment checkout.' },
          { name: 'room_id', type: 'VARCHAR(50)', desc: 'Clinical consulting room index (e.g., Ward 4B).' },
          { name: 'on_call_status', type: 'BOOLEAN', attributes: ['DEFAULT false'], desc: 'Indicates live dispatch availability for emergency websockets.' }
        ],
        indexes: [
          'CREATE UNIQUE INDEX uq_doctor_employee ON public.doctor_configs (employee_id);'
        ],
        constraints: [
          'CHECK (consulting_fee >= 0.00)',
          'FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE'
        ],
        relations: [
          '1:1 relationship with public.employees (inherits overall personnel properties).',
          'Provides indirect relation to patient prescriptions.'
        ]
      }
    ]
  },
  {
    id: 'appointments',
    title: 'Appointments & Queue Scheduling',
    description: 'Drives clinical traffic flow, patient room check-ins, queue sequence indexes, and referral statuses.',
    auditStrategy: 'Patient queue cancellations or check-in telemetry are logged directly for queue utilization analytics.',
    tables: [
      {
        name: 'appointments',
        description: 'Triggers clinical queues and forms the target bridge between Patients and Doctors.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Unique booking hash.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Isolation namespace identifier.' },
          { name: 'patient_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES patients(id)'], isFK: true, desc: 'Linked patient identity.' },
          { name: 'doctor_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES employees(id)'], isFK: true, desc: 'Target consulting clinical authority.' },
          { name: 'appointment_date', type: 'TIMESTAMPTZ', attributes: ['NOT NULL'], desc: 'Scheduled calendar slot timestamp.' },
          { name: 'status', type: 'VARCHAR(30)', attributes: ['DEFAULT SCHEDULED'], desc: 'SCHEDULED, CHECKED_IN, COMPLETED, CANCELLED, or NO_SHOW.' },
          { name: 'complaint', type: 'TEXT', desc: 'Patient-submitted primary chief concerns.' },
          { name: 'notes', type: 'TEXT', desc: 'Physician notes compiled in consultation session.' },
          { name: 'symptoms', type: 'TEXT', desc: 'Checked symptoms during pre-screening.' },
          { name: 'queue_number', type: 'INT', attributes: ['NOT NULL'], desc: 'Sequential daily index value used by queue displays.' }
        ],
        indexes: [
          'CREATE INDEX idx_appts_date_status ON public.appointments (tenant_id, appointment_date, status);',
          'CREATE INDEX idx_appts_patient ON public.appointments (tenant_id, patient_id);'
        ],
        constraints: [
          'FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE',
          'FOREIGN KEY (doctor_id) REFERENCES employees(id) ON DELETE CASCADE',
          'CHECK (queue_number > 0)'
        ],
        relations: [
          '1:N relationship (an Appointment can link to a single Prescription and multiple LabReports).'
        ]
      }
    ]
  },
  {
    id: 'billing',
    title: 'Billing, Invoices & Claims',
    description: 'Calculates clinical dues, applies tax matrices, records payments, and submits insurance claims processing packets.',
    auditStrategy: 'Invoice creation or balance-due updates generate locked immutable ledger rows. Cash collection events are validated by Accountant user signatures.',
    tables: [
      {
        name: 'billing_invoices',
        description: 'Core revenue ledger, tracking cash sales vs insurance guarantees.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Billing system invoice hash.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Primary isolation index.' },
          { name: 'patient_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES patients(id)'], isFK: true, desc: 'Billing recipient.' },
          { name: 'receptionist_id', type: 'UUID', desc: 'Billed operator.' },
          { name: 'total_amount', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Base clinical total fees sum.' },
          { name: 'discount', type: 'DECIMAL(10,2)', attributes: ['DEFAULT 0.00'], desc: 'Voucher or corporate plan discount deduction.' },
          { name: 'tax', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Regional medical services taxes.' },
          { name: 'grand_total', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Net billing balance due. [Total - Discount + Tax]' },
          { name: 'balance_amount', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Outstanding debt amount remaining.' },
          { name: 'status', type: 'VARCHAR(20)', attributes: ['DEFAULT UNPAID'], desc: 'UNPAID, PARTIAL, PAID, or VOID.' },
          { name: 'payment_method', type: 'VARCHAR(20)', desc: 'CASH, CARD, WIRE, or INSURANCE.' }
        ],
        indexes: [
          'CREATE INDEX idx_billing_patient ON public.billing_invoices (tenant_id, patient_id);',
          'CREATE INDEX idx_billing_outstanding ON public.billing_invoices (tenant_id, status) WHERE status IN (\'UNPAID\', \'PARTIAL\');'
        ],
        constraints: [
          'CHECK (grand_total = total_amount - discount + tax)',
          'CHECK (balance_amount >= 0)'
        ],
        relations: [
          '1:N relationship (Invoices are associated with Insurance Claims).'
        ]
      },
      {
        name: 'insurance_claims',
        description: 'Third-party coverage records processing insurance claims logs.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Claim identifier.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Tenant mapping ID.' },
          { name: 'invoice_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES billing_invoices(id)'], isFK: true, desc: 'Source invoice linkage.' },
          { name: 'provider_name', type: 'VARCHAR(150)', attributes: ['NOT NULL'], desc: 'Insurance provider entity (e.g. Allianz, Bupa).' },
          { name: 'policy_number', type: 'VARCHAR(100)', attributes: ['NOT NULL'], desc: 'Policy authorization token.' },
          { name: 'claimed_amount', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Requested reimbursement.' },
          { name: 'approved_amount', type: 'DECIMAL(10,2)', desc: 'Payer approved reimbursement.' },
          { name: 'status', type: 'VARCHAR(30)', attributes: ['DEFAULT SUBMITTED'], desc: 'SUBMITTED, PROCESSING, APPROVED, or REJECTED.' }
        ],
        indexes: [],
        constraints: [
          'FOREIGN KEY (invoice_id) REFERENCES billing_invoices(id) ON DELETE CASCADE'
        ],
        relations: [
          'Belongs directly to billing invoices.'
        ]
      }
    ]
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy Orders & Prescriptions',
    description: 'Schedules prescription instructions, maps medicinal quantities, routes drug routes, and registers pharmacist release handoffs.',
    auditStrategy: 'Opiate or specialized pharmacology releases trigger active auditable cryptographic hashes validating dispensing workflows.',
    tables: [
      {
        name: 'prescriptions',
        description: 'Clinical prescription directives formulated inside consultation instances.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Prescription registry hash.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'System hospital partition.' },
          { name: 'appointment_id', type: 'UUID', attributes: ['UNIQUE', 'FK REFERENCES appointments(id)'], isFK: true, desc: 'Parent clinical session.' },
          { name: 'doctor_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES employees(id)'], isFK: true, desc: 'Issuing medical authority.' },
          { name: 'patient_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES patients(id)'], isFK: true, desc: 'Receiving patient record.' },
          { name: 'diagnosis', type: 'TEXT', attributes: ['NOT NULL'], desc: 'Diagnosis mapping triggering the prescription.' },
          { name: 'issued_at', type: 'TIMESTAMPTZ', attributes: ['DEFAULT NOW()'], desc: 'Prescription signature date.' }
        ],
        indexes: [
          'CREATE INDEX idx_presc_patient ON public.prescriptions (tenant_id, patient_id);'
        ],
        constraints: [
          'FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL'
        ],
        relations: [
          '1:N relations with prescription_items and pharmacy_orders.'
        ]
      }
    ]
  },
  {
    id: 'laboratory',
    title: 'Laboratory Diagnostics',
    description: 'Handles requests, patient specimen codes, diagnostics machinery JSON dumps, and document file attachments.',
    auditStrategy: 'Lab reports require electronic verification signatures. Access patterns to sensitive pathology reports are fully audited.',
    tables: [
      {
        name: 'lab_reports',
        description: 'Stores pathological analysis results and diagnostic file registries.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Test report global registry ID.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Subdomain sandbox identifier.' },
          { name: 'test_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES laboratory_tests(id)'], isFK: true, desc: 'Target catalog test record.' },
          { name: 'patient_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES patients(id)'], isFK: true, desc: 'Specimen donor patient.' },
          { name: 'technician_id', type: 'UUID', isFK: true, desc: 'Responsible lab pathologist employee.' },
          { name: 'result_data', type: 'JSONB', desc: 'Machine numerical parameters and diagnostic readings.' },
          { name: 'attachment_url', type: 'VARCHAR(2048)', desc: 'Secure AWS S3 encrypted PDF or DICOM object key.' },
          { name: 'status', type: 'VARCHAR(25)', attributes: ['DEFAULT PENDING'], desc: 'PENDING, PROCESSING, REVIEW, or FINAL.' }
        ],
        indexes: [
          'CREATE INDEX idx_lab_report_status ON public.lab_reports (tenant_id, patient_id, status);'
        ],
        constraints: [
          'FOREIGN KEY (test_id) REFERENCES laboratory_tests(id) ON DELETE CASCADE',
          'FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE'
        ],
        relations: [
          'Integrates with patients and laboratory reference tables.'
        ]
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory & Supplies',
    description: 'Monitors real-time medical stock, storage indices (cabinets/shelves), wholesale cost ledgers, and expiry locks.',
    auditStrategy: 'Inventory adjustments generate logging alerts to prevent pharmacy volume shrinkage.',
    tables: [
      {
        name: 'inventory_items',
        description: 'Underlying batch registry of on-shelf pharmaceutical stock.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Supply tracking hash.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Hospital instance.' },
          { name: 'medicine_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES medicines(id)'], isFK: true, desc: 'Associated drug definition.' },
          { name: 'batch_number', type: 'VARCHAR(50)', attributes: ['NOT NULL'], desc: 'Manufacturer batch code.' },
          { name: 'manufacture_date', type: 'TIMESTAMPTZ', attributes: ['NOT NULL'], desc: 'Drug manufacture Date.' },
          { name: 'expiry_date', type: 'TIMESTAMPTZ', attributes: ['NOT NULL'], desc: 'Expiration watch deadline.' },
          { name: 'stock_qty', type: 'INT', attributes: ['NOT NULL'], desc: 'Current items physically on shelf.' },
          { name: 'safety_stock_qty', type: 'INT', attributes: ['NOT NULL'], desc: 'Alert threshold trigger value.' },
          { name: 'unit_cost', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Wholesale cost database metric.' },
          { name: 'retail_price', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Prescription price tier.' }
        ],
        indexes: [
          'CREATE INDEX idx_inventory_exps ON public.inventory_items (tenant_id, expiry_date);',
          'CREATE INDEX idx_inventory_med_status ON public.inventory_items (tenant_id, medicine_id, status);'
        ],
        constraints: [
          'CHECK (stock_qty >= 0)',
          'CHECK (safety_stock_qty >= 0)',
          'FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE'
        ],
        relations: [
          'Linked to master drug list public.medicines.'
        ]
      }
    ]
  },
  {
    id: 'employees',
    title: 'Employees & Staff Roles',
    description: 'Maintains critical compliance listings for hospital personnel, specialty profiles, active statuses, and professional credentials.',
    auditStrategy: 'Personnel profiles and salary structures require executive approval, with changes recorded in core audit logging tables.',
    tables: [
      {
        name: 'employees',
        description: 'Contains clinical credentials and general personnel records.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Unique employee ID.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Target tenant instance.' },
          { name: 'user_id', type: 'UUID', attributes: ['UNIQUE', 'FK REFERENCES users(id)'], isFK: true, desc: 'Linked authentication user profile.' },
          { name: 'employee_code', type: 'VARCHAR(100)', attributes: ['NOT NULL'], desc: 'Unique staff catalog identifier.' },
          { name: 'department', type: 'VARCHAR(40)', attributes: ['NOT NULL'], desc: 'CARDIOLOGY, PHARMACY, LAB, FINANCE, ADMIN, etc.' },
          { name: 'specialty', type: 'VARCHAR(150)', desc: 'Medical specialist scope.' },
          { name: 'license_number', type: 'VARCHAR(100)', desc: 'State professional practicing license authorization.' },
          { name: 'hire_date', type: 'TIMESTAMPTZ', attributes: ['NOT NULL'], desc: 'Start date of hire.' },
          { name: 'status', type: 'VARCHAR(30)', attributes: ['DEFAULT ACTIVE'], desc: 'ACTIVE, ON_LEAVE, SUSPENDED, or TERMINATED.' }
        ],
        indexes: [
          'CREATE INDEX idx_employees_dept ON public.employees (tenant_id, department, status);',
          'CREATE UNIQUE INDEX uq_tenant_staff_code ON public.employees (tenant_id, employee_code);'
        ],
        constraints: [
          'UNIQUE (tenant_id, employee_code)',
          'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
        ],
        relations: [
          '1:1 relation with public.users (auth profile mapping).',
          '1:1 optional extension to public.doctor_configs.'
        ]
      }
    ]
  },
  {
    id: 'payroll',
    title: 'Payroll Ledgers',
    description: 'Compiles basic monthly wages, computes allowances, processes tax withholdings, and tracks payroll payouts.',
    auditStrategy: 'Finance ledgers and pay slip approvals require explicit double-entry verification signatures from Accountant registers.',
    tables: [
      {
        name: 'payroll_records',
        description: 'Detailed logs mapping monthly employee wage statements.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Pay slip database identifier.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Primary isolation index.' },
          { name: 'employee_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES employees(id)'], isFK: true, desc: 'Beneficiary staff node.' },
          { name: 'accountant_id', type: 'UUID', isFK: true, desc: 'Approving finance operator employee.' },
          { name: 'basic_salary', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Pre-tax base salary value.' },
          { name: 'allowances', type: 'DECIMAL(10,2)', attributes: ['DEFAULT 0.00'], desc: 'Extra allowances (e.g., night shift bonus).' },
          { name: 'deductions', type: 'DECIMAL(10,2)', attributes: ['DEFAULT 0.00'], desc: 'Tax withholdings or healthcare deductions.' },
          { name: 'net_salary', type: 'DECIMAL(10,2)', attributes: ['NOT NULL'], desc: 'Net cash payout calculated in ledger.' },
          { name: 'status', type: 'VARCHAR(25)', attributes: ['DEFAULT DRAFT'], desc: 'DRAFT, APPROVED, or PAID.' }
        ],
        indexes: [
          'CREATE INDEX idx_payroll_slips ON public.payroll_records (tenant_id, employee_id, status);'
        ],
        constraints: [
          'CHECK (net_salary = basic_salary + allowances - deductions)',
          'FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE'
        ],
        relations: [
          'Belongs directly to public.employees (beneficiary).'
        ]
      }
    ]
  },
  {
    id: 'notifications',
    title: 'System Notifications',
    description: 'Orchestrates outbound patient alert messages (critical blood test updates, prescriptions, reminders) via SMS, email, in-app notifications, or WebSocket channels.',
    auditStrategy: 'Alert logs keep delivery traces, capturing dispatch timestamp receipts and network response headers.',
    tables: [
      {
        name: 'notifications',
        description: 'Communication dispatch records tracking system messages.',
        fields: [
          { name: 'id', type: 'UUID', attributes: ['PRIMARY KEY'], isPK: true, desc: 'Notification identifier.' },
          { name: 'tenant_id', type: 'UUID', attributes: ['NOT NULL'], desc: 'Subdomain partition mapping.' },
          { name: 'recipient_id', type: 'UUID', attributes: ['NOT NULL', 'FK REFERENCES users(id)'], isFK: true, desc: 'Receiving user account.' },
          { name: 'notification_type', type: 'VARCHAR(25)', attributes: ['NOT NULL'], desc: 'SMS, EMAIL, APP, or WEBSOCKET.' },
          { name: 'category', type: 'VARCHAR(30)', attributes: ['NOT NULL'], desc: 'APPOINTMENT, BILL_PAID, CRISIS, RX, or LAB.' },
          { name: 'title', type: 'VARCHAR(255)', attributes: ['NOT NULL'], desc: 'Log header summary.' },
          { name: 'message', type: 'TEXT', attributes: ['NOT NULL'], desc: 'Alert corpus body text.' },
          { name: 'is_read', type: 'BOOLEAN', attributes: ['DEFAULT false'], desc: 'Status flag tracking user views in-app.' }
        ],
        indexes: [
          'CREATE INDEX idx_notification_user ON public.notifications (tenant_id, recipient_id, is_read);'
        ],
        constraints: [
          'FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE'
        ],
        relations: [
          'Maps directly to target users in public.users.'
        ]
      }
    ]
  }
];

export const DatabaseDesignView: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('patients');

  const activeModule = DATABASE_MODULES_DATA.find(m => m.id === selectedModuleId) || DATABASE_MODULES_DATA[0];

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm shadow-xl" id="database-design-view-comp">
      
      {/* Informative Header */}
      <div className="border-b border-slate-800/60 pb-4 mb-6">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Production-Grade PostgreSQL Dynamic Schema Hub
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Explore complete PostgreSQL schemas, multi-tenant relationship structures, physical file indexing strategies, and HIPAA compliant auditing across all ten main modules.
        </p>
      </div>

      {/* Interactive ER Mapping Diagram Overview */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4.5 mb-6">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-3.5 flex items-center gap-1.5 font-bold">
          <Link2 className="w-3.5 h-3.5 text-indigo-400" /> Core Multi-Tenant Database ER Map (Simplified Schema)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-[11px] font-mono">
          
          <div className="border border-indigo-500/30 bg-indigo-950/20 p-2.5 rounded-lg">
            <div className="font-bold text-indigo-300">Tenant (PK)</div>
            <p className="text-[9px] text-slate-500 mt-1">Subdomains Registry</p>
          </div>

          <div className="flex items-center justify-center text-slate-600 hidden md:flex">
            <ArrowRight className="w-4 h-4 animate-pulse text-slate-600" />
          </div>

          <div className="border border-emerald-500/30 bg-emerald-950/20 p-2.5 rounded-lg col-span-1">
            <div className="font-bold text-emerald-300">User (PK)</div>
            <p className="text-[9px] text-slate-500 mt-1">Tenant ID RLS Sec</p>
          </div>

          <div className="flex items-center justify-center text-slate-600 hidden md:flex">
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </div>

          <div className="border border-violet-500/30 bg-violet-950/20 p-2.5 rounded-lg">
            <div className="font-bold text-violet-300">Employees / Dr.</div>
            <p className="text-[9px] text-slate-500 mt-1">Staff & Configs</p>
          </div>

          <div className="border border-blue-500/30 bg-blue-950/20 p-2.5 rounded-lg">
            <div className="font-bold text-blue-300">Patients</div>
            <p className="text-[9px] text-slate-500 mt-1">Surgical & Clinical</p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-[11.5px] font-mono mt-3">
          <div className="border border-emerald-950/40 bg-slate-900/40 p-2 w-full rounded text-slate-400">
            📋 Appointments (Dr & Patients link)
          </div>
          <div className="border border-emerald-950/40 bg-slate-900/40 p-2 w-full rounded text-slate-400">
            💊 Prescriptions & Pharmacy Orders
          </div>
          <div className="border border-emerald-950/40 bg-slate-900/40 p-2 w-full rounded text-slate-400">
            🧪 Laboratory Tests & Report Attachments
          </div>
          <div className="border border-emerald-950/40 bg-slate-900/40 p-2 w-full rounded text-slate-400">
            💳 Billing Invoices & Insurance Claims
          </div>
          <div className="border border-emerald-950/40 bg-slate-900/40 p-2 w-full rounded text-slate-400">
            ⚖️ Audit Logs & System Notifications
          </div>
        </div>
      </div>

      {/* Modular Database Tab Splitter */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Module Selector Sidebar */}
        <div className="xl:col-span-3 space-y-1.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block pl-2 pb-2 border-b border-slate-900 mb-2">
            Clinical Schema Blocks ({DATABASE_MODULES_DATA.length})
          </span>
          <div className="space-y-1 max-h-[360px] overflow-y-auto">
            {DATABASE_MODULES_DATA.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModuleId(m.id)}
                className={`w-full text-left font-mono text-xs px-3 py-2.5 rounded-md transition duration-200 cursor-pointer ${
                  selectedModuleId === m.id
                    ? 'bg-emerald-600 font-bold text-slate-100 shadow-md border-r-4 border-emerald-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/55'
                }`}
              >
                🏥 {m.title}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Schema Visualizer Output Panel */}
        <div className="xl:col-span-9 space-y-5">
          
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            
            {/* Header Description info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  DATABASE ENGINE SPEC
                </span>
                <span className="text-xs text-slate-500 font-mono">Module: {activeModule.id.toUpperCase()}</span>
              </div>
              <h4 className="text-base font-bold text-slate-200 tracking-tight mt-1">
                {activeModule.title} Domain Model Schema
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {activeModule.description}
              </p>
            </div>

            {/* Structured Table Schema Field mappings */}
            {activeModule.tables.map((table, tIdx) => (
              <div key={tIdx} className="space-y-3.5 pt-2 border-t border-slate-900">
                <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-bold">SQL TABLE:</span>
                  <span className="font-mono text-xs text-emerald-300 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    public.{table.name}
                  </span>
                  <span className="text-[11px] text-slate-500 italic hidden sm:inline">— {table.description}</span>
                </div>

                {/* Table Fields Grid */}
                <div className="overflow-x-auto rounded-lg border border-slate-900">
                  <table className="w-full text-[11.5px] font-mono leading-relaxed text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Field Name</th>
                        <th className="p-2.5">Data Type</th>
                        <th className="p-2.5">SQL Attributes / Constraints</th>
                        <th className="p-2.5">Operational Details / Metadata Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 bg-slate-950/20">
                      {table.fields.map((f, fIdx) => (
                        <tr key={fIdx} className="hover:bg-slate-900/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-slate-300 flex items-center gap-1.5">
                            {f.isPK && <Key className="w-3 h-3 text-yellow-500 shrink-0" title="Primary Key" />}
                            {f.isFK && <Link2 className="w-3 h-3 text-indigo-400 shrink-0" title="Foreign Key Dependency" />}
                            {f.name}
                          </td>
                          <td className="p-2.5 text-indigo-300">{f.type}</td>
                          <td className="p-2.5">
                            {f.attributes && f.attributes.length > 0 ? (
                              <div className="flex flex-wrap gap-1 text-[9.5px]">
                                {f.attributes.map((attr, aIdx) => (
                                  <span key={aIdx} className="bg-slate-900/80 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                                    {attr}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-400 leading-normal">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Additional Indexes Map */}
                {table.indexes && table.indexes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-500 flex items-center gap-1">
                      <List className="w-3 h-3 text-emerald-400" /> Physical Database Indexes
                    </span>
                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10.5px] text-slate-300 leading-relaxed overflow-x-auto">
                      <code>{table.indexes.join('\n')}</code>
                    </pre>
                  </div>
                )}

                {/* DB Constraints specifications */}
                {table.constraints && table.constraints.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> SQL Constraints & Isolation Guardrails
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {table.constraints.map((c, cIdx) => (
                        <div key={cIdx} className="bg-slate-900/40 p-2 rounded text-slate-400 text-xs font-mono flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Auditing Governance Compliance strategies */}
            {activeModule.auditStrategy && (
              <div className="bg-rose-950/10 border border-rose-500/25 p-4 rounded-xl space-y-2 mt-4">
                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-rose-500 shrink-0" /> HIPAA Medical Record Auditing Strategy
                </h5>
                <p className="text-xs text-rose-300 leading-relaxed">
                  {activeModule.auditStrategy}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
