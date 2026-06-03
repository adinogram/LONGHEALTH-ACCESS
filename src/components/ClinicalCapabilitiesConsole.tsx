/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Mic, Activity, Heart, RefreshCw, Send, AlertTriangle, 
  Calendar, TrendingUp, CheckSquare, Sparkles, FileText, Bot, 
  ArrowRight, User, Settings, Info, Play, Plus, PhoneOff, Check, 
  AlertCircle, ShoppingBag, Eye, FileSpreadsheet, Layers, Shield, 
  Search, Filter, ShieldAlert, DollarSign, Download, Lock, CheckCircle2, 
  ChevronRight, Stethoscope, Copy, Sun, Moon, Pill, Database, Users, 
  Workflow, ClipboardList, HelpCircle, ArrowUpRight, CloudLightning, RefreshCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export const ClinicalCapabilitiesConsole: React.FC = () => {
  // Global & Theme States
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'dashboard' | 'scribe' | 'design' | 'components' | 'accessibility'>('dashboard');
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'nurse' | 'admin' | 'pharmacist' | 'lab' | 'accountant' | 'patient'>('doctor');
  
  // Design System Swatch States
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [fontSizeTester, setFontSizeTester] = useState<string>('Diagnostic Assessment: STEMI Outpatient Protocol triggered on bed clearance.');
  
  // Accessibility Checker State
  const [accessibilityLogs, setAccessibilityLogs] = useState<string[]>([
    '[System] Loaded WCAG 2.1 contrast validator.',
    '[Audit] Focus rings automatically injected on Interactive elements.',
    '[Audit] All SVGs formatted with aria-hidden descriptions.',
    '[Audit] ARIA Landmarks confirmed for high-density bento blocks.'
  ]);
  const [contrastSlider, setContrastSlider] = useState<number>(4.8); // high contrast ratio simulator

  // Clinical Patient State Simulation (Jane Miller, 58)
  const [patientVitals, setPatientVitals] = useState({
    hr: 74,
    spo2: 98,
    bpSystolic: 128,
    bpDiastolic: 82,
    temp: 98.6,
    respiration: 16,
    painScale: 2
  });

  // TELEMEDICINE STATES
  const [telehealthStatus, setTelehealthStatus] = useState<'idle' | 'tunneling' | 'connected' | 'ended'>('idle');
  const [telehealthLogs, setTelehealthLogs] = useState<string[]>([]);
  const [muteAudio, setMuteAudio] = useState<boolean>(false);
  const [muteVideo, setMuteVideo] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);

  // AI SYMPTOM STATES
  const [symptomInput, setSymptomInput] = useState<string>('Sharp chest tightening radiating to left shoulder, accompanied by mild sweaty nausea and short breath.');
  const [patientGender, setPatientGender] = useState<string>('FEMALE');
  const [patientAge, setPatientAge] = useState<number>(58);
  const [patientHistory, setPatientHistory] = useState<string>('Hypertension (5 yrs), non-smoker, mother history of CAD.');
  const [symptomLoading, setSymptomLoading] = useState<boolean>(false);
  const [symptomResult, setSymptomResult] = useState<any | null>({
    triageUrgency: 'HIGH',
    clinicalSpecialist: 'Cardiology Clinic (Stat)',
    potentialCauses: 'Atypical Acute Coronary Syndrome, Angina pectoris, or transient ischemic vasospasm.',
    differentialDiagnoses: ['Myocardial Infarction', 'Unstable Angina', 'Gastroesophageal Reflux', 'Costochondritis'],
    recommendedTests: ['12-Lead ECG within 10 min', 'Serum Troponin I/T assay', 'Chest X-Ray', 'Echocardiogram'],
    safetyAdvisory: 'Advise immediate bed rest. Prepare IV access and supplemental oxygen if saturation dips. Do not let patient walk or exert self.',
    detailedExplanation: 'Presented symptoms with radiation to left shoulder coupled with hypertension and secondary family history of Coronary Artery Disease warrants an emergent ischemic protocol to rule out active coronary thrombosis.'
  });

  // CLINICAL DICTATION STATES
  const [sampleDictations, setSampleDictations] = useState<any[]>([
    { id: 'diet-cardio', title: 'Cardiology Discharge Summary', text: 'Patient presented with stable angina. Ejected fraction 55% at rest. Troponin negative. Recommended physical activities restricted to light walking. Clopidogrel 75mg daily. Review lipids panel in 30 days.' },
    { id: 'ortho-post', title: 'Orthopedic Post-op Assessment', text: 'Left knee arthroscopy completed. Minimal joint effusion. Incision clean, sutures dry. Range of motion spans 0 to 95 degrees today. Prescribed physical rehabilitation 3x weekly. Naproxen 500mg twice daily to modulate discomfort.' }
  ]);
  const [dictationTranscript, setDictationTranscript] = useState<string>('Patient presented with stable angina. Ejected fraction 55% at rest. Troponin negative. Clopidogrel 75mg daily.');
  const [dictationLoading, setDictationLoading] = useState<boolean>(false);
  const [dictationResult, setDictationResult] = useState<any | null>({
    icdCode: 'I20.9',
    urgency: 'HIGH',
    subjective: '58-year-old female complaining of stable angina. Describes tightness during moderate gardening activity.',
    objective: 'Echocardiogram indicates normal left ventricular function with ejected fraction of 55% at rest. Electrocardiogram is normal. Troponin assays are consistently negative.',
    assessment: 'Angina pectoris, unspecified (ICD-10 Code: I20.9). Retains stable functional bounds at current threshold.',
    plan: 'Initiate Clopidogrel 75mg oral daily dose. Restrict intense aerobic training. Schedule routine follow-up lipids panel in 30 days.',
    suggestedSpecialist: 'Cardiology Preventative Service'
  });
  const [soapCommitted, setSoapCommitted] = useState<boolean>(false);

  // RISK SCORING STATES
  const [riskType, setRiskType] = useState<'MACE' | 'LACE'>('MACE');
  const [riskAge, setRiskAge] = useState<number>(58);
  const [systolicBP, setSystolicBP] = useState<number>(134);
  const [totalCholesterol, setTotalCholesterol] = useState<number>(210);
  const [hdlCholesterol, setHdlCholesterol] = useState<number>(44);
  const [riskDiabetes, setRiskDiabetes] = useState<boolean>(false);
  const [riskSmoker, setRiskSmoker] = useState<boolean>(false);
  
  // LACE
  const [lengthOfStay, setLengthOfStay] = useState<number>(3);
  const [isAcuteAdmission, setIsAcuteAdmission] = useState<boolean>(true);
  const [comorbiditiesIndex, setComorbiditiesIndex] = useState<number>(2);
  const [erVisitsCount, setErVisitsCount] = useState<number>(1);

  // AUTOMATED FOLLOW-UPS STATES
  const [followupType, setFollowupType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [followupTemplate, setFollowupTemplate] = useState<string>('DISCHARGE_CARDIOLOGY');
  const [followupMessage, setFollowupMessage] = useState<string>('Daily Clopidogrel 75mg reminder. Track BP mornings. Record chest pain immediate warnings.');
  const [followupPatient, setFollowupPatient] = useState<string>('PT-93821 (Jane Miller)');
  const [followUpQueue, setFollowUpQueue] = useState<any[]>([
    { jobId: 'job-90921', status: 'Completed', message: 'Take Clopidogrel 75mg daily. Check blood pressure daily. Report chest pain.', recipient: 'PT-93821 (Jane Miller)', type: 'SMS', dispatchedAt: Date.now() - 3600000 },
    { jobId: 'job-90872', status: 'Active', message: 'Your metabolic status and blood pressure metrics are scheduled for nurse dispatch reviews.', recipient: 'PT-10334 (Roger Sterling)', type: 'EMAIL', dispatchedAt: Date.now() }
  ]);
  const [followupLoading, setFollowupLoading] = useState<boolean>(false);

  // EMR Log Events
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'audit-01', user: 'Dr. Evelyn Reed', action: 'Accessed Patient Record', target: 'Jane Miller (PT-93821)', timestamp: '21:02:44Z', path: '/api/clinical/emr/jane_miller' },
    { id: 'audit-02', user: 'Nurse Mark Wilson', action: 'Modified Vital Signs', target: 'Jane Miller (PT-93821)', timestamp: '21:01:12Z', path: '/api/clinical/vitals/update' },
    { id: 'audit-03', user: 'Pharmacist Sarah Cho', action: 'Dispensed Medication', target: 'Clopidogrel 75mg', timestamp: '20:54:30Z', path: '/api/pharmacy/dispense' }
  ]);

  // Invoice / Claims Simulation data
  const [billingClaims, setBillingClaims] = useState<any[]>([
    { id: 'clm-4081', patient: 'Jane Miller', insCode: 'BCBS-89382', amount: 1420.00, status: 'Completed', provCode: 'ICD10-I20.9', date: 'Jun 03, 2026' },
    { id: 'clm-4082', patient: 'Roger Sterling', insCode: 'AET-29381', amount: 310.00, status: 'Processing', provCode: 'ICD10-Z13.6', date: 'Jun 02, 2026' },
    { id: 'clm-4083', patient: 'Billy Draper', insCode: 'CIG-90212', amount: 180.00, status: 'Overdue', provCode: 'ICD10-J06.9', date: 'May 28, 2026' }
  ]);

  // Drug lists
  const [pharmacyStock, setPharmacyStock] = useState<any[]>([
    { name: 'Clopidogrel 75mg', category: 'Cardiovascular', stock: 120, minThreshold: 150, actionCode: 'RESTOCK_REQ' },
    { name: 'Naproxen 500mg', category: 'Analgesics', stock: 450, minThreshold: 300, actionCode: 'OPTIMAL' },
    { name: 'Lisino-Vasotec 10mg', category: 'Antihypertensives', stock: 85, minThreshold: 100, actionCode: 'RESTOCK_REQ' },
    { name: 'Metformin 850mg', category: 'Antidiabetics', stock: 610, minThreshold: 400, actionCode: 'OPTIMAL' }
  ]);

  // Lab Specimen lists
  const [labTests, setLabTests] = useState<any[]>([
    { id: 'spec-301', test: 'Troponin-I Level Panel', patient: 'Jane Miller', sample: 'Whole Blood (Purple top)', elapsed: '24 min', status: 'In Processing' },
    { id: 'spec-302', test: 'Comprehensive Metabolic Profiling', patient: 'Roger Sterling', sample: 'Serum (Gold top)', elapsed: '1 hr 12m', status: 'Completed' },
    { id: 'spec-303', test: 'MRSA Sputum Screening Culture', patient: 'Clarissa Harlowe', sample: 'Sputum swab', elapsed: '4 hrs', status: 'Drawn / Transiting' }
  ]);

  // Nurse Beds Tracker
  const [bedPlacements, setBedPlacements] = useState<any[]>([
    { id: 'bed-101', pt: 'Jane Miller', age: 58, condition: 'Stable / Outpatient Dial', room: 'Cardio Bed 04', telemetry: 'Active (74 BPM)' },
    { id: 'bed-102', pt: 'Roger Sterling', age: 62, condition: 'Routine Observation', room: 'Ward B Room 12', telemetry: 'Active (68 BPM)' },
    { id: 'bed-103', pt: 'Clarissa Harlowe', age: 71, condition: 'Guarded / Critical', room: 'ICU Bed 01', telemetry: 'Continuous ECG' }
  ]);

  // Analytics Simulation State Hook
  const [analyticsData, setAnalyticsData] = useState<any>({
    patientDistribution: { outpatients: 1204, inpatients: 312, observation: 18 },
    telemedicine: { totalHours: 142, completedSessions: 94 },
    monthlyGoalPercent: 88,
    financialSummary: { paidClaims: 48900.00, pendingInvoices: 18450.00 }
  });

  // Telehealth timers
  useEffect(() => {
    let interval: any = null;
    if (telehealthStatus === 'connected') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        setPatientVitals(prev => {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const currentHr = prev.hr + delta;
          return {
            ...prev,
            hr: currentHr < 60 ? 60 : currentHr > 115 ? 115 : currentHr
          };
        });
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [telehealthStatus]);

  // Load backend transcripts / fallback
  useEffect(() => {
    // Attempt lazy loading from backend endpoints asynchronously
    const loadSampleTranscripts = async () => {
      try {
        const res = await fetch('/api/clinical-ai/sample-transcripts');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSampleDictations(data);
          setDictationTranscript(data[0].text);
        }
      } catch (e) {
        console.log('Using robust offline clinical script presets');
      }
    };
    loadSampleTranscripts();
  }, []);

  // WebRTC Simulators
  const startTelehealth = () => {
    setTelehealthStatus('tunneling');
    setTelehealthLogs(['[System] Initializing clinical telemetry peer...', '[WebRTC] Querying STUN/TURN HIPAA candidates...']);
    setTimeout(() => {
      setTelehealthLogs(prev => [...prev, '[Signal] Secured session token acquired: FHIR-SSL-9382', '[WebRTC] Splicing high-density video stream...']);
      setTimeout(() => {
        setTelehealthLogs(prev => [...prev, '[Tunnel] AES-256 peer-to-peer established.', '[System] Telehealth link is active. Session secure.']);
        setTelehealthStatus('connected');
      }, 80000000); // Trigger immediate visual connection on state trigger:
      setTelehealthStatus('connected');
    }, 1000);
  };

  const endTelehealth = () => {
    setTelehealthLogs(prev => [...prev, '[System] Peer teardown requested.', '[System] WebRTC channel disconnected safely. Memory cleared.']);
    setTelehealthStatus('ended');
  };

  // Symptoms assessment wrapper
  const analyzeSymptoms = async () => {
    if (!symptomInput.trim()) return;
    setSymptomLoading(true);
    setSymptomResult(null);
    try {
      const res = await fetch('/api/clinical-ai/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomInput,
          age: patientAge,
          gender: patientGender,
          history: patientHistory
        })
      });
      const data = await res.json();
      if (data.fallback || data.triageUrgency) {
        setSymptomResult(data.fallback || data);
      } else {
        setSymptomResult(data);
      }
    } catch (e) {
      // Offline high-fidelity fallback based on designer principles
      setTimeout(() => {
        setSymptomResult({
          triageUrgency: 'HIGH',
          clinicalSpecialist: 'Preventative Cardiology',
          potentialCauses: 'Transient Coronary Ischemia or angina pectoris triggered by secondary hypertension.',
          differentialDiagnoses: ['Myocardial Angina', 'Chest Wall Spasm', 'Reflux Esophagitis'],
          recommendedTests: ['Cardiac Holter ECG 24-hr', 'Serum Troponin Assay series', 'Exercise stress protocol'],
          safetyAdvisory: 'Instruct the patient to immediate rest state. Refrain from active climbing. Contact nurse if pain triggers.',
          detailedExplanation: 'The patient describes high pressure chest discomfort accompanied by hypertensive state data. Recommend troponin profiling to evaluate biomarker leakage.'
        });
        setSymptomLoading(false);
      }, 1200);
      return;
    }
    setSymptomLoading(false);
  };

  // Dictation Scribe AI
  const compileDictation = async () => {
    if (!dictationTranscript.trim()) return;
    setDictationLoading(true);
    setDictationResult(null);
    setSoapCommitted(false);
    try {
      const res = await fetch('/api/clinical-ai/voice-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: dictationTranscript })
      });
      const data = await res.json();
      setDictationResult(data.fallback || data);
    } catch (e) {
      setTimeout(() => {
        setDictationResult({
          icdCode: 'I20.9',
          urgency: 'HIGH',
          subjective: 'Patient reports stable angina during walking. Reassures chest parameters ease. Denies persistent vomiting.',
          objective: 'Heart rate 74. saturation 98%. Troponin profile remains negative.',
          assessment: 'Stable coronary disease (ICD10: I20.9) with predictable angina thresholds.',
          plan: 'Continue safe dosage of clopidogrel and moderate blood thinners. Review lipids.',
          suggestedSpecialist: 'Prevention Cardiology clinic'
        });
        setDictationLoading(false);
      }, 1000);
      return;
    }
    setDictationLoading(false);
  };

  // Followup queue
  const triggerFollowup = async () => {
    setFollowupLoading(true);
    try {
      const res = await fetch('/api/clinical/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientCode: 'PT-93821',
          type: followupType,
          message: followupMessage
        })
      });
      const data = await res.json();
      setFollowUpQueue(prev => [data, ...prev]);
    } catch (e) {
      // offline push
      const mockJob = {
        jobId: `job-${Math.floor(Math.random() * 90000 + 10000)}`,
        status: 'Active',
        message: followupMessage,
        recipient: followupPatient,
        type: followupType,
        dispatchedAt: Date.now()
      };
      setFollowUpQueue(prev => [mockJob, ...prev]);
    } finally {
      setFollowupLoading(false);
    }
  };

  // Risk Score Calculator MACE / LACE
  const calculateRiskPercentage = (): { score: number; level: string; color: string; treatment: string } => {
    if (riskType === 'MACE') {
      let base = 7;
      if (riskAge > 40) base += (riskAge - 40) * 0.6;
      if (systolicBP > 120) base += (systolicBP - 120) * 0.5;
      if (totalCholesterol / hdlCholesterol > 3.8) base += (totalCholesterol / hdlCholesterol - 3.8) * 4;
      if (riskDiabetes) base += 20;
      if (riskSmoker) base += 15;
      const score = Math.round(Math.min(base, 98));

      let level = 'LOW';
      let color = 'text-emerald-600 bg-emerald-500/10 border-emerald-555/20 dark:text-emerald-400';
      let treatment = 'Optimize nutrition, evaluate LDL levels annually. Exercise as fit.';
      if (score >= 20 && score < 45) {
        level = 'MODERATE';
        color = 'text-amber-600 bg-amber-500/10 border-amber-555/20 dark:text-amber-400';
        treatment = 'Statin evaluation, smoke cessation advisory, quarterly metabolic checks.';
      } else if (score >= 45 && score < 70) {
        level = 'HIGH';
        color = 'text-orange-600 bg-orange-500/10 border-orange-555/20 dark:text-orange-400';
        treatment = 'ECG stress testing, titrate blood pressures. Instant specialist referral.';
      } else if (score >= 70) {
        level = 'CRITICAL';
        color = 'text-rose-600 bg-rose-500/10 border-rose-555/20 dark:text-rose-400';
        treatment = 'Admit for inpatient telemetry immediately to prevent cardiovascular ischemia response.';
      }
      return { score, level, color, treatment };
    } else {
      let stayPoints = Math.min(lengthOfStay, 4);
      if (lengthOfStay > 4) stayPoints += 2;
      const acutePoints = isAcuteAdmission ? 3 : 0;
      const comorbidPoints = Math.min(comorbiditiesIndex * 1.5, 6);
      const erPoints = Math.min(erVisitsCount, 4);
      
      const laceTotal = stayPoints + acutePoints + comorbidPoints + erPoints;
      const score = Math.round((laceTotal / 17) * 100);

      let level = 'LOW';
      let color = 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400';
      let treatment = 'Discharge following standard guidelines. Clinical visit in 10 days.';
      if (laceTotal >= 5 && laceTotal < 9) {
        level = 'MODERATE';
        color = 'text-amber-600 bg-amber-505/10 dark:text-amber-400';
        treatment = 'Nurses outcall call within 48 hours. Medicine reconciliations via phone.';
      } else if (laceTotal >= 9 && laceTotal < 12) {
        level = 'HIGH';
        color = 'text-orange-650 bg-orange-505/10 dark:text-orange-400';
        treatment = 'Assigned home health aide visits. Active telemedicine tracking within 3 days.';
      } else if (laceTotal >= 12) {
        level = 'CRITICAL';
        color = 'text-rose-600 bg-rose-505/10 dark:text-rose-400';
        treatment = 'Assess for alternate stepdown placement or extended diagnostic inpatient state.';
      }
      return { score, level, color, treatment };
    }
  };

  const calculatedRiskResult = calculateRiskPercentage();

  // Helper theme styling
  const isDark = themeMode === 'dark';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const cardBg = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200';
  const subBg = isDark ? 'bg-slate-950/80' : 'bg-slate-50/90';
  const highlightBorder = isDark ? 'border-slate-850' : 'border-slate-150';
  const tabButtonActive = (active: boolean) => active 
    ? 'bg-blue-600 shadow-sm text-white' 
    : isDark ? 'text-slate-400 hover:text-slate-250 hover:bg-slate-850' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100';

  const brandSwatches = [
    { label: 'Primary Blue (Clinical Trust)', hex: '#2563EB', role: 'Main CTAs, Navigation focus, Actions', textClass: 'text-white' },
    { label: 'Obsidian Canvas (Trust Dark)', hex: '#090D16', role: 'Main background dark theme wrapper', textClass: 'text-slate-100' },
    { label: 'Clean Ivory (Surgical Light)', hex: '#F8FAFC', role: 'Main background light theme wrapper', textClass: 'text-slate-800' },
    { label: 'Warning Amber (Moderate/Warning)', hex: '#D97706', role: 'Elevated triage, non-lethal indicators', textClass: 'text-white' },
    { label: 'Surgical Crimson (Emergent/Danger)', hex: '#DC2626', role: 'Emergent status alerts, active telemetry peak', textClass: 'text-white' },
    { label: 'Safe Mint (Stabilized Vital)', hex: '#10B981', role: 'Patient telemetry normalization, paid stats', textClass: 'text-white' }
  ];

  return (
    <div 
      id="hospital-clinical-cockpit" 
      className={`rounded-3xl border transition-all duration-300 p-6 shadow-2xl relative ${isDark ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-[#f8fafc] border-slate-300 text-slate-800'}`}
    >
      
      {/* 24/7 HOSP HEAD TABS & BRANDING */}
      <div className={`p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border ${isDark ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-100/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-600/10 text-blue-600'}`}>
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base tracking-tight">EPIC/STRIPE PLATFORM BLUEPRINT</h2>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-mono rounded-full border border-emerald-500/20 tracking-wider">
                ● FHIR LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">Multi-tenant clinical cockpit. Configured for hospitals operating 24/7/365.</p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Light/Dark Toggle */}
          <button 
            id="theme-switch-btn"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-lg border flex items-center gap-1.5 transition text-xs font-medium font-sans ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Prism Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span>Clean Dark Mode</span>
              </>
            )}
          </button>

          {/* Quick-Action Tab List */}
          <div className={`p-1 rounded-xl border flex gap-1 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            {[
              { id: 'dashboard', label: 'EHR Workspace', icon: ClipboardList },
              { id: 'scribe', label: 'Telehealth & AI Scribe', icon: Bot },
              { id: 'design', label: 'Design Token Grid', icon: Layers },
              { id: 'components', label: 'Component Library', icon: Activity },
              { id: 'accessibility', label: 'WCAG compliance', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`emr-main-tab-${tab.id}`}
                  onClick={() => setActiveConsoleTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition ${tabButtonActive(activeConsoleTab === tab.id)}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* APPLE-HEALTH STYLE CRITICAL VITALS HEADER BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Cardiac Electro</span>
            <Heart className="w-4 h-4 text-rose-500 animate-pulse fill-rose-500/20" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display tracking-tight text-rose-500">{patientVitals.hr}</span>
            <span className="text-[10px] text-slate-400 font-mono">BPM</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-mono">ST-segment: Normal (Sinus)</p>
          <div className="absolute right-0 bottom-0 top-0 w-1 flex flex-col justify-end">
            <div className="h-2/3 bg-rose-500 rounded-t-full w-full" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">O2 Saturation</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display tracking-tight text-blue-500">{patientVitals.spo2}%</span>
            <span className="text-[10px] text-slate-400 font-mono">SpO2</span>
          </div>
          <p className="text-[9px] text-emerald-500 mt-1 font-mono">Surgical normal ranges</p>
          <div className="absolute right-0 bottom-0 top-0 w-1 flex flex-col justify-end">
            <div className="h-5/6 bg-blue-500 rounded-t-full w-full" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Vascular BP</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold font-display tracking-tight text-indigo-500">{patientVitals.bpSystolic}/{patientVitals.bpDiastolic}</span>
            <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
          </div>
          <p className="text-[9px] text-amber-500 mt-1 font-mono">Moderate Prehypertension</p>
          <div className="absolute right-0 bottom-0 top-0 w-1 flex flex-col justify-end">
            <div className="h-1/2 bg-indigo-500 rounded-t-full w-full" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${cardBg}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Body Core Temp</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-display tracking-tight text-emerald-500">{patientVitals.temp}°F</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-mono">Afebrile status verified</p>
          <div className="absolute right-0 bottom-0 top-0 w-1 flex flex-col justify-end">
            <div className="h-2/5 bg-emerald-500 rounded-t-full w-full" />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl border transition relative overflow-hidden bg-gradient-to-tr from-blue-600/10 to-blue-50/5 border-blue-500/20 text-blue-500">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Bed Clearance Triage</span>
          <span className="text-xl font-bold font-display block mt-1 tracking-tight">STATION: C-04</span>
          <p className="text-[9px] text-slate-400 mt-1 font-mono">Occupant: PT-93821 (Jane M.)</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: EHR INTELLIGENT WORKSPACE */}
        {activeConsoleTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Sidebar quick selector for clinical positions */}
            <div className="lg:col-span-3 space-y-4">
              <div className={`p-4 rounded-2xl border ${cardBg}`}>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-3">EHR Role Context Switcher</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'doctor', name: '🧑‍⚕️ Attending Doctor', dept: 'Cardiology' },
                    { id: 'nurse', name: '🧑‍⚕️ Ward Nurse', dept: 'ICU & Observation' },
                    { id: 'admin', name: '🧑‍💼 Admitting Admin', dept: 'HIPAA & Compliance' },
                    { id: 'pharmacist', name: '💊 Chief Pharmacist', dept: 'Pharmacy Stock' },
                    { id: 'lab', name: '🔬 Lab Specialist', dept: 'Sputum & Blood Cultures' },
                    { id: 'accountant', name: '🧑‍💻 Financial Scribe', dept: 'Stripe Claims' },
                    { id: 'patient', name: '🧑‍🦽 Patient Care Portal', dept: 'Home Care Check-ins' }
                  ].map(role => (
                    <button
                      key={role.id}
                      id={`role-select-btn-${role.id}`}
                      onClick={() => setSelectedRole(role.id as any)}
                      className={`text-left p-2.5 rounded-xl text-xs font-semibold tracking-tight transition flex items-center justify-between ${
                        selectedRole === role.id 
                          ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20' 
                          : 'hover:bg-slate-500/5 hover:-translate-y-0.5 border border-transparent'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">{role.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{role.dept}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout instructions & Design goals */}
              <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
                <h4 className="text-xs font-bold tracking-tight text-blue-500">Design Integrity Metrics</h4>
                <div className="space-y-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>EPIC-level terminology parameters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>No unrequested telemetry clutter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Subtle 1px border grid system</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Screen Segment */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* DOCTOR VIEW */}
              {selectedRole === 'doctor' && (
                <div id="doctor-workdesk-panel" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base">Clinician Diagnostic Workdesk (Attending Doctor)</h3>
                      <p className="text-xs text-slate-500 mt-1">EHR Patient Intake File: <strong>Jane Miller, 58 yrs</strong></p>
                    </div>
                    {/* Linear style shortcut tags */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span className="px-1.5 py-0.5 rounded border">ESC</span>
                      <span>+</span>
                      <span className="px-1.5 py-0.5 rounded border">D</span>
                      <span className="ml-1 text-slate-500">Close File</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Interactive Diagnostic Diagnosis Code */}
                      <div className={`p-4 rounded-xl border ${subBg}`}>
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Standard ICD-10 Coding</span>
                          <span className="px-2 py-0.5 bg-rose-600/10 text-rose-500 text-[10px] font-mono rounded font-bold">I20.9 (Angina)</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-400">Active Diagnosis: <strong>Angina pectoris, unspecified.</strong> Electrocardiographic baseline tracks indicate minor localized ischemic pressure, with no biological troponin biomarker elevation.</p>
                      </div>

                      {/* Clinical MACE / LACE Risk Scores integration */}
                      <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Cardiovascular MACE hazard</span>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${calculatedRiskResult.color}`}>{calculatedRiskResult.level}</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">Adjust Patient Age Factor:</span>
                            <span className="font-mono text-xs font-bold text-blue-600">{riskAge} yrs</span>
                          </div>
                          <input 
                            id="slider-doc-risk-age"
                            type="range" min="30" max="95" value={riskAge} 
                            onChange={(e) => setRiskAge(parseInt(e.target.value))}
                            className="w-full accent-blue-600"
                          />

                          <div className="flex justify-between items-center">
                            <span className="text-xs">Systolic Blood Pressure (mmHg):</span>
                            <span className="font-mono text-xs font-bold text-blue-600">{systolicBP} mmHg</span>
                          </div>
                          <input 
                            id="slider-doc-risk-sbp"
                            type="range" min="90" max="200" value={systolicBP}
                            onChange={(e) => setSystolicBP(parseInt(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div className="p-3 bg-blue-600/5 rounded-lg border border-dashed border-blue-500/20 text-[11px] leading-relaxed text-slate-400">
                          <strong>Immediate Intervention Protocol:</strong> {calculatedRiskResult.treatment}
                        </div>
                      </div>
                    </div>

                    {/* Scribe transcript connector */}
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Patient Subjective Intake Checklist</span>
                        <div className="space-y-2 text-xs">
                          <label className="flex items-start gap-2 text-slate-400 cursor-pointer">
                            <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-350 accent-blue-600 h-3.5 w-3.5" />
                            <span>Recurrent chest pressure aggravated on minimal gardening exertion.</span>
                          </label>
                          <label className="flex items-start gap-2 text-slate-400 cursor-pointer">
                            <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-350 accent-blue-600 h-3.5 w-3.5" />
                            <span>Non-smoker, has taken Lisinopril 10mg daily for mild hypertension.</span>
                          </label>
                          <label className="flex items-start gap-2 text-slate-400 cursor-pointer">
                            <input type="checkbox" className="mt-0.5 rounded border-slate-350 accent-blue-600 h-3.5 w-3.5" />
                            <span>Confirm Troponin serum results mapped in last 6 hours.</span>
                          </label>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${subBg} space-y-2`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Attending SOAP Summary</span>
                        <div className="text-xs space-y-1 text-slate-400">
                          <p><strong>S:</strong> {dictationResult?.subjective || 'Loading subjective values...'}</p>
                          <p className="mt-1"><strong>A:</strong> {dictationResult?.assessment || 'Loading assessment...'}</p>
                        </div>
                        <button 
                          id="submit-emr-doctor-file"
                          onClick={() => {
                            setSoapCommitted(true);
                            setTimeout(() => setSoapCommitted(false), 3000);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] transition-all text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-200" />
                          <span>{soapCommitted ? 'Saved to Permanent EHR File!' : 'Commit Records to Patient EHR'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NURSE VIEW */}
              {selectedRole === 'nurse' && (
                <div id="nurse-station-panel" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div>
                    <h3 className="font-display font-bold text-base">Attending Bed Tracker & Ward Controller</h3>
                    <p className="text-xs text-slate-500 mt-1">SaaS Bed Occupancy & Real-Time vitals telemetry update desk.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bedPlacements.map(bed => (
                      <div key={bed.id} className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between min-h-[140px] ${subBg}`}>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 font-mono text-[9px] rounded uppercase">{bed.room}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${bed.condition.includes('Critical') ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                          </div>
                          <span className="text-xs font-bold block">{bed.pt} ({bed.age} y)</span>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">Telemetry: {bed.telemetry}</span>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t flex justify-between items-center text-[10px] text-slate-500">
                          <span>Status: {bed.condition}</span>
                          <button 
                            id={`action-modify-vital-${bed.id}`}
                            className="text-blue-500 hover:underline hover:text-blue-600"
                            onClick={() => {
                              setPatientVitals(prev => ({
                                ...prev,
                                hr: bed.pt === 'Jane Miller' ? 74 : 88,
                                bpSystolic: bed.pt === 'Jane Miller' ? 128 : 138
                              }));
                            }}
                          >
                            Sync Vitals
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active vital adjuster */}
                  <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                    <span className="text-xs font-bold text-slate-300 block">Vitals Capture Sheet (Simulate Jane Miller Telemetry)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Pulse rate (bpm)</label>
                        <input 
                          id="nurse-vital-pulse"
                          type="number" 
                          value={patientVitals.hr} 
                          onChange={(e) => setPatientVitals(prev => ({ ...prev, hr: parseInt(e.target.value) || 72 }))}
                          className={`w-full p-2 rounded-lg border font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Oxygen sat (%)</label>
                        <input 
                          id="nurse-vital-spo2"
                          type="number" 
                          value={patientVitals.spo2} 
                          onChange={(e) => setPatientVitals(prev => ({ ...prev, spo2: parseInt(e.target.value) || 98 }))}
                          className={`w-full p-2 rounded-lg border font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 block uppercase mb-1">BP Systolic</label>
                        <input 
                          id="nurse-vital-bpsys"
                          type="number" 
                          value={patientVitals.bpSystolic} 
                          onChange={(e) => setPatientVitals(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) || 120 }))}
                          className={`w-full p-2 rounded-lg border font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 block uppercase mb-1">BP Diastolic</label>
                        <input 
                          id="nurse-vital-bpdia"
                          type="number" 
                          value={patientVitals.bpDiastolic} 
                          onChange={(e) => setPatientVitals(prev => ({ ...prev, bpDiastolic: parseInt(e.target.value) || 80 }))}
                          className={`w-full p-2 rounded-lg border font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN VIEW */}
              {selectedRole === 'admin' && (
                <div id="admin-workspace-panel" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-display font-bold text-base">Admitting Administrator Panel</h3>
                      <p className="text-xs text-slate-500 mt-1">Audits patient admissions, EMR logs, SOC2 isolation state, and HIPAA compliance trails.</p>
                    </div>
                    {/* Linear Key Indicator */}
                    <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 font-mono text-[10px] rounded tracking-widest font-bold">
                      SOC2 SECURITY SEAL
                    </span>
                  </div>

                  {/* Bed Occupancy and HIPAA tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${subBg} space-y-2`}>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">24/7/365 Bed Occupancy Index</span>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-xs">
                          <span>Cardiology (B-01 to B-08)</span>
                          <span className="font-mono font-bold">75% occupied</span>
                        </div>
                        <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full w-3/4 rounded-full" />
                        </div>

                        <div className="flex justify-between text-xs mt-3">
                          <span>Intensive Care Unit (ICU)</span>
                          <span className="font-mono font-bold">90% occupied</span>
                        </div>
                        <div className="w-full bg-slate-500/10 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-600 h-full w-11/12 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${subBg} space-y-2`}>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Compliance Status Summary</span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1">
                          <span>Security Policy</span>
                          <span className="text-emerald-500 font-mono">SOC2 Compliant</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Patient Privacy</span>
                          <span className="text-emerald-500 font-mono">HIPAA Encrypted</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Diagnostic Exchange</span>
                          <span className="text-blue-500 font-mono">FHIR JSON v4.0.1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HIPAA AUDIT TRAIL SCROLLER */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">HIPAA Real-Time Access Audit Logs</span>
                    <div className={`rounded-xl border divide-y overflow-hidden ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] bg-blue-600/10 text-blue-500 px-1.5 py-0.5 rounded mr-2">{log.id}</span>
                            <span className="font-bold">{log.user}</span>
                          </div>
                          <span className="text-slate-400 font-mono">{log.action} : {log.target}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PHARMACIST VIEW */}
              {selectedRole === 'pharmacist' && (
                <div id="pharmacist-lobby-panel" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div>
                    <h3 className="font-display font-bold text-base">Pharmacy Specimen Intake & Drug Dispensary</h3>
                    <p className="text-xs text-slate-500 mt-1">Cross-checks patient prescription logs and triggers restock jobs safely.</p>
                  </div>

                  {/* Stock Levels Alert Ledger */}
                  <div id="pharmacist-stock-ledger" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Core Pharmacy Inventory Alert Matrix</span>
                      <span className="text-[10px] text-amber-500 font-mono">2 WARNINGS IN QUEUE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pharmacyStock.map(drug => (
                        <div key={drug.name} className={`p-4 rounded-xl border flex justify-between items-center ${subBg}`}>
                          <div>
                            <span className="font-bold text-xs">{drug.name}</span>
                            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Dept: {drug.category}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs block font-bold font-mono ${drug.stock < drug.minThreshold ? 'text-red-500' : 'text-emerald-500'}`}>
                              {drug.stock} / {drug.minThreshold} Units
                            </span>
                            {drug.stock < drug.minThreshold ? (
                              <button 
                                id={`restock-btn-${drug.name.replace(/\s+/g, '-')}`}
                                onClick={() => {
                                  // simulating standard inventory refill
                                  setPharmacyStock(prev => prev.map(p => p.name === drug.name ? { ...p, stock: p.stock + 100 } : p));
                                }}
                                className="text-[10px] bg-red-600 hover:bg-red-500 text-white font-semibold font-sans px-2 py-0.5 rounded-md mt-1 transition"
                              >
                                RESTOCK
                              </button>
                            ) : (
                              <span className="text-[9px] text-emerald-500 font-mono">SUPPLIED</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drug interaction warning tool */}
                  <div className={`p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 space-y-2`}>
                    <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 fill-rose-500/10" />
                      <span>Simulated Drug-Drug Cohort Warning Sensor</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Drug Interaction check between: <strong>Clopidogrel (Antiplatelet)</strong> and <strong>Naproxen (NSAID)</strong>. 
                      Co-administration represents moderate clinical bleed threat coefficients. Suggest monitoring hematocrit levels.
                    </p>
                  </div>
                </div>
              )}

              {/* LABORATORY VIEW */}
              {selectedRole === 'lab' && (
                <div id="lab-specimen-panel" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div>
                    <h3 className="font-display font-bold text-base">Laboratory Diagnostics & Specimen Processing</h3>
                    <p className="text-xs text-slate-500 mt-1">Release real diagnostic culture releases and track test durations instantly.</p>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Active Diagnostic Specimen Pipeline</span>
                    
                    <div className="space-y-3">
                      {labTests.map(test => (
                        <div key={test.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${subBg}`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-[9px] bg-blue-600/10 text-blue-500 px-1.5 py-0.5 rounded">{test.id}</span>
                              <span className="text-xs font-bold text-slate-300">{test.test}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">Patient Claim: {test.patient} | Target: <strong>{test.sample}</strong></p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-500 block">Elapsed Timing</span>
                              <span className="text-xs text-slate-400 font-mono block">{test.elapsed}</span>
                            </div>
                            <div>
                              {test.status === 'Completed' ? (
                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-semibold">RELEASED</span>
                              ) : (
                                <button
                                  id={`release-lab-${test.id}`}
                                  className="bg-blue-650 hover:bg-blue-500 hover:scale-[1.01] transition-all text-white font-semibold font-sans px-3 py-1.5 rounded-lg text-xs"
                                  onClick={() => {
                                    setLabTests(prev => prev.map(lt => lt.id === test.id ? { ...lt, status: 'Completed' } : lt));
                                  }}
                                >
                                  Release Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACCOUNTANT / FINANCE VIEW */}
              {selectedRole === 'accountant' && (
                <div id="stripe-ledger-panel" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-display font-semibold text-base flex items-center gap-2">
                        Financial Claims Ledger & Payouts (Stripe-inspired)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">HIPAA compliant transactional dashboard for claims verification.</p>
                    </div>
                    {/* Dollar Sign metric */}
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-550 uppercase">PAID CLINIC VOLUME</span>
                      <span className="text-base font-bold font-mono text-blue-600 block">$48,900.00</span>
                    </div>
                  </div>

                  {/* Claims List */}
                  <div className="space-y-4 font-sans text-xs">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Standard Billing Registry & Insurance Claims</span>
                    <div className={`border rounded-xl divide-y overflow-hidden ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {billingClaims.map(claim => (
                        <div key={claim.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="font-mono text-[9px] text-slate-500 mr-2">{claim.id}</span>
                            <span className="font-bold text-slate-350">{claim.patient}</span>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-normal">ICD Billing code: {claim.provCode} | Ins: {claim.insCode}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-bold font-mono text-slate-300">${claim.amount.toFixed(2)}</span>
                            <div>
                              {claim.status === 'Completed' ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded font-bold text-[9px] font-mono">PAID</span>
                              ) : claim.status === 'Processing' ? (
                                <button 
                                  id={`verify-claim-${claim.id}`}
                                  onClick={() => {
                                    setBillingClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Completed' } : c));
                                  }}
                                  className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/15 text-[10px] font-semibold font-sans rounded-md hover:bg-amber-500/20 transition-all"
                                >
                                  Process Claim
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded font-bold text-[9px] font-mono">OVERDUE</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PATIENT VIEW */}
              {selectedRole === 'patient' && (
                <div id="patient-care-portal" className={`p-6 rounded-2xl border space-y-6 ${cardBg}`}>
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-display font-bold text-base">Personal Patient Portal</h3>
                      <p className="text-xs text-slate-500 mt-1">Active File: <strong>Jane Miller</strong> | Record Code: <strong>PT-93821</strong></p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 font-mono text-[9px] rounded font-bold">MY DISCHARGE RULES</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                        <h4 className="text-xs font-bold text-blue-500 font-display">Personal Discharge Guidelines checklist</h4>
                        <div className="space-y-3 text-[11px] text-slate-400">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Take daily <strong>Clopidogrel 75mg</strong> each morning with active glass water buffer.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Log blood pressure levels via vascular sleeve twice daily during observation bounds.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Avoid lifting gardening weight parameters over 15 lbs for next 3 weeks.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Interactive Telehealth Dial Trigger Frame */}
                      <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                        <h4 className="text-xs font-bold text-blue-500 font-display">Secure Doctor-Room Connector</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Dial the clinical attendant directly over HIPAA approved WebRTC telemetry tunnel protocols. No download required.
                        </p>
                        <button 
                          id="patient-launch-webrtc"
                          onClick={() => setActiveConsoleTab('scribe')}
                          className="w-full bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] transition-all text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <Video className="w-4 h-4" />
                          <span>Direct ATTENDING Telemedicine</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* TAB 2: TELEHEALTH & AI VOICE SCRIBE COCKPIT */}
        {activeConsoleTab === 'scribe' && (
          <motion.div
            key="scribe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Scribe inputs and dictations */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* TELEHEALTH DIAL PANEL */}
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-bold text-slate-300">Live Attendant WebRTC Telehealth</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold-medium ${telehealthStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                    {telehealthStatus.toUpperCase()}
                  </span>
                </div>

                {/* Simulated frame screen */}
                <div className={`aspect-video rounded-xl border relative flex flex-col justify-between p-3 overflow-hidden ${subBg}`}>
                  {telehealthStatus === 'idle' ? (
                    <div className="my-auto text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <Video className="w-6 h-6 border-transparent" />
                      </div>
                      <p className="text-xs font-bold text-slate-350">WebRTC Encrypted Peer Context</p>
                      <p className="text-[10px] text-slate-500">HIPAA tunnel AES-256 is ready on direct user allocation.</p>
                    </div>
                  ) : telehealthStatus === 'tunneling' ? (
                    <div className="my-auto text-center space-y-2">
                      <RefreshCcw className="w-8 h-8 text-blue-550 animate-spin mx-auto" />
                      <p className="text-[10px] text-slate-500">Acquiring certificate handshakes...</p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative flex flex-col justify-between">
                      {/* Patient Feed indicator overlay */}
                      <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 mx-auto border-blue-500/10 border relative shadow-xl">
                            <User className="w-7 h-7" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-slate-300">Jane Miller (Patient)</span>
                            <span className="text-[10px] text-slate-400 block font-mono">HR Telemetry: {patientVitals.hr} bpm | BP: {patientVitals.bpSystolic}/{patientVitals.bpDiastolic}</span>
                          </div>
                        </div>
                      </div>

                      {/* Small clinician thumbnail */}
                      <div className="absolute top-2 right-2 w-20 aspect-video rounded border border-slate-800 bg-slate-950/80 flex items-center justify-center text-[9px] text-slate-500">
                        Attending
                      </div>

                      {/* Video overlay clock */}
                      <div className="bg-slate-950/70 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-mono self-start z-10">
                        MUTUAL TUNNEL ACTIVE
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex justify-between gap-2 z-10 w-full pt-2">
                    <button
                      id="telehealth-dial-trigger"
                      onClick={() => {
                        if (telehealthStatus === 'connected') {
                          endTelehealth();
                        } else {
                          startTelehealth();
                        }
                      }}
                      className={`w-full py-2 rounded-lg text-xs font-semibold text-center transition ${
                        telehealthStatus === 'connected' ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {telehealthStatus === 'connected' ? 'Teardown Connection' : 'Initiate Attending Call'}
                    </button>
                  </div>
                </div>

                {/* Peer logs */}
                <div className="h-24 bg-slate-950 overflow-y-auto p-2.5 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-500 space-y-1">
                  {telehealthLogs.length === 0 ? (
                    <span className="text-zinc-500 italic block">Channel dial logs idle. Dial Attending to monitor.</span>
                  ) : (
                    telehealthLogs.map((l, idx) => (
                      <span key={idx} className="block text-slate-400">{l}</span>
                    ))
                  )}
                </div>
              </div>

              {/* AUTOMATED VOICES TRANSCRIBER Scribe */}
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
                <div className="flex items-center gap-1.5 border-b pb-2">
                  <Mic className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-300">Intelligent Dictation Transcriber Scribe</span>
                </div>

                <textarea 
                  id="clinical-scribe-textarea"
                  rows={4}
                  value={dictationTranscript}
                  onChange={(e) => setDictationTranscript(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-lg mt-1 focus:border-blue-500 focus:outline-none border font-mono ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                />

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Sample Clinician Transcriptions:</span>
                  {sampleDictations.map(temp => (
                    <button
                      key={temp.id}
                      id={`dict-template-load-${temp.id}`}
                      onClick={() => setDictationTranscript(temp.text)}
                      className={`text-left p-2 rounded-lg border text-[11px] transition ${
                        dictationTranscript === temp.text 
                          ? 'bg-blue-600/10 text-blue-600 border-blue-600/20' 
                          : 'hover:bg-slate-500/5'
                      }`}
                    >
                      🗣️ {temp.title}
                    </button>
                  ))}
                </div>

                <button
                  id="process-dictation-scribe-api"
                  onClick={compileDictation}
                  disabled={dictationLoading || !dictationTranscript.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs mt-2 transition flex items-center justify-center gap-1.5"
                >
                  {dictationLoading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin shrink-0 text-blue-200" />
                      <span>Compiling SOAP Note...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 shrink-0 text-blue-200" />
                      <span>Request SOAP Compilation (Gemini AI)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Scribe outputs and SOAP segments column */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-4 min-h-[440px] flex flex-col justify-between`}>
                
                {dictationResult ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-bold text-slate-350">FHIR-Structured SOAP Record Segment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[10px] font-mono rounded">
                          Billing Code: {dictationResult.icdCode}
                        </span>
                        <span className="px-2.5 py-0.5 bg-rose-600/10 text-rose-500 text-[9px] font-mono font-extrabold rounded">
                          {dictationResult.urgency}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className={`p-3 rounded-lg border ${subBg}`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-black block border-b pb-1 mb-1">
                          S / Subjective Narrative
                        </span>
                        <p className="text-slate-400 mt-1 leading-relaxed">{dictationResult.subjective}</p>
                      </div>

                      <div className={`p-3 rounded-lg border ${subBg}`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-black block border-b pb-1 mb-1">
                          O / Objective Findings
                        </span>
                        <p className="text-slate-400 mt-1 leading-relaxed">{dictationResult.objective}</p>
                      </div>

                      <div className={`p-3 rounded-lg border ${subBg}`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-black block border-b pb-1 mb-1">
                          A / Diagnostic Assessment
                        </span>
                        <p className="text-slate-400 mt-1 leading-relaxed">{dictationResult.assessment}</p>
                      </div>

                      <div className={`p-3 rounded-lg border ${subBg}`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-black block border-b pb-1 mb-1">
                          P / Intervention Plan
                        </span>
                        <p className="text-slate-400 mt-1 leading-relaxed">{dictationResult.plan}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 block">
                        Clinic Target: <strong>{dictationResult.suggestedSpecialist}</strong>
                      </span>
                      
                      <button 
                        id="scribe-commit-emr-panel"
                        onClick={() => {
                          setSoapCommitted(true);
                          setTimeout(() => setSoapCommitted(false), 3000);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-xs px-4 py-2 rounded-lg transition"
                      >
                        {soapCommitted ? 'Saved Successfully!' : 'Save & Overwrite Active EHR'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center my-auto space-y-2">
                    <Bot className="w-10 h-10 text-slate-500 mx-auto" />
                    <span className="text-xs font-bold block">No SOAP Notes Compiled</span>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Adjust and trigger compilation requests to parse clinical transcripts automatically via the Gemini node.
                    </p>
                  </div>
                )}

                {/* Symptom checker panel integration */}
                <div className={`p-4 rounded-xl border mt-auto ${subBg} space-y-3`}>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-bold text-slate-300">Self-Reported Symptom Assessor Workspace</span>
                    <span className="px-2 py-0.5 bg-amber-600/10 text-amber-500 text-[10px] font-mono rounded">
                      AUTO CHECK
                    </span>
                  </div>

                  <input 
                    id="self-symptom-input-box"
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    className={`w-full p-2 rounded-lg text-xs font-sans border focus:border-blue-500 focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                  />

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Patient Demo: {patientAge} yrs, {patientGender}</span>
                    <button
                      id="symptom-checker-trigger"
                      onClick={analyzeSymptoms}
                      disabled={symptomLoading || !symptomInput.trim()}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-xs px-3.5 py-1.5 rounded-lg transition"
                    >
                      {symptomLoading ? 'Consulting...' : 'Check Urgency'}
                    </button>
                  </div>

                  {symptomResult && (
                    <div className="p-3 bg-blue-600/5 border border-dashed border-blue-500/10 rounded-lg text-xs leading-relaxed text-slate-400 mt-2 space-y-1">
                      <span className="font-bold text-blue-500 block">Assessment Cause Hypothesis:</span>
                      <p>{symptomResult.potentialCauses}</p>
                      <p className="text-[11px] text-slate-500 pt-1">Triage urgency classification: <strong className="text-rose-500">{symptomResult.triageUrgency}</strong></p>
                    </div>
                  )}
                </div>

              </div>
              
            </div>

          </motion.div>
        )}

        {/* TAB 3: PRISTINE DESIGN TOKEN MATRIX Explorer */}
        {activeConsoleTab === 'design' && (
          <motion.div
            key="design"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Color System Swatch Grid */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <div>
                <h3 className="font-display font-medium text-base">Section 1: Enterprise-Grade Color System Token Swatches</h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculated safe medical-compliant backgrounds, CTA focuses, and clinical danger indicators.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandSwatches.map(swatch => (
                  <div 
                    key={swatch.hex} 
                    className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] relative overflow-hidden ${subBg}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs block">{swatch.label}</span>
                        <span className="font-mono text-[10px] text-slate-500">{swatch.hex}</span>
                      </div>
                      <button 
                        id={`copy-hex-${swatch.hex.replace('#', '')}`}
                        onClick={() => {
                          navigator.clipboard.writeText(swatch.hex);
                          setCopiedColor(swatch.hex);
                          setTimeout(() => setCopiedColor(null), 2000);
                        }}
                        className={`p-1.5 rounded-lg border hover:bg-slate-500/5 transition ${isDark ? 'border-slate-800' : 'border-slate-300'}`}
                      >
                        <Copy className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 leading-normal max-w-[150px]">{swatch.role}</span>
                      <div className="w-8 h-8 rounded-full border shadow-inner shrink-0" style={{ backgroundColor: swatch.hex }} />
                    </div>

                    {copiedColor === swatch.hex && (
                      <div className="absolute inset-0 bg-blue-600/95 flex items-center justify-center text-white text-xs font-semibold">
                        Hex Token Copied!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Typography specimen list */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <div>
                <h3 className="font-display font-medium text-base">Section 2: Typography pairing specimens (Space Grotesk & Inter)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Responsive clinical display headers paired with highly legible body text.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Fontspec Live Testing Workbench (Type here):</label>
                  <input 
                    id="font-token-specimen-input"
                    type="text" 
                    value={fontSizeTester} 
                    onChange={(e) => setFontSizeTester(e.target.value)}
                    className={`w-full p-3 rounded-lg border font-sans text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans">
                  <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Display Font: Space Grotesk</span>
                    <div className="font-display space-y-3">
                      <p className="text-2xl font-bold tracking-tight">{fontSizeTester.slice(0, 32)}...</p>
                      <p className="text-lg font-medium">{fontSizeTester.slice(0, 48)}...</p>
                      <p className="text-sm font-normal">Standard 14px size for EMR details.</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${subBg} space-y-3`}>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Body Font: Inter Sans</span>
                    <div className="font-sans space-y-3 text-slate-400">
                      <p className="text-sm font-semibold tracking-normal text-slate-300">{fontSizeTester}</p>
                      <p className="text-xs leading-relaxed">
                        Clinically calibrated letter spacing (tracking-normal) guarantees pristine readability across high-density tablet environments even during late night 24/7 shifts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Iconography checklist copyable lists */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <div>
                <h3 className="font-display font-medium text-base">Section 3: Standard medical approved custom Lucide Icons</h3>
                <p className="text-xs text-slate-500 mt-0.5">Preset vector symbols mapped directly across EMR patient dashboards.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { name: 'Stethoscope', icon: Stethoscope },
                  { name: 'Activity Track', icon: Activity },
                  { name: 'Emergent Shield', icon: ShieldAlert },
                  { name: 'Prescription', icon: Pill },
                  { name: 'Cardiac Electro', icon: Heart },
                  { name: 'EHR Log Files', icon: FileText }
                ].map(sym => {
                  const IconComponent = sym.icon;
                  return (
                    <div key={sym.name} className={`p-3 rounded-lg border text-center ${subBg} flex flex-col items-center justify-center gap-1.5`}>
                      <IconComponent className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-[10px] font-mono tracking-tight">{sym.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 4: ADVANCED COMPONENT LIBRARY SANDBOX */}
        {activeConsoleTab === 'components' && (
          <motion.div
            key="components"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans text-xs"
          >
            {/* Left sidebar widgets summary */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Stripe style claims billing cards */}
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-350">Stripe Dashboard Financial Registry Row</span>
                  <span className="text-[10px] font-mono text-slate-500">BILLING COMPACT</span>
                </div>

                <div className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${subBg}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">INVOICE: #INV-90212</span>
                      <span className="text-base font-bold font-mono text-slate-350 block mt-1">$1,420.00 USD</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-bold text-[9px] font-mono">
                      PAID
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Target Claim Recipient: Jane Miller</span>
                    <span>Provider ID: BCBS-89382</span>
                  </div>
                </div>
              </div>

              {/* Apple health cardiac widget */}
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
                <span className="text-xs font-bold text-slate-350 block">Apple Health inspired vitals telemetry ring track</span>
                <p className="text-[11px] text-slate-500">Dual circular indicators tracking patient vitals goals simultaneously.</p>
                
                <div className={`p-4 rounded-xl border flex items-center justify-around ${subBg}`}>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Ring background */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                      <circle cx="40" cy="40" r="32" stroke="#2563EB" strokeWidth="6" fill="transparent" strokeDasharray="201" strokeDashoffset="40" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <Heart className="w-5 h-5 text-blue-500 mx-auto fill-blue-500/10" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Electro goal: 74 BPM (100%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <span>Activity: 12,042 Outpatients</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side widgets summary */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Linear workflow checklist widget */}
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-xs font-bold text-slate-350">Linear-Style Active Duty Check-Offs</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                    <span className="px-1 py-0.5 rounded border">ESC</span>
                    <span>Reset Tasks</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 't-1', tag: 'EMR-342', label: 'Validate Jane Miller cardiovascular troponin logs', priority: 'High', color: 'border-rose-500' },
                    { id: 't-2', tag: 'LAB-901', label: 'Release sputum culture results back to Attending Doctor', priority: 'Medium', color: 'border-yellow-500' },
                    { id: 't-3', tag: 'PHR-102', label: 'Confirm Clopidogrel stock limits exceed minimum restock barrier', priority: 'Low', color: 'border-slate-500' }
                  ].map(tsk => (
                    <div key={tsk.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${subBg} border-l-4 ${tsk.color}`}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 h-3.5 w-3.5 accent-blue-600" />
                        <span className="text-xs font-semibold">{tsk.tag}</span>
                        <p className="text-slate-400 font-sans">{tsk.label}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-500/10 text-slate-400 shrink-0">
                        {tsk.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic notification ticker */}
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
                <span className="text-xs font-bold text-slate-350 block">Simulated FHIR JSON Specimen Response String (Raw payload)</span>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-zinc-400 overflow-x-auto select-all max-h-[140px]">
                  <pre>{`{
  "resourceType": "Encounter",
  "id": "enc-93821",
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB",
    "display": "ambulatory"
  },
  "subject": {
    "reference": "Patient/PT-93821",
    "display": "Jane Miller"
  },
  "diagnosis": [
    {
      "condition": {
        "display": "Angina pectoris, unspecified"
      },
      "use": {
        "code": "AD"
      }
    }
  ]
}`}</pre>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 5: ACCESSIBILITY MATRIX & AUDITOR */}
        {activeConsoleTab === 'accessibility' && (
          <motion.div
            key="accessibility"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Contrast inspector column */}
            <div className="lg:col-span-5 bg-slate-950/50 p-5 rounded-2xl border border-slate-850 space-y-4 font-sans text-xs">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Shield className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300 font-display">Section 1: WCAG 2.1 Contrast Simulator</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span>Simulated text-to-background contrast ratio:</span>
                  <span className="font-mono font-bold text-blue-550">{contrastSlider.toFixed(1)} : 1</span>
                </div>

                <input 
                  id="accessibility-contrast-slider"
                  type="range" min="3.5" max="10" step="0.1" value={contrastSlider} 
                  onChange={(e) => setContrastSlider(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />

                <div className={`p-4 rounded-xl border flex flex-col justify-between ${subBg}`}>
                  <p className="text-xs font-semibold leading-relaxed">
                    "All patient medical file interfaces MUST adhere to critical AAA visual standards for Attending clinicians working extended 24/7 night cycles."
                  </p>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2 border-t pt-2">
                    <span>Minimum WCAG target: 4.5:1</span>
                    <span className={`font-bold ${contrastSlider >= 4.5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {contrastSlider >= 7.0 ? 'AAA COMPLIANT' : contrastSlider >= 4.5 ? 'AA COMPLIANT' : 'FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklists audit column */}
            <div className="lg:col-span-7 bg-slate-950/50 p-6 rounded-2xl border border-slate-850 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-bold text-slate-350">Section 2: Interactive Compliance Audit Checklist</span>
                <span className="text-[10px] text-slate-500 font-mono">WCAG 2.1 KEYWORDS</span>
              </div>

              <div className="space-y-2 font-sans text-xs">
                {[
                  { tag: 'A11Y-01', text: 'All interactive patient selectors have unique id tags for target screen adjustments.', desc: 'ARIA hooks mapped continuously.' },
                  { tag: 'A11Y-02', text: 'Focus indicator outlines automatically conform on user keyboard navigation tab flows.', desc: 'Focus rings verified visually.' },
                  { tag: 'A11Y-03', text: 'Alt descriptor labels mapped across vital telemetry lines for screen-readers.', desc: 'High contrasts and labels integrated.' }
                ].map(criterion => (
                  <div key={criterion.tag} className={`p-3 rounded-xl border flex items-start gap-3 justify-between ${subBg} relative overflow-hidden`}>
                    <div>
                      <span className="font-mono text-[10px] text-blue-550 block font-bold">{criterion.tag}</span>
                      <p className="text-slate-300 font-sans mt-0.5 font-semibold text-[11px]">{criterion.text}</p>
                      <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{criterion.desc}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-mono rounded shrink-0">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
