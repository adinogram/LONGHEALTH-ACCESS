/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Pill, Activity, CalendarDays, RefreshCw, CheckCircle2, AlertTriangle, 
  UserCheck, ShieldCheck, Filter, FlaskConical, ClipboardList, Plus, AlertCircle,
  Truck, Archive, FileSpreadsheet, Hourglass, ArrowUpRight, Search, Play, Heart, Clock
} from 'lucide-react';
import { ClinicalRole, DrugStockItem, LabSpecimen } from '../types';

interface SupportServicesDashboardsProps {
  role: 'pharmacist' | 'lab' | 'receptionist';
  isDark: boolean;
  drugStock: DrugStockItem[];
  setDrugStock: React.Dispatch<React.SetStateAction<DrugStockItem[]>>;
  labSpecimens: LabSpecimen[];
  setLabSpecimens: React.Dispatch<React.SetStateAction<LabSpecimen[]>>;
  appointments: Array<any>;
  setAppointments: React.Dispatch<React.SetStateAction<Array<any>>>;
  activeDrugOrders: Array<{ drug: string; dosage: string; patient: string; timestamp: number }>;
}

export const SupportServicesDashboards: React.FC<SupportServicesDashboardsProps> = ({
  role,
  isDark,
  drugStock,
  setDrugStock,
  labSpecimens,
  setLabSpecimens,
  appointments,
  setAppointments,
  activeDrugOrders
}) => {
  // Pharmacist states
  const [dispenseLog, setDispenseLog] = useState<string[]>([
    'Dispensed Amoxicillin 500mg for PT-10029.',
    'Inventory threshold warning resolved on Metformin stocks.'
  ]);

  // Lab Pathology states
  const [labActionLogs, setLabActionLogs] = useState<string[]>([
    'Cardiac Enzymes panel series 1 resolved - Troponin 0.02 ng/mL (Normal)',
    'CBC complete blood count compiled for Roger Sterling.'
  ]);

  // Receptionist States
  const [admitPtName, setAdmitPtName] = useState<string>('');
  const [admitPtAge, setAdmitPtAge] = useState<number>(30);
  const [admitClin, setAdmitClin] = useState<string>('Family Outpatient Clinic');
  const [admitConfirmed, setAdmitConfirmed] = useState<boolean>(false);

  // Pharmacist: Restock medication
  const handleRestockDrug = (id: string) => {
    setDrugStock(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          stock: item.stock + 100,
          actionCode: 'OPTIMAL'
        };
      }
      return item;
    }));
    setDispenseLog(prev => [`Restocked 100 capsules to stock lines for Drug ID: ${id}`, ...prev]);
  };

  // Pharmacist: Dispense prescription
  const handleApprovePrescriptionDispensation = (drugName: string, patientName: string) => {
    // Decrease stock count
    setDrugStock(prev => prev.map(item => {
      if (item.name.toLowerCase().includes(drugName.split(' ')[0].toLowerCase())) {
        const nextStock = Math.max(0, item.stock - 1);
        return {
          ...item,
          stock: nextStock,
          actionCode: nextStock <= item.minThreshold ? 'LOW_STOCK' : 'OPTIMAL'
        };
      }
      return item;
    }));
    setDispenseLog(prev => [`Dispensed and approved ${drugName} for Patient ${patientName}. Issued prescription ledger clearance.`, ...prev]);
  };

  // Lab: Progress or complete specimens
  const handleCompleteSpecimen = (id: string, testName: string, patient: string) => {
    setLabSpecimens(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'Completed' };
      }
      return item;
    }));
    setLabActionLogs(prev => [`Analyzed specimen sample ID: ${id} (${testName}) for ${patient}. Status: COMPLIANT/RESOLVED.`, ...prev]);
  };

  // Receptionist: Add direct admin intake line
  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitPtName.trim()) return;

    const newAppt = {
      id: `APP-${Math.floor(Math.random() * 90000 + 10000)}`,
      patient: `${admitPtName} (${admitPtAge}y)`,
      department: admitClin,
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      notes: 'Urgent walkthrough receptionist register intake',
      status: 'Awaiting Intake Nurse'
    };

    setAppointments(prev => [newAppt, ...prev]);
    setAdmitConfirmed(true);
    setAdmitPtName('');
    setTimeout(() => setAdmitConfirmed(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Badge */}
      <div className={`p-6 rounded-2xl border transition ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 block">
              {role === 'pharmacist' ? <Pill className="w-5 h-5" /> : role === 'lab' ? <FlaskConical className="w-5 h-5 animate-pulse" /> : <CalendarDays className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-slate-950 dark:text-slate-100 uppercase tracking-tight">
                {role === 'pharmacist' ? '💊 FDA Approved Clinical Pharmacy Console' : role === 'lab' ? '🔬 Diagnostic Laboratory Specimen Pathology Lab' : '🗓️ Reception Admitting & Consultation Intake'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Auth Realm: <strong>Service Operations & Diagnostics</strong> • Local Station Node: <strong className="font-mono text-emerald-650 font-bold">NODE-SEC-7212</strong>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-teal-500/15 text-teal-700 dark:text-teal-400 text-[10px] font-mono tracking-widest uppercase font-bold rounded">
            HL7 / FDA INTEGRATED
          </span>
        </div>
      </div>

      {role === 'pharmacist' && (
        /* ================= PHARMACIST VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Drug inventory stock tracker */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-emerald-650" />
                  <span>Interactive Medication Stock Management Ledger</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Total Lines: {drugStock.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b font-semibold text-slate-800 dark:text-slate-350">
                    <tr>
                      <th className="p-3">Medication Name</th>
                      <th className="p-3">Category Group</th>
                      <th className="p-3 text-center">Dosage Units In Stock</th>
                      <th className="p-3 text-center">Safety Alert</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drugStock.map(drug => (
                      <tr key={drug.id} className="border-b transition border-slate-500/10 hover:bg-slate-500/5">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{drug.name}</td>
                        <td className="p-3">{drug.category}</td>
                        <td className="p-3 text-center font-mono font-bold">{drug.stock} Cap.</td>
                        <td className="p-3 text-center">
                          {drug.stock <= drug.minThreshold ? (
                            <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-red-500/10 text-rose-500 font-bold border border-red-500/15 animate-pulse">
                              RESTOCK REQUIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/15">
                              OPTIMAL LEVEL
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            id={`restock-btn-${drug.id}`}
                            onClick={() => handleRestockDrug(drug.id)}
                            className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-1 rounded hover:bg-emerald-500 transition"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Pharmacy queue */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h4 className="font-display font-medium text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider block">Incoming Clinic Rx Prescription Queue</h4>
              
              <div className="space-y-3">
                {activeDrugOrders.length === 0 ? (
                  <div className="p-4 text-center bg-slate-550/5 border border-dashed rounded-xl text-xs text-slate-400">
                    <span>No active prescription queues. Wait for doctor to issue orders.</span>
                  </div>
                ) : (
                  activeDrugOrders.map((ord, i) => (
                    <div key={i} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 font-sans space-y-2 border-slate-200 dark:border-slate-850">
                      <div className="flex justify-between items-start text-xs border-b pb-1.5 border-slate-500/10">
                        <div>
                          <strong className="text-slate-800 dark:text-slate-350">{ord.drug}</strong>
                          <span className="text-[10px] text-slate-500 block">Recipient: {ord.patient}</span>
                        </div>
                        <span className="text-[10px] text-teal-650 bg-teal-500/10 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">Awaiting Fill</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{ord.dosage}</p>
                      
                      <button 
                        id={`approve-dispense-btn-${i}`}
                        onClick={() => handleApprovePrescriptionDispensation(ord.drug, ord.patient)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold py-1.5 rounded transition"
                      >
                        Approve & Dispense Rx
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dispense Logs */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
              <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-205 uppercase tracking-wider block">Fulfillment Audit Trails</h4>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {dispenseLog.map((log, i) => (
                  <div key={i} className="text-[11px] text-slate-500 leading-relaxed border-b border-slate-500/10 pb-1 pb-1.5 last:border-b-0">
                    • {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'lab' && (
        /* ================= LAB SCIENCE VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Lab specimen pending panels */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-emerald-650" />
                  <span>Awaiting Specimens & Diagnostic Analyzers</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Pending: {labSpecimens.filter(s => s.status !== 'Completed').length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labSpecimens.map(spec => (
                  <div 
                    key={spec.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                      spec.status === 'Completed' ? 'opacity-70 bg-slate-50 dark:bg-slate-950/20' : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:border-emerald-350'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] bg-slate-550/10 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">ID: {spec.id}</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase gap-1 flex items-center ${
                          spec.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-650' : spec.status === 'In Processing' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{spec.status}</span>
                        </span>
                      </div>

                      <h5 className="font-display font-bold text-sm text-slate-900 dark:text-slate-200 mt-2">{spec.test}</h5>
                      <span className="text-xs text-slate-455 block mt-0.5">Patient: {spec.patient}</span>
                      <span className="text-[11px] text-slate-500 block font-mono mt-1">Sample Specimen: {spec.sample}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-500/10">
                      <span className="text-slate-455 font-mono">Elapsed: {spec.elapsed}</span>
                      {spec.status !== 'Completed' ? (
                        <button 
                          id={`complete-analyzer-spec-${spec.id}`}
                          onClick={() => handleCompleteSpecimen(spec.id, spec.test, spec.patient)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded transition"
                        >
                          Publish Results
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pathology Logger right column */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
              <h4 className="font-display font-medium text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider block">Lab Action Logs</h4>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {labActionLogs.map((log, i) => (
                  <div key={i} className="text-[11px] text-slate-500 leading-normal border-b border-slate-500/10 pb-1.5 last:border-b-0 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'receptionist' && (
        /* ================= RECEPTIONIST VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Admitting Intake direct register form */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Walk-through Outpatient Intake</span>
              </h4>

              <form onSubmit={handleAdmitSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Outpatient Full Name:</label>
                  <input 
                    type="text" placeholder="E.g., Clarissa Harlowe" 
                    value={admitPtName} onChange={(e) => setAdmitPtName(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Age (Years):</label>
                    <input 
                      type="number" value={admitPtAge} onChange={(e) => setAdmitPtAge(parseInt(e.target.value) || 28)}
                      className={`w-full p-2 rounded-lg border text-xs font-mono mb-1 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Intake Clinic:</label>
                    <select 
                      value={admitClin} onChange={(e) => setAdmitClin(e.target.value)}
                      className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option value="Cardiology">Prevention Cardiology</option>
                      <option value="General Medicine">General Medicine Outpatient</option>
                      <option value="Pediatrics">Family Pediatrics</option>
                      <option value="Neurology">Diagnostic Neurology</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  id="receptionist-admit-btn"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg transition"
                >
                  Register Admittance Intake
                </button>

                {admitConfirmed && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] rounded-lg leading-normal flex items-start gap-1.5 animate-flash">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span>Resident intake registered. Dispatched notification to assigned triage nurse ward lines.</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Admitted / consult sched calendar list */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-650" />
                  <span>Admitted Consultations Sched Ledger</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-455">Total: {appointments.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b font-semibold text-slate-800 dark:text-slate-350">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Outpatient Identity</th>
                      <th className="p-3">Admitting Clinic Specialty</th>
                      <th className="p-3">Intake Time</th>
                      <th className="p-3 text-right">Intake Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appt => (
                      <tr key={appt.id} className="border-b transition border-slate-500/10 hover:bg-slate-500/5">
                        <td className="p-3 font-mono text-[10px] font-bold text-slate-500">{appt.id}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{appt.patient}</td>
                        <td className="p-3">{appt.department}</td>
                        <td className="p-3 font-mono">{appt.date} • {appt.time}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-amber-500/10 text-amber-500 font-bold border border-amber-500/15">
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
