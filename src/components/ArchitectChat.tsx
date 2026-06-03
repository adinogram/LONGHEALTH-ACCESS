/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageSquare, Send, Bot, User, Trash2, ArrowRight, Activity, Zap } from 'lucide-react';

export const ArchitectChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Greetings. I am LONGHEALTH's Principal Software Architect. I designed the multi-tenant routing, NestJS module boundaries, PostgreSQL scheme isolations, Redis buffers, and BullMQ queues for our hospital platform.\n\nAsk me about database RLS, HIPAA event audits, real-time WebSocket signals, or request NestJS configuration boilerplates.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const PRESETS = [
    "Write the NestJS Custom AuthGuard for Hospital Roles & Tenant ID",
    "Explain the HIPAA-compliant Audit Logging pattern",
    "How does BullMQ handle worker execution failures and backoffs with Redis?",
    "Give me the PostgreSQL RLS Policy SQL statements"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "Platform design scope cleared. What system decisions or code blocks should we review next?",
        timestamp: new Date()
      }
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    if (!textToSend) {
      setInput('');
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error generating architect response');
      }

      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        text: data.response || "No response received.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);

    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        text: `⚠️ Architect API Offline: ${err.message || 'Please check that GEMINI_API_KEY is configured in Secrets panel.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Safe simple formatting to handle bold and code formats nicely in chat messages
  const renderMessageText = (text: string) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);
    return blocks.map((block, idx) => {
      // Is codeblock?
      if (block.startsWith('```')) {
        const lines = block.split('\n');
        const lang = lines[0].replace('```', '') || 'typescript';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={idx} className="my-3 font-mono text-[11px] rounded-lg border border-slate-800 overflow-hidden shadow-md">
            <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-1.5 flex items-center justify-between text-slate-500 uppercase text-[9px] font-bold tracking-widest">
              <span>{lang} Snippet</span>
            </div>
            <pre className="p-3.5 bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed max-h-[280px]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Safe bold and linebreaks replacements
      const formattedLines = block.split('\n').map((line, lIdx) => {
        // Simple bold parser
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const parsedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="text-slate-100 font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        return (
          <span key={lIdx} className="block mt-1 first:mt-0 min-h-[0.5rem] leading-relaxed">
            {parsedLine}
          </span>
        );
      });

      return <div key={idx}>{formattedLines}</div>;
    });
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm shadow-xl flex flex-col h-full min-h-[600px] max-h-[800px]" id="architect-chat-section">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            AI Principal Architect Console
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Real-time design advice, HL7/FHIR query mapping and configs.</p>
        </div>
        <button 
          onClick={handleClear}
          className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-800/60 rounded transition duration-200 cursor-pointer"
          title="Reset Architect Console"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Topics Column */}
      <div className="mb-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Choose Preset Diagnostic Request
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              disabled={isSending}
              onClick={() => handleSend(p)}
              className="text-left border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded-lg text-slate-300 hover:text-indigo-400 transition truncate cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="truncate">{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* History Area */}
      <div className="flex-grow overflow-y-auto bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4 mb-4 min-h-[220px]">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'model' && (
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl p-3.5 text-xs ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-slate-100' 
                : 'bg-slate-900/60 border border-slate-800 text-slate-300'
            }`}>
              {m.role === 'model' ? (
                <div>{renderMessageText(m.text)}</div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-spin">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[11px] font-mono text-slate-500 animate-pulse">
              Architect compiling technical specification response...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          placeholder="Ask about NestJS models, PostgreSQL pool, HIPAA schemas..."
          className="flex-grow bg-slate-950 border border-slate-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 outline-none transition duration-200 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 rounded-xl p-3 shrink-0 transition duration-200 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
