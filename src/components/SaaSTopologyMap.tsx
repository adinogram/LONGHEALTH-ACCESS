/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ARCHITECTURE_NODES } from '../data/architectureDetails';
import { ArchitectureNode, ComponentCategory } from '../types';
import { 
  Server, Shield, Database, Cpu, Layers, Wifi, 
  HardDrive, Play, Zap, HelpCircle, FileText, Settings, ArrowRight 
} from 'lucide-react';

interface SaasTopologyMapProps {
  onSelectNode: (node: ArchitectureNode) => void;
  selectedNodeId: string;
}

export const SaasTopologyMap: React.FC<SaasTopologyMapProps> = ({ onSelectNode, selectedNodeId }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const getCategoryColor = (category: ComponentCategory, active: boolean) => {
    switch (category) {
      case 'routing':
        return active ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-amber-950/20 text-amber-500/70 border-amber-950/40';
      case 'compute':
        return active ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-blue-950/20 text-blue-500/70 border-blue-950/40';
      case 'storage':
        return active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-emerald-950/20 text-emerald-500/70 border-emerald-950/40';
      case 'realtime':
        return active ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-indigo-950/20 text-indigo-500/70 border-indigo-950/40';
      case 'queue':
        return active ? 'bg-violet-500/20 text-violet-400 border-violet-500/40' : 'bg-violet-950/20 text-violet-500/70 border-violet-950/40';
      case 'security':
        return active ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-rose-950/20 text-rose-500/70 border-rose-950/40';
      case 'monitoring':
        return active ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-cyan-950/20 text-cyan-500/70 border-cyan-950/40';
      default:
        return 'text-slate-400 border-slate-800';
    }
  };

  const getIcon = (category: ComponentCategory, className?: string) => {
    switch (category) {
      case 'routing': return <Shield className={className} />;
      case 'compute': return <Cpu className={className} />;
      case 'storage': return <Database className={className} />;
      case 'realtime': return <Wifi className={className} />;
      case 'queue': return <Layers className={className} />;
      case 'security': return <Settings className={className} />;
      case 'monitoring': return <Server className={className} />;
    }
  };

  const selectedNode = ARCHITECTURE_NODES.find(n => n.id === selectedNodeId);
  const connectionsToDraw = selectedNode 
    ? ARCHITECTURE_NODES.filter(n => selectedNode.connections.includes(n.id) || n.connections.includes(selectedNode.id))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="architecture-map-section">
      {/* Dynamic Network Topology Graph */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 relative overflow-hidden backdrop-blur-sm shadow-xl flex flex-col justify-between min-h-[500px]">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        
        {/* Topology Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              SaaS Infrastructure Network Map
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any node to visual connections and review code configs.</p>
          </div>
          <div className="flex gap-1.5 flex-wrap max-w-xs justify-end">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Routing</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Compute</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Storage</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Realtime</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">Queues</span>
          </div>
        </div>

        {/* The Node Blocks Layout */}
        <div className="relative z-10 grid grid-cols-2 gap-4 flex-grow my-4 content-center">
          {/* Column 1: Client Edge Router IP Flow */}
          <div className="space-y-4 flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase border-b border-slate-800/20 pb-1 mb-1">
              01 / Client Edge & Gateways
            </div>
            {ARCHITECTURE_NODES.filter(n => ['cloudflare', 'alb', 'nextjs'].includes(n.id)).map(node => {
              const isActive = selectedNodeId === node.id || hoveredNodeId === node.id;
              const isConnected = selectedNode?.connections.includes(node.id) || node.connections.includes(selectedNodeId);
              const highlightState = isActive ? 'border-indigo-500/60 shadow-indigo-950/25 bg-slate-900/90' : isConnected ? 'border-slate-700/80 bg-slate-900/60' : 'border-slate-800 bg-slate-950/40';
              return (
                <div 
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`border p-3.5 rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 group shadow-lg ${highlightState}`}
                  id={`node-${node.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md border ${getCategoryColor(node.category, isActive || isConnected)}`}>
                      {getIcon(node.category, "w-4 h-4")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {node.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{node.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Compute logic & database / pipeline states */}
          <div className="space-y-4 flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase border-b border-slate-800/20 pb-1 mb-1">
              02 / Backend Engines & Vaults
            </div>
            {ARCHITECTURE_NODES.filter(n => ['nestjs-gateway', 'websockets-server', 'postgres', 'redis', 'bullmq-producer', 'bullmq-worker', 's3'].includes(n.id)).map(node => {
              const isActive = selectedNodeId === node.id || hoveredNodeId === node.id;
              const isConnected = selectedNode?.connections.includes(node.id) || node.connections.includes(selectedNodeId);
              const highlightState = isActive ? 'border-indigo-500/60 shadow-indigo-950/25 bg-slate-900/90' : isConnected ? 'border-slate-700/80 bg-slate-900/60' : 'border-slate-800 bg-slate-950/40';
              return (
                <div 
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`border p-3.5 rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 group shadow-lg ${highlightState}`}
                  id={`node-${node.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md border ${getCategoryColor(node.category, isActive || isConnected)}`}>
                      {getIcon(node.category, "w-4 h-4")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {node.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{node.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Topology Connections Status */}
        <div className="relative z-10 bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">Active Tracer</span>
            <div className="text-slate-400 flex items-center gap-1.5 flex-wrap">
              {selectedNode ? (
                <>
                  <span className="font-semibold text-indigo-400 font-mono text-[11px]">{selectedNode.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 inline" />
                  <span className="text-[11px] text-slate-300 font-mono">
                    [{selectedNode.connections.map(c => {
                      const match = ARCHITECTURE_NODES.find(node => node.id === c);
                      return match ? match.label : c;
                    }).join(', ')}]
                  </span>
                </>
              ) : (
                <span className="text-slate-500 text-[11px] font-mono">Idle context. Press any node above to trigger trace path.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Detail Specifications Block */}
      <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between min-h-[500px]">
        {selectedNode ? (
          <div className="flex flex-col h-full justify-between" id="node-detailed-spec">
            <div>
              {/* Node Title & Description */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                    {selectedNode.category.toUpperCase()} COMPONENT
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-2 flex items-center gap-2">
                    {getIcon(selectedNode.category, "w-5 h-5 text-indigo-400")}
                    {selectedNode.label}
                  </h3>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {selectedNode.details}
              </p>

              {/* Node Metadata Interfaces */}
              {selectedNode.interfaces && (
                <div className="mb-4">
                  <h5 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Interfaces & Protocols</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.interfaces.map(i => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-slate-300">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Snippet */}
              {selectedNode.codeSnippet && (
                <div className="mt-4">
                  <div className="flex items-center justify-between bg-slate-900 border-t border-x border-slate-800 px-3 py-1.5 rounded-t-md">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedNode.label} Spec Configuration</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded">{selectedNode.codeLanguage}</span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 p-3.5 rounded-b-md text-slate-200 font-mono text-[10.5px] leading-relaxed overflow-x-auto max-h-[220px]">
                    <code>{selectedNode.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-4 text-xs text-slate-500 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              Fully scaled and ready. Simulated via cloud container topology rules.
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-center p-8">
            <HelpCircle className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
            <h4 className="text-slate-300 font-semibold mb-1 text-sm">No node selected</h4>
            <p className="text-slate-500 text-xs max-w-xs">
              Select one of the system nodes on the left dynamic map to inspect architectural layouts, database boundaries, and security credentials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
