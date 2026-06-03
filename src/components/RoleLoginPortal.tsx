/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Stethoscope, ShieldCheck, HeartPulse, UserCheck, Key, ArrowRight,
  TrendingUp, Users, Activity, Layers, Activity as AlertIcon, Lock, 
  Sparkles, ShieldCheck as HospitalShield, Info
} from 'lucide-react';
import { ClinicalRole } from '../types';

interface RoleLoginPortalProps {
  onLogin: (role: ClinicalRole) => void;
  isDark: boolean;
}

export const RoleLoginPortal: React.FC<RoleLoginPortalProps> = ({ onLogin, isDark }) => {
  const loginRoles = [
    {
      id: 'patient' as ClinicalRole,
      title: 'Patient Portal',
      emoji: '🧑‍🦽',
      desc: 'Elderly friendly. Track diagnostics, make bookings, join WebRTC telehealth calls, pay insurance bills.',
      ownerName: 'Jane Miller (58y)',
      badge: 'Online Intake',
      themeClass: 'hover:-translate-y-1 hover:border-emerald-350 dark:hover:border-emerald-500 bg-emerald-50/20 text-emerald-800'
    },
    {
      id: 'doctor' as ClinicalRole,
      title: 'Attending Doctor',
      emoji: '🩺',
      desc: 'TriagePresented symptoms using AI, search ICD-10 diagnostics, write medication prescriptions.',
      ownerName: 'Dr. Evelyn Reed (Cardiology)',
      badge: 'EHR Access',
      themeClass: 'hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-500 bg-blue-50/20 text-blue-800'
    },
    {
      id: 'nurse' as ClinicalRole,
      title: 'Ward Nurse Duty Desk',
      emoji: '🏥',
      desc: 'Map 24/7 hospital bed structures, check continuous telemetry lines, update live vitals simulation.',
      ownerName: 'Nurse Mark Wilson (ICU Duty)',
      badge: 'Active Ward',
      themeClass: 'hover:-translate-y-1 hover:border-teal-350 dark:hover:border-teal-500 bg-teal-50/25 text-teal-850'
    },
    {
      id: 'pharmacist' as ClinicalRole,
      title: 'Pharmacy Dispensation Desk',
      emoji: '💊',
      desc: 'Approve doctor medication releases, handle low stock alerts, run automated restocks.',
      ownerName: 'Sarah Cho (Chief Pharmacist)',
      badge: 'Rx Inventory',
      themeClass: 'hover:-translate-y-1 hover:border-emerald-400 focus:border-emerald-500 bg-emerald-50/10'
    },
    {
      id: 'lab' as ClinicalRole,
      title: 'Laboratory Scientist Desk',
      emoji: '🔬',
      desc: 'Evaluate blood sputum specimens, process troponins tests, trigger critical diagnostic alerts.',
      ownerName: 'Dr. Liam Patel (Pathology)',
      badge: 'Diagnostic Labs',
      themeClass: 'hover:-translate-y-1 hover:border-indigo-300 bg-indigo-50/15'
    },
    {
      id: 'receptionist' as ClinicalRole,
      title: 'Admitting Receptionist',
      emoji: '🗓️',
      desc: 'Schedule appointment calendars, book incoming consultations, register insurance coverages.',
      ownerName: 'Angela Sterling (Front Desk)',
      badge: 'Appointment Desk',
      themeClass: 'hover:-translate-y-1 hover:border-amber-300 bg-amber-50/10'
    },
    {
      id: 'accountant' as ClinicalRole,
      title: 'Financial Accountant',
      emoji: '💳',
      desc: 'Audit insurance claims, process active billing, trigger direct secure Stripe payouts.',
      ownerName: 'Roger Vance (Med Account)',
      badge: 'Claims Ledgers',
      themeClass: 'hover:-translate-y-1 hover:border-purple-300 bg-purple-50/15'
    },
    {
      id: 'admin' as ClinicalRole,
      title: 'Operational Administrator',
      emoji: '⚙️',
      desc: 'Track hospital-wide revenue statistics, audit immutable HIPAA access files, configure systems.',
      ownerName: 'Chief of Clinical Operations',
      badge: 'Full Command',
      themeClass: 'hover:-translate-y-1 hover:border-slate-400 bg-slate-500/5'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Platform Branding Greeting Card with custom CSS Illustration */}
      <div className={`p-8 rounded-3xl border relative overflow-hidden transition-all shadow-md ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-br from-white to-emerald-50/40 border-slate-200'}`}>
        <div className="absolute top-0 right-0 -translate-y-10 translate-x-10 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-10 -translate-x-10 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[10px] uppercase font-mono tracking-widest font-bold">
            <HospitalShield className="w-3.5 h-3.5" />
            <span>24/7/365 Medical Platform Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            LONGHEALTH Clinical Workstation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
            A production-grade, highly consolidated platform used daily by doctors, admitting administrative officers, healthcare nurses, pharmacists, lab pathologists, medical accountants, and outpatients. Designed with a calming clinical white and emerald-green color theory, optimized to prevent visual strain and maximize treatment delivery.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> HIPAA Compliant Files</span>
            <span className="flex items-center gap-1"><HeartPulse className="w-4 h-4 text-emerald-500" /> HL7 FHIR Protocol Ready</span>
            <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-emerald-500" /> Dynamic AI Triage Assistant</span>
          </div>
        </div>

        {/* CSS Vector Illustration representing medical safety and care */}
        <div className="absolute right-6 bottom-6 hidden xl:block w-32 h-32 opacity-25 dark:opacity-10">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M50 30V70M30 50H70" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
            <path d="M50 42C53 35 63 35 66 40C69 45 60 55 50 63C40 55 31 45 34 40C37 35 47 35 50 42Z" fill="#10B981" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Choose Persona Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Multi-User Quick Login Portal</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a role to instantly test their custom dashboard workspace and clinical toolkits.</p>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded uppercase">
            Click to bypass passwords
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loginRoles.map((role) => (
            <button
              key={role.id}
              id={`quick-access-role-${role.id}`}
              onClick={() => onLogin(role.id)}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 group cursor-pointer ${
                isDark ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900' : 'bg-white border-slate-200'
              } ${role.themeClass}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{role.emoji}</span>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold font-mono bg-slate-500/5 text-slate-500 dark:text-slate-400">
                    {role.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {role.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-1">
                  {role.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-500/10 flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-500 dark:text-slate-400 font-mono">ID: {role.ownerName}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1.5 transition flex items-center gap-1">
                  <span>Enter</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Information footer warning banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-normal ${isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p>
          <strong>Security Protocol:</strong> In compliance with federal HIPAA laws, session access tokens are dynamically destroyed upon clicking and re-routing. LONGHEALTH maintains end-to-end data transmission audits, recorded in the administrative Ledger log records of every clinic tenant.
        </p>
      </div>
    </div>
  );
};
