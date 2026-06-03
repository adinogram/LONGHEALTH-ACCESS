/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SaasTopologyMap } from './components/SaaSTopologyMap';
import { SaaS_SimulationEngine } from './components/SaaS_SimulationEngine';
import { ArchitectureTabs } from './components/ArchitectureTabs';
import { ArchitectChat } from './components/ArchitectChat';
import { ClinicalCapabilitiesConsole } from './components/ClinicalCapabilitiesConsole';
import { EnterpriseTestingConsole } from './components/EnterpriseTestingConsole';
import { MetaMaskWalletChecker } from './components/MetaMaskWalletChecker';
import { ArchitectureNode } from './types';
import { ARCHITECTURE_NODES } from './data/architectureDetails';
import { 
  Activity, Shield, Database, LayoutDashboard, 
  Workflow, ArrowUpRight, CheckCircle, Clock, CalendarRange, ShieldAlert
} from 'lucide-react';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[2]); // Default: Next.js Node
  const [workspaceMode, setWorkspaceMode] = useState<'capabilities' | 'architect' | 'testing'>('capabilities');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Sleek Architect Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
              LONGHEALTH SaaS Platform Design Spec
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Principal Software Architect Blueprint Dashboard</p>
          </div>
        </div>

        {/* Live System Observability and Wallet Info Ticker */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-[11px] font-mono bg-slate-950/80 border border-slate-800/80 px-4 py-2 rounded-lg text-slate-500">
            <div className="flex items-center gap-1.5 border-r border-slate-800/80 pr-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 font-bold">MONOREPO WORKSPACE</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-slate-800/80 pr-4">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-400">AWS US-EAST-1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-semibold">100,000+ USERS SCALED</span>
            </div>
          </div>
          
          <MetaMaskWalletChecker />
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-grow p-6 space-y-8 max-w-[1600px] mx-auto w-full">
        
        {/* Dynamic Concept Explanation Intro Card */}
        <div className="bg-gradient-to-r from-indigo-950/20 via-indigo-950/10 to-slate-900/10 border border-indigo-500/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-4xl space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-3 py-1 rounded-full">
              Production-Grade Blueprint Console
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight pt-2">
              SaaS Architectural Playground & Topology Interactive Trace
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              This interactive platform serves as the technical map for our core hospital platform architecture. Click through the **Infrastructure Network Map** to inspect isolation barriers, test raw background jobs in the **Live Event simulator**, explore our **Ten Architectural Deliverables** detailing HIPAA compliant logging schemas, and request custom NestJS controllers or run AI clinical diagnostic nodes directly in the **AI Architect Console**.
            </p>
          </div>
        </div>

        {/* Workspace Mode Switcher Tabs */}
        <div className="flex border-b border-slate-800/80 pb-1 gap-6 overflow-x-auto scrollbar-none justify-start">
          <button
            id="tab-mode-capabilities"
            onClick={() => setWorkspaceMode('capabilities')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              workspaceMode === 'capabilities'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Interactive Hospital Capabilities View</span>
          </button>
          <button
            id="tab-mode-testing"
            onClick={() => setWorkspaceMode('testing')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              workspaceMode === 'testing'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Enterprise Testing Strategy & Quality Core</span>
          </button>
          <button
            id="tab-mode-architect"
            onClick={() => setWorkspaceMode('architect')}
            className={`pb-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              workspaceMode === 'architect'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Monorepo Infrastructure Spec & Engineering Graph</span>
          </button>
        </div>

        {/* Triple Row Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visualizer & Specifications Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {workspaceMode === 'capabilities' ? (
              <ClinicalCapabilitiesConsole />
            ) : workspaceMode === 'testing' ? (
              <EnterpriseTestingConsole />
            ) : (
              <>
                {/* Component 1: Interactive Systems Graph Mapping */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">MODULE 01</span>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Infrastructure Graph & File Bindings</h3>
                  </div>
                  <SaasTopologyMap onSelectNode={setSelectedNode} selectedNodeId={selectedNode.id} />
                </section>

                {/* Component 2: Event Queue simulation */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">MODULE 02</span>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Operation Queue Simulator</h3>
                  </div>
                  <SaaS_SimulationEngine />
                </section>

                {/* Component 3: 10 Chapters Deliverables */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">MODULE 03</span>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">10 Chapters Architectural Deliverables</h3>
                  </div>
                  <ArchitectureTabs />
                </section>
              </>
            )}

          </div>

          {/* Right Sidebar: AI Expert Q&A Console */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">MODULE 04</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Dynamic Assistant</h3>
            </div>
            <ArchitectChat />
          </div>

        </div>

      </main>

      {/* Aesthetic Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-6 text-center text-xs text-slate-600 font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4">
        <span>© 2026 LONGHEALTH Platform Blueprint Hub. All Rights Spec Asserted.</span>
        <div className="flex gap-4 justify-center">
          <span className="hover:text-slate-400 transition">HIPAA Valid</span>
          <span>•</span>
          <span className="hover:text-slate-400 transition">SOC2 Sealed</span>
          <span>•</span>
          <span className="hover:text-slate-400 transition">FHIR Compliant</span>
        </div>
      </footer>

    </div>
  );
}
