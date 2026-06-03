/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, Play, CheckCircle, Clock, 
  CalendarRange, Sparkles, CreditCard, Bot, Pill, Info, HeartPulse, 
  FileText, Calendar, Plus, ChevronRight, CheckCircle2, UserCheck, ShieldCheck, Activity
} from 'lucide-react';
import { ClinicalRole, BillingClaim } from '../types';

interface PatientsPortalProps {
  isDark: boolean;
  onBookSuccess: (appt: any) => void;
  billingClaims: BillingClaim[];
  onPayClaim: (id: string) => void;
}

export const PatientsPortal: React.FC<PatientsPortalProps> = ({ 
  isDark, 
  onBookSuccess,
  billingClaims, 
  onPayClaim 
}) => {
  // Telehealth States
  const [telehealthStatus, setTelehealthStatus] = useState<'idle' | 'tunneling' | 'connected' | 'ended'>('idle');
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [videoOn, setVideoOn] = useState<boolean>(true);
  const [audioOn, setAudioOn] = useState<boolean>(true);
  const [telehealthLogs, setTelehealthLogs] = useState<string[]>([]);

  // AI Scribe States
  const [selectedTranscript, setSelectedTranscript] = useState<string>('Patient details: 58-year-old female complaining of chest tightness over 4 hours. High blood pressure 145/92. No primary coronary histories, but smokes daily since 10 years.');
  const [scribeLoading, setScribeLoading] = useState<boolean>(false);
  const [soapNotes, setSoapNotes] = useState<any | null>(null);

  // Appointment Form States
  const [dept, setDept] = useState<string>('Cardiology');
  const [dateVal, setDateVal] = useState<string>('2026-06-15');
  const [timeVal, setTimeVal] = useState<string>('10:00');
  const [apptNotes, setApptNotes] = useState<string>('');
  const [bookedPrompt, setBookedPrompt] = useState<boolean>(false);

  // Stripe Payment Form
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState<string>('Jane Miller');
  const [payingSuccess, setPayingSuccess] = useState<boolean>(false);

  const startTelehealthSim = () => {
    setTelehealthStatus('tunneling');
    setTelehealthLogs(['[RTC] Initializing secure HIPAA SDP peer exchange...', '[SSL] Negotiating AES-256 session transport...']);
    setTimeout(() => {
      setTelehealthLogs(prev => [...prev, '[P2P] Spliced stable video packet flow.', '[Ready] Linked to Dr. Evelyn Reed (Cardiology)']);
      setTelehealthStatus('connected');
    }, 1200);
  };

  const endTelehealthSim = () => {
    setTelehealthStatus('ended');
    setTelehealthLogs(prev => [...prev, '[P2P] Session terminated. Cleared stream indices.']);
  };

  // Compile Dictation with actual server API
  const runAIScribe = async () => {
    setScribeLoading(true);
    setSoapNotes(null);
    try {
      const res = await fetch('/api/clinical-ai/voice-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: selectedTranscript })
      });
      const data = await res.json();
      setSoapNotes(data.fallback || data);
    } catch (err) {
      // offline fallback
      setTimeout(() => {
        setSoapNotes({
          subjective: 'Patient presented with chest tightening over 4 hours. Sweating, radiating to left shoulder.',
          objective: 'Blood pressure high at 145/92. Oxygen saturation stable at 96% on room air.',
          assessment: 'Atypical Coronary Syndrome / Incipient Angina (ICD-10: I20.9)',
          plan: 'Schedule STAT EKG. Administer Aspirin. Run Cardiac biomarker profile.',
          urgency: 'HIGH',
          icdCode: 'I20.9',
          suggestedSpecialist: 'Cardiology prevent clinic'
        });
        setScribeLoading(false);
      }, 1000);
      return;
    }
    setScribeLoading(false);
  };

  // Handle appointment scheduling
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppt = {
      id: `APP-${Math.floor(Math.random() * 90000 + 10000)}`,
      patient: 'Jane Miller (PT-93821)',
      department: dept,
      date: dateVal,
      time: timeVal,
      notes: apptNotes || 'Routine cardiology reassessment check',
      status: 'Awaiting Intake Nurse'
    };
    onBookSuccess(newAppt);
    setBookedPrompt(true);
    setApptNotes('');
    setTimeout(() => setBookedPrompt(false), 4000);
  };

  const startPaymentSim = (id: string) => {
    setPayingBillId(id);
    setPayingSuccess(false);
  };

  const submitPaymentSim = () => {
    setPayingSuccess(true);
    setTimeout(() => {
      onPayClaim(payingBillId!);
      setPayingBillId(null);
      setPayingSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Friendly Patient Welcome Area */}
      <div className={`p-6 rounded-2xl border transition ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-500/5 border-emerald-100'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-emerald-800 dark:text-emerald-400">Welcome Back, Jane Miller</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Health Record Number: <strong className="font-mono text-emerald-600 dark:text-emerald-400">PT-93821</strong> • Age: 58 • Assigned Cardiologist: Dr. Evelyn Reed
            </p>
          </div>
          <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Outpatient Care Connected</span>
          </span>
        </div>
        
        {/* Support Alert banner */}
        <div className="mt-4 p-3 bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p>
            <strong>Calm Health Companion Notice:</strong> If you feel active, crushing pain radiating into your jaw, left arm, or back, please call emergency services immediately directly or proceed to the closest emergency room in Cardio Bed 04 triage. Do not use this portal for immediate life-threatening chest peaks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Virtual Consult & Scribe Notes */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Telehealth Booth container */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">Simulate Digital Telemedicine Booth</h4>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                telehealthStatus === 'connected' ? 'bg-emerald-500/15 text-emerald-600 animate-pulse' : 'bg-slate-500/10 text-slate-500'
              }`}>
                {telehealthStatus === 'idle' ? '● READY FOR CALL' : telehealthStatus === 'tunneling' ? '● TUNNELING CLIENT...' : '● ACTIVE HIPAA PEER'}
              </span>
            </div>

            {telehealthStatus === 'idle' && (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl space-y-4 border border-dashed border-slate-200 dark:border-slate-800/80">
                <Video className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <span className="block font-semibold text-xs text-slate-700 dark:text-slate-350">Launch HIPAA-Secured Video Call</span>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">This establishes a direct, private WebRTC connection with Dr. Evelyn Reed using browser isolation parameters.</p>
                </div>
                <button 
                  onClick={startTelehealthSim}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition hover:scale-[1.01]"
                >
                  Join Video Consult Room
                </button>
              </div>
            )}

            {telehealthStatus === 'tunneling' && (
              <div className="p-10 text-center bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3">
                <Activity className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
                <span className="block text-xs font-mono text-slate-500">Contacting STUN/TURN Signaling Servers...</span>
              </div>
            )}

            {telehealthStatus === 'connected' && (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  {/* Outer Patient feed representational box */}
                  <div className="text-center space-y-2 p-4">
                    <HeartPulse className="w-10 h-10 text-emerald-500 animate-pulse mx-auto opacity-75" />
                    <span className="font-display font-bold text-sm text-slate-700 dark:text-slate-300">Consultation Active: Dr. Evelyn Reed</span>
                    <p className="text-xs text-slate-500">Streaming secure clinical voice and telemetry parameters.</p>
                  </div>

                  {/* Micro self camera corner container */}
                  <div className="absolute bottom-3 right-3 w-32 aspect-video bg-emerald-500/10 border border-emerald-500/30 rounded-lg overflow-hidden flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-emerald-600">Jane Miller (Self)</span>
                  </div>

                  {/* Controls overlay */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>0:44 / AES SECURE</span>
                  </div>
                </div>

                {/* Call Buttons */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAudioOn(!audioOn)}
                      className={`p-2.5 rounded-lg border transition ${audioOn ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                      title="Mute Audio"
                    >
                      {audioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setVideoOn(!videoOn)}
                      className={`p-2.5 rounded-lg border transition ${videoOn ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                      title="Toggle Camera"
                    >
                      {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <button 
                    onClick={endTelehealthSim}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    Disconnect Care Line
                  </button>
                </div>
              </div>
            )}

            {telehealthStatus === 'ended' && (
              <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-500/10 rounded-xl space-y-2">
                <span className="block font-bold text-xs text-rose-600">Telehealth Consult Disconnected</span>
                <p className="text-[11px] text-slate-500">Video channels tore down. Real-time patient state cached locally in clinical file summaries.</p>
                <button 
                  onClick={() => setTelehealthStatus('idle')}
                  className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Start New consult session
                </button>
              </div>
            )}
          </div>

          {/* AI Clinical Translation (SOAP compiler) */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">Gemini Clinical Scribe Notes Translator</h4>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold uppercase">
                AI Copilot
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Compile your verbal consult transcripts or intake journals instantly into structures conforming to clinical SOAP standards. Reduces patient medical jargon anxiety:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Select Consultation Dictation Template:</label>
                <select 
                  value={selectedTranscript}
                  onChange={(e) => setSelectedTranscript(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs font-sans ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <option value="Patient details: 58-year-old female complaining of chest tightness over 4 hours. High blood pressure 145/92. No primary coronary histories, but smokes daily since 10 years.">Cardiology Consultation Summary (Jane M.)</option>
                  <option value="Routine medication test run. Patient takes Metformin 500mh for Type-2 Diabetes. Checked glucose this morning, registering 138. Podiatry evaluation exhibits mild tactile reduction but vascular pulses normal.">Diabetic Blood panel Review (Roger S.)</option>
                  <option value="Young patient presented with rapid bark-like pediatric cough and sudden voice hoarseness. Oral temperature checks 101.4F. Hydration stable. Swab taken.">Acute Pediatric Fever assessment</option>
                </select>
              </div>

              <button 
                id="clinical-scribe-translate-btn"
                onClick={runAIScribe}
                disabled={scribeLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                {scribeLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-white" />
                    <span>Transcribing & Analysing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Run AI Medical Translator</span>
                  </>
                )}
              </button>

              {soapNotes && (
                <div className={`p-4 rounded-xl border space-y-3 p-4 text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-emerald-500/20'}`}>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>Synthesized Clinical Record Format</span>
                    </span>
                    <span className="font-mono text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold uppercase">
                      ICD-10: {soapNotes.icdCode}
                    </span>
                  </div>

                  <div className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    <p><strong>🩺 Subjective Symptoms:</strong> {soapNotes.subjective}</p>
                    <p><strong>🔬 Objective Assessment:</strong> {soapNotes.objective}</p>
                    <p><strong>🥼 Diagnostic Assessment:</strong> {soapNotes.assessment}</p>
                    <p><strong>📋 Patient Care Plan:</strong> {soapNotes.plan}</p>
                    {soapNotes.suggestedSpecialist && (
                      <p className="pt-1.5 border-t border-slate-500/10 text-[11px] text-slate-550">
                        Recommended Service Category: <strong>{soapNotes.suggestedSpecialist}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Bookings & Stripe payments */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Easy Appointment booking calendar */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <div className="flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-emerald-600" />
              <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">Elderly Friendly Appointment Booker</h4>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Select Specialty Clinic:</label>
                <select 
                  value={dept} 
                  onChange={(e) => setDept(e.target.value)}
                  className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <option value="Cardiology">Prevention Cardiology (Dr. Evelyn Reed)</option>
                  <option value="General Medicine">General Outpatient Clinic</option>
                  <option value="Pediatrics">Family Pediatrics</option>
                  <option value="Neurology">Diagnostic Neurology</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Preferred Date:</label>
                  <input 
                    type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} 
                    className={`w-full p-2 rounded-lg border text-xs font-mono ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Preferred Time:</label>
                  <input 
                    type="time" value={timeVal} onChange={(e) => setTimeVal(e.target.value)} 
                    className={`w-full p-2 rounded-lg border text-xs font-mono ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1">Brief Description of Discomfort:</label>
                <input 
                  type="text" placeholder="E.g., chest tightness during gardening" 
                  value={apptNotes} onChange={(e) => setApptNotes(e.target.value)}
                  className={`w-full p-2 rounded-lg border text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
                  required 
                />
              </div>

              <button 
                type="submit"
                id="patient-book-appt-submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg transition"
              >
                Book Appointment Confirmation
              </button>

              {bookedPrompt && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-800 text-[11px] leading-relaxed flex items-start gap-1.5 animate-flash">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Your booking has been requested! Admissions staff will confirm alignment within 15 minutes.</span>
                </div>
              )}
            </form>
          </div>

          {/* Stripe direct claims insurance visual invoice payments */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h4 className="font-display font-medium text-sm text-slate-900 dark:text-slate-100">Pay Outstanding Invoices</h4>
            </div>

            <div className="space-y-2.5">
              {billingClaims.filter(c => c.status !== 'Completed').length === 0 ? (
                <div className="p-4 text-center bg-slate-50 dark:bg-slate-950 rounded-lg border text-xs text-slate-400">
                  <span className="block font-medium">All accounts clear</span>
                  <span>No outstanding clinical balances.</span>
                </div>
              ) : (
                billingClaims.filter(c => c.status !== 'Completed').map(claim => (
                  <div key={claim.id} className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-950 flex flex-col gap-2 border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[10px] block">INVOICE: #{claim.id}</span>
                        <span className="text-[11px] text-slate-500">{claim.date} • Code: {claim.provCode}</span>
                      </div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 font-mono">${claim.amount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-slate-500/10">
                      <span className="text-amber-500 font-bold uppercase">{claim.status}</span>
                      <button 
                        id={`pay-bill-btn-${claim.id}`}
                        onClick={() => startPaymentSim(claim.id)} 
                        className="bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded hover:bg-emerald-500 transition"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulated Checkout Drawer */}
            {payingBillId && (
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-emerald-500/5 border-emerald-500/20'} animate-fade-in`}>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-xs">Simulated Credit Card checkout</span>
                  <span className="font-mono text-[10px] text-slate-500">Stripe Sandbox Secure</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase">Card details:</label>
                    <input 
                      type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                      className={`w-full p-2 rounded border text-xs font-mono font-bold ${isDark ? 'bg-slate-900 border-slate-750' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block uppercase">Cardholder Name:</label>
                    <input 
                      type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)}
                      className={`w-full p-2 rounded border text-xs font-mono ${isDark ? 'bg-slate-900 border-slate-750' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>

                <button 
                  id="confirm-pay-stripe-btn"
                  onClick={submitPaymentSim}
                  disabled={payingSuccess}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded transition flex items-center justify-center gap-1.5"
                >
                  {payingSuccess ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Authorising Stripe Direct...</span>
                    </>
                  ) : (
                    <span>Pay Outstanding Ledger balance</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
