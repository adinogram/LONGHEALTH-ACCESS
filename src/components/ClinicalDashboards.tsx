/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Stethoscope, Activity, Heart, RefreshCw, Send, AlertTriangle, 
  Calendar, CheckCircle, TrendingUp, CheckSquare, Sparkles, FileText, Bot, 
  ArrowRight, User, Plus, PhoneOff, Check, AlertCircle, Eye, ChevronRight,
  ClipboardList, Play, Pill, Info, HeartPulse, Clock, Trash2, Hospital
} from 'lucide-react';
import { ClinicalRole, PatientVitals, BedPlacement, DrugStockItem, LabSpecimen } from '../types';

interface ClinicalDashboardsProps {
  role: 'doctor' | 'nurse';
  isDark: boolean;
  patientVitals: PatientVitals;
  setPatientVitals: React.Dispatch<React.SetStateAction<PatientVitals>>;
  bedPlacements: BedPlacement[];
  onPrescribeMed: (medName: string, notes: string) => void;
  activeDrugOrders: Array<{ drug: string; dosage: string; patient: string; timestamp: number }>;
}

export const ClinicalDashboards: React.FC<ClinicalDashboardsProps> = ({
  role,
  isDark,
  patientVitals,
  setPatientVitals,
  bedPlacements,
  onPrescribeMed,
  activeDrugOrders
}) => {
  // Doctor AI Symptom Assistant States
  const [symptomInput, setSymptomInput] = useState<string>('Severe pressure tightness in middle chest radiating over left shoulder. Sweaty nausea and severe breath shortens.');
  const [patientGender, setPatientGender] = useState<string>('FEMALE');
  const [patientAge, setPatientAge] = useState<number>(58);
  const [patientHistory, setPatientHistory] = useState<string>('Hypertension (5y), Clopidogrel intake daily, heavy maternal history of CAD.');
  const [symptomLoading, setSymptomLoading] = useState<boolean>(false);
  const [symptomAnalysisResult, setSymptomAnalysisResult] = useState<any | null>({
    triageUrgency: 'HIGH',
    differentialDiagnoses: ['Myocardial Infarction', 'Unstable Angina', 'Pulmonary Embolism'],
    potentialCauses: 'Atypical Acute Coronary Ischemia or angina pectoris triggered by maternal CAD and vascular stress indices.',
    clinicalSpecialist: 'Cardiology Critical Care (EMG)',
    safetyAdvisory: 'Instruct client to remain in bed rest. Do not allow patient to walk or undergo physical exertion. Target Troponin serum assays series.',
    recommendedTests: ['12-Lead EKG within 10 minutes', 'Serum Troponin I markers', 'Chest computed tomography (CT) scanned'],
    detailedExplanation: 'Presented symptoms with radiating left arm load and secondary hypertension factors warrants sudden telemetry mapping to prevent coronary complications.'
  });

  // Doctor Prescription Form States
  const [rxDrug, setRxDrug] = useState<string>('Clopidogrel 75mg');
  const [rxNotes, setRxNotes] = useState<string>('Take 1 capsule oral daily mornings. Restrict aerobic stress.');
  const [prescriptionAlert, setPrescriptionAlert] = useState<string | null>(null);

  // Nurse ward assignment metrics
  const [nurseLogs, setNurseLogs] = useState<string[]>([
    'Dr Evelyn assigned bed clearance on PT-93821.',
    'Assigned cardiac Holter continuous stream sensor Cardio 04.',
    'Metabolic panels results drawing ordered by Pathology scientists.'
  ]);
  const [newNurseLogMsg, setNewNurseLogMsg] = useState<string>('');

  // 1. Submit Doctor symptoms diagnostic to AI server API
  const handleSymptomAnalyze = async () => {
    if (!symptomInput.trim()) return;
    setSymptomLoading(true);
    setSymptomAnalysisResult(null);
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
      setSymptomAnalysisResult(data.fallback || data);
    } catch (err) {
      // offline fallback
      setTimeout(() => {
        setSymptomAnalysisResult({
          triageUrgency: 'HIGH',
          differentialDiagnoses: ['Myocardial Angina pectoris', 'Cardiopulmonary Spasms'],
          potentialCauses: 'Localized vascular compression associated with secondary maternal coronary artery histories.',
          clinicalSpecialist: 'Cardiovascular Services Unit',
          safetyAdvisory: 'Advise absolute physical rest. Administer immediate ECG and troponin level screens.',
          recommendedTests: ['Cardiac telemetry Holter ECG', 'Troponin-T Serum assays'],
          detailedExplanation: 'Hypertension coupled with radiating left arm tightness demands acute cardiac evaluation rules out.'
        });
        setSymptomLoading(false);
      }, 1000);
      return;
    }
    setSymptomLoading(false);
  };

  // 2. Submit RX builder
  const handlePrescribeMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPrescribeMed(rxDrug, rxNotes);
    setPrescriptionAlert(`Successfully issued prescription: ${rxDrug} for Jane Miller. Synchronizing with pharmacy stock...`);
    setTimeout(() => setPrescriptionAlert(null), 3000);
  };

  const handleAddNurseLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNurseLogMsg.trim()) return;
    setNurseLogs(prev => [newNurseLogMsg, ...prev]);
    setNewNurseLogMsg('');
  };

  // Helper calculating cardiovascular danger level based on nurse vitals
  const getSimulatedRiskAssessment = () => {
    let base = 5;
    if (patientVitals.hr > 100 || patientVitals.hr < 60) base += 25;
    if (patientVitals.spo2 < 95) base += 30;
    if (patientVitals.spo2 < 90) base += 35;
    if (patientVitals.bpSystolic > 140) base += 15;
    if (patientVitals.bpSystolic > 160) base += 20;

    const score = Math.round(Math.min(base, 98));

    let triage = 'STABLE (LOW)';
    let color = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    let advisory = 'Discharge following standard clinic guidelines. Schedule secondary review in 10 days.';

    if (score >= 20 && score < 45) {
      triage = 'WARD OBSERVATION (MODERATE)';
      color = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      advisory = 'Monitor bed telemetry closely. Take manual blood pressures checks every 4 hours.';
    } else if (score >= 45 && score < 70) {
      triage = 'ACUTE MONITORING (HIGH)';
      color = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      advisory = 'Notify attending cardiologist. Prepare cardiac enzyme Troponin IV access kits.';
    } else if (score >= 70) {
      triage = 'CRITICAL STAT EMERGENCY (CRITICAL)';
      color = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse';
      advisory = 'CRITICAL ALERT: Call emergency code team beds immediately. Prepare oxygen support mask.';
    }

    return { score, triage, color, advisory };
  };

  const riskResult = getSimulatedRiskAssessment();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Clinician Overview Banner */}
      <div className={`p-6 rounded-2xl border transition ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Stethoscope className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {role === 'doctor' ? '🥼 Attending Physician Triage Dashboard' : '🏥 Ward Nurse Duty Station'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Scope: <strong>Ward B & Cardio Bed Obs.</strong> • Clinical Staff Auth Token: <strong className="font-mono text-emerald-600">EHR-STAF-9092</strong>
              </p>
            </div>
          </div>
          <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider font-bold">
            ● 24/7 Ward Duty ACTIVE
          </span>
        </div>
      </div>

      {role === 'doctor' ? (
        /* ================= DOCTOR VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: AI Diagnostic Assistant Tool */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-5`}>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Intelligent AI Clinical Triage Assistant</h4>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase">
                  HL7 COMPLIANT SYMPTOM CHECK
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Patient Age (Years):</label>
                  <input 
                    type="number" value={patientAge} onChange={(e) => setPatientAge(parseInt(e.target.value) || 58)}
                    className={`w-full p-2 rounded-lg border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Patient Gender:</label>
                  <select 
                    value={patientGender} onChange={(e) => setPatientGender(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="FEMALE">Female Outpatient</option>
                    <option value="MALE">Male Outpatient</option>
                    <option value="UNSPECIFIED">Other / Intersex</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Pre-recorded Presets:</label>
                  <select
                    onChange={(e) => {
                      const opt = e.target.value;
                      if (opt === 'mi') {
                        setSymptomInput('Severe chest squeezing tightness radiating over left shoulder and jaw lines, sweaty nausea, rapid short breaths.');
                        setPatientHistory('Hypertension 5y, mother fatal coronary block.');
                        setPatientAge(58);
                        setPatientGender('FEMALE');
                      } else if (opt === 'peds') {
                        setSymptomInput('Barking persistent pediatric cough with sudden throat swelling, visual fever, barking sounds.');
                        setPatientHistory('None, allergy sensitive.');
                        setPatientAge(6);
                        setPatientGender('MALE');
                      } else if (opt === 'diab') {
                        setSymptomInput('Numbness on bilat distal lower extremities. Prickling sensations under heavy cold state.');
                        setPatientHistory('Type-2 Diabetes 12y, takes Metformin 500mh daily.');
                        setPatientAge(64);
                        setPatientGender('MALE');
                      }
                    }}
                    className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="">-- Load Demographics --</option>
                    <option value="mi">Cardiology Profile (Jane Miller)</option>
                    <option value="peds">Pediatric Cough Profile</option>
                    <option value="diab">Diabetic Autonomic Neuropathy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Medical Medical History & Comorbidities:</label>
                <input 
                  type="text" value={patientHistory} onChange={(e) => setPatientHistory(e.target.value)}
                  className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Attending Physician Symptoms Intake:</label>
                <textarea 
                  value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs leading-relaxed ${isDark ? 'bg-slate-950 border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-755'}`}
                  rows={3}
                />
              </div>

              <button 
                onClick={handleSymptomAnalyze}
                disabled={symptomLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition-all"
              >
                {symptomLoading ? 'Consulting LONGHEALTH AI Diagnostics...' : 'Trigger AI Symptom & Triage Check'}
              </button>

              {symptomAnalysisResult && (
                <div className={`p-5 rounded-xl border space-y-4 animate-fade-in text-xs leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-emerald-500/20'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Diagnostic Analysis Response</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                      symptomAnalysisResult.triageUrgency === 'CRITICAL' || symptomAnalysisResult.triageUrgency === 'HIGH' ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      TRIAGE TIER: {symptomAnalysisResult.triageUrgency}
                    </span>
                  </div>

                  <div className="space-y-3 font-sans text-slate-600 dark:text-slate-350">
                    <p><strong>🩺 Potential Primary Etiology:</strong> {symptomAnalysisResult.potentialCauses}</p>
                    
                    <div>
                      <strong>📋 Differential Diagnosis Candidates:</strong>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {symptomAnalysisResult.differentialDiagnoses?.map((cond: string) => (
                          <span key={cond} className="px-2 py-0.5 bg-slate-500/10 rounded font-bold text-[10px] text-slate-500 dark:text-slate-400 border">
                            {cond}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p><strong>🥼 Diagnostic Specialist:</strong> <strong className="text-emerald-600 dark:text-emerald-400">{symptomAnalysisResult.clinicalSpecialist}</strong></p>
                    
                    <div className="p-3 bg-red-600/5 text-rose-600 dark:text-rose-400 border border-dashed border-rose-500/20 rounded-lg flex items-start gap-1.5 leading-normal">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>Critical Safety Advisory:</strong> {symptomAnalysisResult.safetyAdvisory}</span>
                    </div>

                    <div>
                      <strong>🧪 Recommended Laboratory Tests & Direct Panels:</strong>
                      <ul className="list-disc list-inside mt-1 ml-1 space-y-1 text-[11px] text-slate-700 dark:text-slate-400">
                        {symptomAnalysisResult.recommendedTests?.map((test: string) => (
                          <li key={test}>{test}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Block: Rx Prescription Creator & Patients list */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Rx issuer */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex items-center gap-1.5 border-b pb-3">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Write Medication Rx Prescription</h4>
              </div>

              <form onSubmit={handlePrescribeMedSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Target Patient Admission Area:</label>
                  <select className={`w-full p-2 rounded-lg border text-xs font-semibold ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                    <option value="PT-93821">Jane Miller (PT-93821) Cardio Bed 04</option>
                    <option value="PT-10334">Roger Sterling (PT-10334)</option>
                    <option value="PT-88392">Clarissa Harlowe (PT-88392)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Specify Drug & Dosage (In Stock):</label>
                  <select 
                    value={rxDrug} onChange={(e) => setRxDrug(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="Clopidogrel 75mg">Clopidogrel 75mg (Anticoagulant)</option>
                    <option value="Naproxen 500mg">Naproxen 500mg (Analgesic)</option>
                    <option value="Metformin 850mg">Metformin 850mg (Hypoglycemic)</option>
                    <option value="Lisino-Vasotec 10mg">Lisino-Vasotec 10mg (Antihypertensive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">FDA Intake & Sched Administration Notes:</label>
                  <textarea 
                    value={rxNotes} onChange={(e) => setRxNotes(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
                    rows={2}
                    required 
                  />
                </div>

                <button 
                  type="submit"
                  id="doctor-prescribe-rx-btn"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg transition"
                >
                  Issue EMR Prescription
                </button>

                {prescriptionAlert && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] rounded-lg leading-normal flex items-start gap-1.5 animate-flash">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    <span>{prescriptionAlert}</span>
                  </div>
                )}
              </form>
            </div>

            {/* List of active prescriptions */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
              <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Sent Pharmacy Invoices</h4>
              <div className="space-y-2">
                {activeDrugOrders.length === 0 ? (
                  <span className="text-[11px] text-slate-500 block text-center py-2">No prescriptions dispatched this session.</span>
                ) : (
                  activeDrugOrders.map((ord, id) => (
                    <div key={id} className="p-2.5 rounded-lg border text-[11px] bg-slate-50/85 dark:bg-slate-950/40 relative">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{ord.drug}</span>
                      <p className="text-slate-450 mt-0.5 block">{ord.dosage}</p>
                      <span className="text-[9px] text-slate-500 block mt-1 font-mono">Recipient: {ord.patient}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= NURSE VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: Patients Vitals Adjuster and Continuous telemetry monitor */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Vitals simulator */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-[#1a1e2b]' : 'bg-white border-slate-200'} space-y-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Patient Vitals Telemetry Simulator (Jane Miller)</h4>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 rounded">
                  Active Bed: Cardio 04
                </span>
              </div>

              {/* Alert State Triggered by low vitals */}
              {patientVitals.spo2 < 90 && (
                <div className="p-4 bg-rose-600/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-start gap-2 text-xs leading-normal animate-pulse">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <strong>CRITICAL TELEMETRY SPIKE (SpO2 CRITICAL):</strong>
                    <span className="block mt-0.5 text-slate-500">Oxygen levels dip to {patientVitals.spo2}%. This represents immediate tissue hypoxia risk. Order supplemental oxygen STAT and alert Dr. Evelyn.</span>
                  </div>
                </div>
              )}

              {patientVitals.hr > 110 && (
                <div className="p-4 bg-orange-600/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-start gap-2 text-xs leading-normal animate-pulse">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                  <div>
                    <strong>TACTICAL ALERT (Tachycardia surge):</strong>
                    <span className="block mt-0.5 text-slate-500">Heart rate has surged to {patientVitals.hr} BPM. Monitor ST-segments on current beds telemetry immediately.</span>
                  </div>
                </div>
              )}

              {/* Ranges panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">Attending Heart Rate:</span>
                      <span className="font-mono text-xs font-bold text-emerald-600">{patientVitals.hr} BPM</span>
                    </div>
                    <input 
                      id="vital-slider-hr"
                      type="range" min="40" max="160" value={patientVitals.hr}
                      onChange={(e) => setPatientVitals(prev => ({ ...prev, hr: parseInt(e.target.value) }))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>Bradycardia (&lt;60)</span>
                      <span>Target (60-90)</span>
                      <span>Tachycardia (&gt;100)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">Oxygen level SpO2:</span>
                      <span className="font-mono text-xs font-bold text-emerald-600">{patientVitals.spo2}% SpO2</span>
                    </div>
                    <input 
                      id="vital-slider-spo2"
                      type="range" min="80" max="100" value={patientVitals.spo2}
                      onChange={(e) => setPatientVitals(prev => ({ ...prev, spo2: parseInt(e.target.value) }))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5 justify-end">
                      <span className="text-rose-500 font-bold block mr-auto">SPO2 Alert (&lt;90%)</span>
                      <span className="text-slate-400">Pristine Ranges (95-100%)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">Systolic blood pressure:</span>
                      <span className="font-mono text-xs font-bold text-emerald-600">{patientVitals.bpSystolic} mmHg</span>
                    </div>
                    <input 
                      id="vital-slider-bpsys"
                      type="range" min="80" max="200" value={patientVitals.bpSystolic}
                      onChange={(e) => setPatientVitals(prev => ({ ...prev, bpSystolic: parseInt(e.target.value) }))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold">Core Temperature (°F):</span>
                      <span className="font-mono text-xs font-bold text-emerald-600">{patientVitals.temp}°F</span>
                    </div>
                    <input 
                      id="vital-slider-temp"
                      type="range" min="95" max="105" step="0.1" value={patientVitals.temp}
                      onChange={(e) => setPatientVitals(prev => ({ ...prev, temp: parseFloat(e.target.value) }))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5 justify-end">
                      <span className="text-slate-400 mr-auto font-medium">Hypothermia (&lt;96)</span>
                      <span className="text-rose-500 font-bold">Fever (&gt;100.4)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient risk predictor readout */}
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-dashed border-emerald-500/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 mb-2 gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Calculated Clinical Decision Risk Core</span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold border ${riskResult.color}`}>
                    {riskResult.triage}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-center bg-white dark:bg-slate-950 p-3 rounded-lg border w-24">
                    <span className="text-2xl font-bold font-display text-emerald-600">{riskResult.score}%</span>
                    <span className="text-[9px] text-slate-450 block uppercase font-mono mt-0.5">MACE Risk</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal font-sans">
                    <strong>Vitals Prediction:</strong> Based on clinical inputs, {riskResult.advisory}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Active Ward Log & Beds placement chart */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Bed placement queue */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
              <h4 className="font-display font-medium text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider block">Real-time Ward Rooms Occupancy</h4>
              <div className="space-y-3.5">
                {bedPlacements.map(bed => (
                  <div key={bed.id} className="text-xs flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-slate-950">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-350">{bed.pt} ({bed.age}y)</span>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{bed.room}</span>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                        bed.pt === 'Jane Miller' && patientVitals.spo2 < 90 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                      }`} />
                      <span className="font-mono text-[10px] font-medium text-slate-455">
                        {bed.pt === 'Jane Miller' ? `${patientVitals.hr} BPM` : bed.telemetry}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nurse Duty Logs */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Add Shift Duty Logs</h4>
              
              <form onSubmit={handleAddNurseLog} className="flex gap-2">
                <input 
                  type="text" placeholder="Record telemetry change..." 
                  value={newNurseLogMsg} onChange={(e) => setNewNurseLogMsg(e.target.value)}
                  className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold">
                  Post
                </button>
              </form>

              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {nurseLogs.map((log, index) => (
                  <div key={index} className="text-[11px] text-slate-500 font-sans border-b border-slate-500/10 pb-1.5 last:border-b-0 leading-normal">
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
