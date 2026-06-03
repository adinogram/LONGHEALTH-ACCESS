/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulationLog } from '../types';
import { 
  Play, RotateCcw, AlertCircle, Database, Layers, 
  Send, Clock, HelpCircle, Server, CheckCircle, Wifi, HardDrive 
} from 'lucide-react';

export const SaaS_SimulationEngine: React.FC = () => {
  const [logs, setLogs] = useState<SimulationLog[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      source: 'APM GATEWAY',
      message: 'Monitoring service online. Distributed tracing active across all tenant clusters.',
      type: 'info'
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [simulationType, setSimulationType] = useState<string>('');

  const clearLogs = () => {
    setLogs([
      {
        id: 'clear',
        timestamp: new Date().toLocaleTimeString(),
        source: 'APM GATEWAY',
        message: 'Simulation records flushed. Diagnostics monitoring listening for operational events.',
        type: 'info'
      }
    ]);
    setCurrentStep(-1);
    setSimulationType('');
  };

  const addLog = (source: string, message: string, type: SimulationLog['type']) => {
    const newLog: SimulationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const runSimulation = async (type: 'appointment' | 'lab_report' | 'prescription') => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationType(type);
    setCurrentStep(1);

    if (type === 'appointment') {
      // Step 1: Gateway Ingress
      addLog('BFF GATEWAY', 'POST /api/appointments called by Patient Portal user "patient_773"', 'info');
      await sleep(1000);
      setCurrentStep(2);

      // Step 2: Postgres Write
      addLog('POSTGRESQL', 'ACID SQL Transaction opened. Writing appointment entity to "tenant_greenwood.appointments". Tenant Isolation Context validated.', 'postgres');
      await sleep(1200);
      setCurrentStep(3);

      // Step 3: Redis / BullMQ enqueue
      addLog('BULLMQ PRODUCER', 'Enqueuing back-end job "sms-notification-job" to active Queue queue:appointments-dispatch with payload: { tenantId: "greenwood", appointmentId: "app_9918" }', 'bullmq');
      await sleep(1000);
      setCurrentStep(4);

      // Step 4: Worker Complete
      addLog('BULLMQ WORKER', 'Worker Thread "worker-pool-z8" picked up sms-notification-job. Dispatching SMS text notification payload to Twilio gateway client.', 'success');
      await sleep(1100);
      setCurrentStep(5);

      // Step 5: WebSockets Broadcast
      addLog('WEBSOCKETS OUT', 'Dispatched real-time Socket.io packet to room: [tenant_room_greenwood] with pattern: APPOINTMENT_CREATED. Receptionist Portal synced.', 'websocket');
      addLog('SYSTEM ANALYTICS', 'Total pipeline execution time: 4.3 seconds. Execution Success.', 'success');

    } else if (type === 'lab_report') {
      // Step 1: File Storage Upload Init
      addLog('BFF GATEWAY', 'POST /api/laboratories/upload stream payload initialization by Doctor "doc_smith"', 'info');
      await sleep(1000);
      setCurrentStep(2);

      // Step 2: S3 private path commit
      addLog('AWS S3 BUCKET', 'Streaming encrypted raw DICOM / PDF bytes direct to "s3://hospitalsaas-vault/tenants/greenwood/labs/lab_948.pdf"', 's3');
      await sleep(1300);
      setCurrentStep(3);

      // Step 3: Postgres Audit Commit
      addLog('POSTGRESQL', 'INSERT into "tenant_greenwood.lab_reports" (status: PENDING, path: "s3://...") committed by transaction manager.', 'postgres');
      await sleep(1000);
      setCurrentStep(4);

      // Step 4: BullMQ Job
      addLog('BULLMQ WORKER', 'Worker "worker-pool-x2" executing background "parse-dicom-meta" job. Correctly isolated key structures and patient demographics headers.', 'bullmq');
      await sleep(1200);
      setCurrentStep(5);

      // Step 5: Realtime Sync broadcast
      addLog('WEBSOCKETS OUT', 'Broadcasted "LAB_REPORT_COMPLETED" notification packet to [tenant_room_greenwood]. Doctor viewing Patient Dashboard triggered alert UI state.', 'websocket');
      addLog('SYSTEM ANALYTICS', 'Success. Medical File Object committed and metadata scanned.', 'success');

    } else if (type === 'prescription') {
      addLog('BFF GATEWAY', 'POST /api/prescriptions submitted by Doctor "doc_smith" with active electronic signature.', 'info');
      await sleep(1000);
      setCurrentStep(2);

      // Step 2: Dynamic DB routing context
      addLog('POSTGRESQL', 'Context active. Resolving PostgreSQL schema router: "tenant_greenwood". Active transaction committing medical prescription and prescriptions history rows.', 'postgres');
      await sleep(1200);
      setCurrentStep(3);

      // Step 3: Audit Immutable Write
      addLog('POSTGRESQL', 'HIPAA AUDITING SYSTEM: Triggered strict log event INSERT "USER_doc_smith_WRITE_PRESCRIPTION_194". Log table row locked.', 'security');
      await sleep(1000);
      setCurrentStep(4);

      // Step 4: Redis Pub Sub Sync
      addLog('REDIS PUB/SUB', 'Broadcast peer event "PHARMACY_PRESCRIPTION_CLAIM" to cluster node socket queues.', 'redis');
      await sleep(1100);
      setCurrentStep(5);

      // Step 5: WebSocket Dispatch to pharmacist
      addLog('WEBSOCKETS OUT', 'WebSocket broadcast: alert room "tenant_room_greenwood_pharmacists" with payload details. Pharmacy portal loaded alert.', 'websocket');
      addLog('SYSTEM ANALYTICS', 'SaaS event complete. Integrity logs valid.', 'success');
    }

    setIsSimulating(false);
    setCurrentStep(-1);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getLogTypeStyling = (type: SimulationLog['type']) => {
    switch (type) {
      case 'info': return 'text-slate-400';
      case 'success': return 'text-emerald-400 font-bold';
      case 'warning': return 'text-amber-400 font-bold';
      case 'error': return 'text-rose-400 font-bold';
      case 'redis': return 'text-violet-400 font-mono';
      case 'bullmq': return 'text-blue-400 font-mono';
      case 'postgres': return 'text-emerald-500 font-mono';
      case 's3': return 'text-yellow-500 font-mono';
      case 'websocket': return 'text-indigo-400 font-mono';
      case 'security': return 'text-rose-400 font-semibold border-l-2 border-rose-500 pl-2';
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm shadow-xl" id="simulation-engine-component">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/60 mb-6 gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              <Layers className="w-4 h-4 text-indigo-400" />
            </span>
            Active SaaS Operation & Event Queue Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch dynamic operations, trigger direct API gateways, and investigate the micro-event flow through standard queues.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button 
            disabled={isSimulating}
            onClick={clearLogs}
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900 text-slate-400 font-medium text-xs transition duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Flush logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Step-by-Step Flow Simulation UI */}
        <div className="xl:col-span-4 bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Select Simulated Operations
            </h3>
            
            <div className="space-y-2.5">
              <button 
                disabled={isSimulating}
                onClick={() => runSimulation('appointment')}
                className={`w-full text-left p-3.5 rounded-lg border text-xs transition duration-200 cursor-pointer ${
                  simulationType === 'appointment' && isSimulating 
                    ? 'border-indigo-500/40 bg-indigo-950/10 text-indigo-200' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Patient Appointment Booking
                  </span>
                  <Play className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Triggers write, places sms-notification-job in BullMQ, and alerts the clinic desk.
                </p>
              </button>

              <button 
                disabled={isSimulating}
                onClick={() => runSimulation('lab_report')}
                className={`w-full text-left p-3.5 rounded-lg border text-xs transition duration-200 cursor-pointer ${
                  simulationType === 'lab_report' && isSimulating 
                    ? 'border-indigo-500/40 bg-indigo-950/10 text-indigo-200' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    Laboratory Diagnostic Report
                  </span>
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Steers storage writes to AWS S3, triggers database schemas, scales metadata parses.
                </p>
              </button>

              <button 
                disabled={isSimulating}
                onClick={() => runSimulation('prescription')}
                className={`w-full text-left p-3.5 rounded-lg border text-xs transition duration-200 cursor-pointer ${
                  simulationType === 'prescription' && isSimulating 
                    ? 'border-indigo-500/40 bg-indigo-950/10 text-indigo-200' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Pharmacist Prescription E-Sign
                  </span>
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Initiates transactions, secures immutable audit hashes, and broadcasts WebSocket alerts.
                </p>
              </button>
            </div>
          </div>

          {/* Micro Flow Progress Indicators */}
          {isSimulating && (
            <div className="mt-6 border-t border-slate-800/60 pt-4">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-3">Live Flow Progress</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-yellow-500" /> Status:
                  </span>
                  <span className="text-yellow-400 font-bold uppercase animate-pulse">
                    Executing Step {currentStep}/5
                  </span>
                </div>
                
                {/* Visual Pipeline Grid */}
                <div className="grid grid-cols-5 gap-1 pt-1">
                  <div className={`h-1.5 rounded-sm ${currentStep >= 1 ? 'bg-blue-500' : 'bg-slate-800'}`} title="BFF Entry Gateway" />
                  <div className={`h-1.5 rounded-sm ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} title="Database Commit" />
                  <div className={`h-1.5 rounded-sm ${currentStep >= 3 ? 'bg-yellow-500' : 'bg-slate-800'}`} title="Storage upload / Queue append" />
                  <div className={`h-1.5 rounded-sm ${currentStep >= 4 ? 'bg-indigo-500' : 'bg-slate-800'}`} title="Background Processing" />
                  <div className={`h-1.5 rounded-sm ${currentStep >= 5 ? 'bg-violet-500' : 'bg-slate-800'}`} title="Client Realtime push" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console / Diagnostics Streams Output */}
        <div className="xl:col-span-8 flex flex-col justify-between">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-grow flex flex-col min-h-[340px] max-h-[420px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </span>
                <span className="text-[11px] font-mono text-slate-500">healthgate-monitoring-APM ~ dynamic-traces</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {logs.length} trace items
              </div>
            </div>

            {/* Simulated Live Terminal Stream */}
            <div className="flex-grow overflow-y-auto space-y-2.5 font-mono text-[11px] leading-relaxed pr-2 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-slate-900/60 pb-2">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] mb-0.5">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="p-0.5 rounded bg-slate-920 border border-slate-800">
                        {log.source}
                      </span>
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className={getLogTypeStyling(log.type)}>
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
