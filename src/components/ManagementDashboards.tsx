/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, TrendingUp, Users, Activity, Layers, ArrowUpRight, CheckCircle, 
  Clock, ShieldAlert, BarChart3, Receipt, FileSpreadsheet, Send, ShieldCheck, Info,
  Search, Filter, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { ClinicalRole, BillingClaim, EMRLogEvent } from '../types';

interface ManagementDashboardsProps {
  role: 'admin' | 'accountant';
  isDark: boolean;
  billingClaims: BillingClaim[];
  setBillingClaims: React.Dispatch<React.SetStateAction<BillingClaim[]>>;
  emrLogs: EMRLogEvent[];
}

export const ManagementDashboards: React.FC<ManagementDashboardsProps> = ({
  role,
  isDark,
  billingClaims,
  setBillingClaims,
  emrLogs
}) => {
  // Accountant States
  const [accountantActionLogs, setAccountantActionLogs] = useState<string[]>([
    'Dispatched electronic claim #BCB-0281 to Blue Cross Blue Shield.',
    'Aetna invoice #AET-1029 reviewed & cleared by Senior Scribe.',
    'Reconciled Stripe payouts for May 2026 operations cycle.'
  ]);

  // Recharts Mock Datasets
  const revenueChartData = [
    { name: 'Monday', billing: 12400, payout: 9800 },
    { name: 'Tuesday', billing: 14500, payout: 11100 },
    { name: 'Wednesday', billing: 16800, payout: 13500 },
    { name: 'Thursday', billing: 20100, payout: 17200 },
    { name: 'Friday', billing: 18500, payout: 14805 },
    { name: 'Saturday', billing: 9200, payout: 8100 },
    { name: 'Sunday', billing: 8400, payout: 7500 }
  ];

  const distributionChartData = [
    { name: 'Cardiology', value: 380, color: '#10b981' },
    { name: 'General Medicine', value: 540, color: '#2563eb' },
    { name: 'Pediatrics', value: 290, color: '#f59e0b' },
    { name: 'Neurology', value: 160, color: '#8b5cf6' },
    { name: 'Oncology', value: 124, color: '#ec4899' }
  ];

  // Accountant: Settle claim
  const handleSettleClaim = (id: string, insCode: string) => {
    setBillingClaims(prev => prev.map(claim => {
      if (claim.id === id) {
        return { ...claim, status: 'Completed' };
      }
      return claim;
    }));
    setAccountantActionLogs(prev => [`Settled insurance invoice claim #${id} (${insCode}). Funds released via ACH transport.`, ...prev]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Clinician Overview Badge */}
      <div className={`p-6 rounded-2xl border transition ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 block">
              {role === 'admin' ? <Building2 className="w-5 h-5 animate-pulse" /> : <Receipt className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-slate-950 dark:text-slate-100 uppercase tracking-tight">
                {role === 'admin' ? '⚙️ Administrative Command & Control Dashboard' : '💳 Med-Accounting & Insurance Claims Ledgers'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Domain Privilege: <strong>Enterprise Management & Audits</strong> • Station Token: <strong className="font-mono text-emerald-650 font-bold">STAF-ADM-2092</strong>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-500/15 text-rose-600 dark:text-rose-455 text-[10px] font-mono tracking-widest uppercase font-bold rounded border border-rose-500/10">
            SECURE EXEC ACCESS
          </span>
        </div>
      </div>

      {role === 'admin' && (
        /* ================= ADMINISTRATOR VIEW ================= */
        <div className="space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Total Encase Occupancy</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">88.4%</span>
                <span className="text-emerald-600 text-xs font-semibold font-mono font-bold">+2.4%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Ward B capacity currently mapped. Bed Cardio 04 holds telemetry focus.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Dispatched Payouts Claims</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">$98,005</span>
                <span className="text-emerald-600 text-xs font-semibold font-mono font-bold">Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Integrated direct Stripe ledgers processed weekly across BCBS, Aetna.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Averaged Lab Turnaround</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">1.8 HR</span>
                <span className="text-emerald-600 text-xs font-semibold font-mono font-bold">Optimal</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Specimen tubes and troponin assay analysis processing times.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Active Telehealth Scheds</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">42 Calls</span>
                <span className="text-emerald-600 text-xs font-semibold font-mono font-bold">HL7 Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Secure browser WebRTC channels with active diagnostic assistants.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily billing collections - Recharts Bar Chart */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center gap-1.5 border-b pb-3">
                <BarChart3 className="w-4.5 h-4.5 text-emerald-600" />
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">Clinic Daily Billing Collections (Weekly Metrics)</h4>
              </div>

              <div className="h-64 mt-4 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={{ backgroundColor: isDark ? '#020617' : '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="billing" name="Gross Billing ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="payout" name="Direct Settled ($)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outpatient Specialty distribution - Recharts Pie Chart */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center gap-1.5 border-b pb-3">
                <Users className="w-4.5 h-4.5 text-emerald-600" />
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">Outpatient Allocations by Specialty Departments</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="h-64 md:col-span-7">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {distributionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#020617' : '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="md:col-span-5 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-2">Legend Metrics:</span>
                  {distributionChartData.map(entry => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{entry.value} Outp.</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Immutable HIPAA Access audits ledger */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">HIPAA Immutable Access Auditing Logs Ledger (24 HR Audits)</h4>
              </div>
              <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-red-500/10 text-rose-500 font-bold border border-red-500/15 animate-pulse">
                NON-REPUDIATION VERIFIED
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Under federal health informatics requirements, all query patterns, EHR pulls, and lab adjustments auto-register onto an immutable system audit. Deletions and file modifications are restricted.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-slate-500 border border-slate-500/10">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-350 border-b border-slate-500/10">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Operator / Clinician ID</th>
                    <th className="p-3">File Query Target</th>
                    <th className="p-3">Action Description</th>
                    <th className="p-3">Compliance Token</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10">
                  {emrLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-500/5 transition">
                      <td className="p-3 font-bold text-slate-600 dark:text-slate-400">{log.id}</td>
                      <td className="p-3 text-teal-650 font-bold">{log.user}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{log.target}</td>
                      <td className="p-3 italic">"{log.action}"</td>
                      <td className="p-3"><span className="text-[10px] bg-emerald-500/5 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SHA-256</span></td>
                      <td className="p-3 text-right text-[11px]">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {role === 'accountant' && (
        /* ================= ACCOUNTANT VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Outpatient billing ledger outstanding table */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-650" />
                  <span>Outpatient Med-Ledger Billing Invoices</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-455">Outstanding balances: {billingClaims.filter(c => c.status !== 'Completed').length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b font-semibold text-slate-850 dark:text-slate-350">
                    <tr>
                      <th className="p-3">Reference invoice</th>
                      <th className="p-3">Resident Patient</th>
                      <th className="p-3 text-center">Insurance Provider</th>
                      <th className="p-3 text-center">Billed Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingClaims.map(claim => (
                      <tr key={claim.id} className="border-b transition border-slate-500/10 hover:bg-slate-500/5">
                        <td className="p-3 font-mono text-[10px] font-bold text-slate-500">{claim.id}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{claim.patient}</td>
                        <td className="p-3 text-center font-bold font-mono text-[10px] text-teal-650">{claim.insCode}</td>
                        <td className="p-3 text-center font-mono font-bold">${claim.amount.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          {claim.status === 'Completed' ? (
                            <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-emerald-500/15 text-emerald-650 font-bold border border-emerald-500/20">
                              SETTLED PAY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-mono text-[9px] bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 animate-pulse">
                              CLAIM PENDING
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {claim.status !== 'Completed' && (
                            <button 
                              id={`settle-claim-btn-${claim.id}`}
                              onClick={() => handleSettleClaim(claim.id, claim.insCode)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition"
                            >
                              Settle Claim
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Accountant action ledgers logs */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h4 className="font-display font-medium text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider block">Auditing Action Logs</h4>
              
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {accountantActionLogs.map((log, i) => (
                  <div key={i} className="text-[11px] text-slate-550 leading-relaxed border-b border-slate-500/10 pb-1.5 last:border-b-0 font-sans">
                    • {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
