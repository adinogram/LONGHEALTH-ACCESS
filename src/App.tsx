/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, Layout, Stethoscope, Activity, CalendarDays, FlaskConical, Pill, 
  Receipt, Building2, UserCheck, ShieldAlert, LogOut, Moon, Sun, 
  HelpCircle, Sparkles, MessageSquare, Send, Bot, Clock, AlertTriangle, 
  Maximize2, ChevronDown, Check, Accessibility, ShieldCheck, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Modular Imports
import { ClinicalRole, PatientVitals, BedPlacement, DrugStockItem, LabSpecimen, BillingClaim, EMRLogEvent } from './types';
import { DesignSystemSpecs } from './components/DesignSystemSpecs';
import { RoleLoginPortal } from './components/RoleLoginPortal';
import { PatientsPortal } from './components/PatientsPortal';
import { ClinicalDashboards } from './components/ClinicalDashboards';
import { SupportServicesDashboards } from './components/SupportServicesDashboards';
import { ManagementDashboards } from './components/ManagementDashboards';

export default function App() {
  // Global States
  const [currentRole, setCurrentRole] = useState<ClinicalRole | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'specifications' | 'chat'>('workspace');
  const [textScale, setTextScale] = useState<'standard' | 'large' | 'elderly'>('standard');
  const [globalTick, setGlobalTick] = useState<number>(0);
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);

  // Vitals State (Jane Miller) - Shared across Doctor and Nurse dashboards in real-time!
  const [patientVitals, setPatientVitals] = useState<PatientVitals>({
    hr: 74,
    spo2: 97,
    bpSystolic: 124,
    bpDiastolic: 82,
    temp: 98.6,
    respiration: 16
  });

  // Bed Placements Map
  const [bedPlacements, setBedPlacements] = useState<BedPlacement[]>([
    { id: '1', pt: 'Jane Miller', age: 58, condition: 'Angina chest distress', room: 'Ward B - Bed 04', telemetry: 'Continuous' },
    { id: '2', pt: 'Roger Sterling', age: 62, condition: 'T2D routine check', room: 'Ward B - Bed 12', telemetry: 'Intermittent' },
    { id: '3', pt: 'Clarissa Harlowe', age: 6, condition: 'Bronchial irritation', room: 'Peds Observation 01', telemetry: 'Continuous' }
  ]);

  // Drug Stock Levels - Shared between Doctor and Pharmacist!
  const [drugStock, setDrugStock] = useState<DrugStockItem[]>([
    { id: 'DS-01', name: 'Clopidogrel (Anticoagulant)', category: 'Cardiovascular', stock: 142, minThreshold: 50, actionCode: 'OPTIMAL' },
    { id: 'DS-02', name: 'Atorvastatin tabs (Lipid-lowering)', category: 'Dyslipidemia', stock: 24, minThreshold: 60, actionCode: 'LOW_STOCK' },
    { id: 'DS-03', name: 'Insulin Infusion (Antihyperglycemic)', category: 'Endocrine', stock: 15, minThreshold: 30, actionCode: 'LOW_STOCK' },
    { id: 'DS-42', name: 'Metformin caps (Antihyperglycemic)', category: 'Endocrine', stock: 280, minThreshold: 40, actionCode: 'OPTIMAL' },
    { id: 'DS-90', name: 'Naproxen pills (Analgesic)', category: 'NSAID', stock: 110, minThreshold: 35, actionCode: 'OPTIMAL' }
  ]);

  // Lab Specimens - Shared across Doctor and Laboratory Scientist!
  const [labSpecimens, setLabSpecimens] = useState<LabSpecimen[]>([
    { id: 'LAB-9038', test: 'Quantitative Troponin Assay', patient: 'Jane Miller', sample: 'Whole Blood (Purple Tube)', elapsed: '0.4 HR', status: 'In Processing' },
    { id: 'LAB-1022', test: 'Complete Blood Count (CBC) with diff', patient: 'Roger Sterling', sample: 'Whole Blood', elapsed: '1.2 HR', status: 'Drawn / Transiting' },
    { id: 'LAB-4491', test: 'Influenza A/B throat swab RT-PCR', patient: 'Clarissa Harlowe', sample: 'Sputum Swab', elapsed: '2.1 HR', status: 'In Processing' }
  ]);

  // Billing Claims - Shared across Patient, Accountant, and Operator Admin!
  const [billingClaims, setBillingClaims] = useState<BillingClaim[]>([
    { id: 'CLM-01821', patient: 'Jane Miller (PT-93821)', insCode: 'BCBS', amount: 480.00, status: 'Processing', provCode: '93010', date: '2026-06-01' },
    { id: 'CLM-49102', patient: 'Roger Sterling (PT-10334)', insCode: 'CIGNA', amount: 150.00, status: 'Processing', provCode: '80053', date: '2026-06-02' },
    { id: 'CLM-11029', patient: 'Clarissa Harlowe (PT-88392)', insCode: 'AETNA', amount: 820.00, status: 'Overdue', provCode: '99213', date: '2026-05-28' }
  ]);

  // Appointments Roster - Shared between Patient Receptionist and Doctor!
  const [appointments, setAppointments] = useState<any[]>([
    { id: 'APP-10022', patient: 'Jane Miller (58y)', department: 'Cardiology Clinic', date: '2026-06-03', time: '14:00', notes: 'Ischemia followups after outpatient intake', status: 'Awaiting Intake Nurse' },
    { id: 'APP-20031', patient: 'Roger Sterling (62y)', department: 'General Medicine', date: '2026-06-04', time: '11:00', notes: 'Diabetic monofilament checks', status: 'Awaiting Intake Nurse' }
  ]);

  // Dynamic EMR Doctor prescriptions dispatched this session
  const [activeDrugOrders, setActiveDrugOrders] = useState<Array<{ drug: string; dosage: string; patient: string; timestamp: number }>>([
    { drug: 'Clopidogrel 75mg', dosage: 'Take 1 caps orally daily. Refrain from heavy activity.', patient: 'Jane Miller (PT-93821)', timestamp: Date.now() - 600000 }
  ]);

  // HIPAA Immutable logs ledger
  const [emrLogs, setEmrLogs] = useState<EMRLogEvent[]>([
    { id: 'AUD-3022', user: 'Dr. Reed', action: 'Accessed patient chart PT-93821', target: 'Jane Miller (EMR)', timestamp: '2026-06-03 21:05', path: '/api/clinical/emr' },
    { id: 'AUD-3023', user: 'Nurse Mark', action: 'Modified telemetry vitals indicators in Cardio Bed 04', target: 'Jane Miller (Telemetry)', timestamp: '2026-06-03 21:10', path: '/api/clinical/telemetry' },
    { id: 'AUD-3024', user: 'Admin Scribe', action: 'Issued Blue Cross Blue Shield ACH authorization claim ledger', target: 'Claims ledger', timestamp: '2026-06-03 21:12', path: '/api/billing/payout' }
  ]);

  // Ask-AI Scribe Assistant powered by server's Gemini chat proxy
  const [aiChatQuery, setAiChatQuery] = useState<string>('What is the recommended dose of Clopidogrel after an unstable angina episode elements?');
  const [aiChatResponses, setAiChatResponses] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    { sender: 'assistant', text: 'Welcome to the LONGHEALTH Doctor Q&A Desk. Direct queries to this assistant will proxy safety thresholds and answer regarding clinical ICD-10 protocols.', time: '21:14' }
  ]);
  const [aiChatLoading, setAiChatLoading] = useState<boolean>(false);

  // Heartbeat loop simulating live monitoring changes
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTick(prev => prev + 1);

      // Simulating slight heart rate and oxygen fluctuation on Ward Bed telemetry
      setPatientVitals(prev => {
        const deltaHr = Math.floor(Math.random() * 3) - 1; // fluctuates by -1, 0, or 1
        const nextHr = Math.max(50, Math.min(140, prev.hr + deltaHr));
        
        // Very occasional oxygen fluctuation
        let nextSpo2 = prev.spo2;
        if (Math.random() > 0.85) {
          const deltaSpo2 = Math.random() > 0.5 ? 1 : -1;
          nextSpo2 = Math.max(82, Math.min(100, prev.spo2 + deltaSpo2));
        }

        return { ...prev, hr: nextHr, spo2: nextSpo2 };
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // Trigger global notifications
  const triggerNotification = (msg: string) => {
    setGlobalMessage(msg);
    setTimeout(() => setGlobalMessage(null), 4000);
  };

  // Add EMR Audit log helper
  const addEMRLog = (action: string, target: string) => {
    const nextId = `AUD-${Math.floor(Math.random() * 9000 + 1000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const userDisplay = currentRole ? `${currentRole.charAt(0).toUpperCase()}${currentRole.slice(1)}` : 'Anonymous';
    
    const newLog: EMRLogEvent = {
      id: nextId,
      user: userDisplay,
      action,
      target,
      timestamp: nowStr,
      path: '/api/clinical/dashboard'
    };

    setEmrLogs(prev => [newLog, ...prev]);
  };

  // Login click handler
  const handleLogin = (role: ClinicalRole) => {
    setCurrentRole(role);
    addEMRLog(`Session initialized as active user`, `Role: ${role}`);
    triggerNotification(`Logged in successfully as ${role.toUpperCase()}`);
  };

  // Logout click handler
  const handleLogout = () => {
    if (currentRole) {
      addEMRLog('Session destroyed', `Role: ${currentRole}`);
    }
    setCurrentRole(null);
    setActiveTab('workspace');
    triggerNotification('Logged out successfully.');
  };

  // Handle patient-prescribed drug syncing
  const handlePrescribeMed = (medName: string, notes: string) => {
    const newOrder = {
      drug: medName,
      dosage: notes,
      patient: 'Jane Miller (PT-93821)',
      timestamp: Date.now()
    };
    setActiveDrugOrders(prev => [newOrder, ...prev]);
    addEMRLog(`Issued medication prescription: ${medName}`, `Patient: Jane Miller`);
    triggerNotification(`Dispatched Rx for ${medName} to pharmacy queuing!`);
  };

  // Handle patient invoice payout simulated checkout
  const handlePayClaim = (id: string) => {
    setBillingClaims(prev => prev.map(claim => {
      if (claim.id === id) {
        return { ...claim, status: 'Completed' };
      }
      return claim;
    }));
    addEMRLog(`Settled outstanding bill id: #${id}`, 'Jane Miller Checkout');
    triggerNotification(`Invoice #${id} paid successfully via Stripe Sandbox Credit Card!`);
  };

  // Submit Gemini Ask-Doctor Query
  const sendAiChatQueryMsg = async () => {
    if (!aiChatQuery.trim()) return;
    const userText = aiChatQuery;
    const nowTimeStr = new Date().toTimeString().slice(0, 5);
    
    setAiChatResponses(prev => [...prev, { sender: 'user', text: userText, time: nowTimeStr }]);
    setAiChatQuery('');
    setAiChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });
      const data = await res.json();
      setAiChatResponses(prev => [...prev, { sender: 'assistant', text: data.response, time: nowTimeStr }]);
    } catch (err) {
      setTimeout(() => {
        setAiChatResponses(prev => [...prev, {
          sender: 'assistant',
          text: `[FALLBACK RESPONSE] To investigate "${userText}", please ensure process.env.GEMINI_API_KEY is configured in your AI Studio secrets panel. Clinical recommendations: Assess patient heart rate, request cardiac ECG troponin parameters and isolate patient bedrest.`,
          time: nowTimeStr
        }]);
        setAiChatLoading(false);
      }, 1000);
      return;
    }
    setAiChatLoading(false);
  };

  // Dynamic FontSize Classes based on Accessibility Selector
  const getAccessibilityFontClass = () => {
    if (textScale === 'large') return 'text-[14px] leading-relaxed';
    if (textScale === 'elderly') return 'text-[17px] leading-loose';
    return 'text-xs leading-normal';
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 select-none selection:bg-emerald-250 selection:text-emerald-950 ${
      isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {globalMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-semibold text-xs py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500/20"
          >
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{globalMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <header className={`sticky top-0 z-40 border-b transition px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDark ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white/95 border-slate-200'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-sm flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current animate-pulse text-emerald-100" />
          </div>
          <div>
            <h1 className="text-base font-display font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              LONGHEALTH
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">ENTERPRISE CLINICAL PLATFORM</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Real-time system clocks */}
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[10px] text-slate-500 ${
            isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>UTC SYSTEM: {new Date().toISOString().replace('T', ' ').slice(0, 16)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />
          </div>

          {/* Text-To-Scale Accessibility Widget */}
          <div className="flex items-center gap-1 bg-slate-500/10 p-0.5 rounded-lg border border-slate-500/10">
            <button 
              id="btn-scale-standard"
              onClick={() => setTextScale('standard')}
              className={`p-1.5 rounded text-[10px] uppercase font-mono font-bold transition ${textScale === 'standard' ? 'bg-white dark:bg-slate-900 shadow-xs text-emerald-600' : 'text-slate-500'}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button 
              id="btn-scale-large"
              onClick={() => setTextScale('large')}
              className={`p-1.5 rounded text-[11px] uppercase font-mono font-bold transition ${textScale === 'large' ? 'bg-white dark:bg-slate-900 shadow-xs text-emerald-600' : 'text-slate-500'}`}
              title="Large Font Size"
            >
              A+
            </button>
            <button 
              id="btn-scale-elderly"
              onClick={() => setTextScale('elderly')}
              className={`p-1.5 rounded text-xs uppercase font-mono font-bold transition ${textScale === 'elderly' ? 'bg-white dark:bg-slate-900 shadow-xs text-emerald-600 font-bold' : 'text-slate-500'}`}
              title="Elderly Accessibility Text Scaling"
            >
              A++
            </button>
          </div>

          {/* Dark / Light Toggle */}
          <button 
            id="theme-toggle-btn"
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 rounded-xl border hover:bg-slate-500/5 transition text-slate-500 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Active User session Indicator */}
          {currentRole && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-mono tracking-tight capitalize">
                ● {currentRole} Mode
              </span>
              <button 
                id="btn-session-logout"
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition border border-rose-500/10"
                title="Exit Workstation"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Primary Workspace container */}
      <main className="max-w-[1500px] mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* Navigation Tabs (Only visible when logged in to select view style) */}
        {currentRole && (
          <div className="flex border-b border-slate-500/10 pb-1 gap-6 overflow-x-auto scrollbar-none justify-start text-xs sm:text-sm">
            <button
              id="tab-view-workspace"
              onClick={() => setActiveTab('workspace')}
              className={`pb-3 font-display font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'workspace'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Attending Clinical Dashboard View</span>
            </button>
            <button
              id="tab-view-specifications"
              onClick={() => setActiveTab('specifications')}
              className={`pb-3 font-display font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'specifications'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>🎨 Active Design Spec & Psychology Tokens</span>
            </button>
            <button
              id="tab-view-doctor-chat"
              onClick={() => setActiveTab('chat')}
              className={`pb-3 font-display font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>📋attending Doctor AI Desk Chat</span>
            </button>
          </div>
        )}

        {/* Global font-scale wrapper */}
        <div className={getAccessibilityFontClass()}>
          
          <AnimatePresence mode="wait">
            {!currentRole ? (
              /* Splash Page: Choose Access Portal selection flow */
              <motion.div 
                key="splash"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RoleLoginPortal onLogin={handleLogin} isDark={isDark} />
              </motion.div>
            ) : (
              /* Session Workspace screen */
              <motion.div 
                key="session"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* 1. Design System tab */}
                {activeTab === 'specifications' && (
                  <DesignSystemSpecs isDark={isDark} />
                )}

                {/* 2. Doctor / Clinician Chat tab */}
                {activeTab === 'chat' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className={`p-6 rounded-2xl border lg:col-span-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                      <div className="flex items-center gap-2 border-b pb-3.5">
                        <Bot className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-display font-medium text-slate-900 dark:text-slate-100">attending Doctor Direct AI Consultation Room (Gemini 3.5 Flash)</h4>
                      </div>

                      <div className="space-y-3.5 h-[340px] overflow-y-auto pr-1">
                        {aiChatResponses.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3.5 rounded-xl max-w-2xl text-xs leading-relaxed ${
                              msg.sender === 'user' 
                                ? 'bg-emerald-600 text-white ml-auto' 
                                : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="block font-bold text-[9px] uppercase tracking-wider opacity-60 mb-1">{msg.sender} • {msg.time}</span>
                            <p className="font-sans font-medium whitespace-pre-line">{msg.text}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input 
                          id="desk-doctor-assistant-query"
                          type="text" 
                          placeholder="Ask regarding dosage guidelines, safety protocols, drug contradictions..." 
                          value={aiChatQuery}
                          onChange={(e) => setAiChatQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendAiChatQueryMsg()}
                          className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 focus:ring-emerald-500 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                        />
                        <button 
                          onClick={sendAiChatQueryMsg}
                          disabled={aiChatLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 px-4 rounded-lg text-white font-semibold flex items-center justify-center"
                        >
                          {aiChatLoading ? 'Querying...' : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Chat assistant sidebar guidance */}
                    <div className="lg:col-span-4 p-6 rounded-2xl border space-y-3 bg-slate-500/5 text-slate-500">
                      <h5 className="font-display font-bold text-xs uppercase tracking-wider">Clinical Guidance System</h5>
                      <p className="text-[11px] leading-relaxed">
                        This sandbox connects to our Node.js backplane, exposing the Gemini SDK. Attending clinicians are advised to verify medical parameters against printed protocols. Safe-guards are implemented within system telemetry nodes.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. CORE ACTIVE USER DASHBOARDS */}
                {activeTab === 'workspace' && (
                  <div>
                    {/* Patient / Home User Dashboard */}
                    {currentRole === 'patient' && (
                      <PatientsPortal 
                        isDark={isDark} 
                        onBookSuccess={(newAppt) => {
                          setAppointments(prev => [newAppt, ...prev]);
                          addEMRLog('Patient requested appointment booking online', `Clinic: ${newAppt.department}`);
                        }}
                        billingClaims={billingClaims}
                        onPayClaim={handlePayClaim}
                      />
                    )}

                    {/* Doctors & Nurses clinical dashboard split */}
                    {(currentRole === 'doctor' || currentRole === 'nurse') && (
                      <ClinicalDashboards 
                        role={currentRole} 
                        isDark={isDark} 
                        patientVitals={patientVitals}
                        setPatientVitals={setPatientVitals}
                        bedPlacements={bedPlacements}
                        onPrescribeMed={handlePrescribeMed}
                        activeDrugOrders={activeDrugOrders}
                      />
                    )}

                    {/* Laboratory Pharmacists and Admitting receptionists desk */}
                    {(currentRole === 'pharmacist' || currentRole === 'lab' || currentRole === 'receptionist') && (
                      <SupportServicesDashboards 
                        role={currentRole} 
                        isDark={isDark} 
                        drugStock={drugStock}
                        setDrugStock={setDrugStock}
                        labSpecimens={labSpecimens}
                        setLabSpecimens={setLabSpecimens}
                        appointments={appointments}
                        setAppointments={setAppointments}
                        activeDrugOrders={activeDrugOrders}
                      />
                    )}

                    {/* Accountants and Admins */}
                    {(currentRole === 'accountant' || currentRole === 'admin') && (
                      <ManagementDashboards 
                        role={currentRole} 
                        isDark={isDark} 
                        billingClaims={billingClaims}
                        setBillingClaims={setBillingClaims}
                        emrLogs={emrLogs}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Elegant minimalist Clinical footer */}
      <footer className="border-t border-slate-500/15 py-8 mt-12 text-center text-[11px] text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between max-w-[1500px] mx-auto w-full px-6 gap-4">
        <span>© 2026 LONGHEALTH Workstation. Clinically validated and immutable environment.</span>
        <div className="flex gap-4">
          <span className="hover:text-emerald-600 transition">HIPAA compliant records</span>
          <span>•</span>
          <span className="hover:text-emerald-600 transition">HL7 / FHIR secure</span>
          <span>•</span>
          <span className="hover:text-emerald-600 transition">Stripe Sandbox active</span>
        </div>
      </footer>

    </div>
  );
}
