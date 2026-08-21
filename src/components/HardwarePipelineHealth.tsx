'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Cpu,
  Zap,
  Wifi,
  Database,
  Monitor,
  Radio,
  Info,
} from 'lucide-react';
import { PipelineStage } from '@/types/energy';

export const HardwarePipelineHealth: React.FC = () => {
  const { pipelineStages, connectionState } = useEnergyData();
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const getStageIcon = (id: string) => {
    switch (id) {
      case 'sensor':
        return Zap;
      case 'arduino':
        return Cpu;
      case 'esp8266':
        return Radio;
      case 'wifi':
        return Wifi;
      case 'supabase':
        return Database;
      case 'dashboard':
        return Monitor;
      default:
        return Cpu;
    }
  };

  return (
    <div className="glass-panel relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
            <span>IOT HARDWARE & DATA PIPELINE HEALTH</span>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
              6 STAGES VERIFIED
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            End-to-End Hardware Communication Chain: Sensor to Dashboard
          </p>
        </div>
      </div>

      {/* Connection Chain Visualization Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pipelineStages.map((stage, idx) => {
          const Icon = getStageIcon(stage.id);
          const isError = stage.status === 'ERROR' || (connectionState === 'OFFLINE' && (stage.id === 'sensor' || stage.id === 'arduino' || stage.id === 'esp8266'));
          const isWarning = stage.status === 'WARNING';
          const isOk = !isError && !isWarning;

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`group relative flex flex-col justify-between rounded-xl p-3.5 border cursor-pointer transition-all duration-200 ${
                isOk
                  ? 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-red-950/30 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}
            >
              {/* Stage Header Number */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-slate-500">STAGE 0{idx + 1}</span>
                {isOk && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {isWarning && <AlertCircle className="h-4 w-4 text-amber-400" />}
                {isError && <XCircle className="h-4 w-4 text-red-400 animate-bounce" />}
              </div>

              {/* Component Icon & Name */}
              <div className="space-y-1 my-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border p-1.5 ${
                    isOk
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                  {stage.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400">{stage.tech}</p>
              </div>

              {/* Status Badge & Latency */}
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className={isOk ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {isOk ? 'ONLINE' : 'FAILED'}
                </span>
                <span className="text-slate-500">{stage.latencyMs ? `${stage.latencyMs}ms` : '--'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer / Info Popover */}
      {selectedStage && (
        <div className="mt-4 rounded-xl bg-slate-950/90 p-4 border border-cyan-500/40 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">{selectedStage.name} Details</span>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div>TECHNOLOGY: <span className="text-cyan-300">{selectedStage.tech}</span></div>
            <div>STATUS: <span className="text-emerald-400 font-bold">{selectedStage.status}</span></div>
            <div>LAST VERIFIED: <span className="text-slate-400">{selectedStage.lastVerified}</span></div>
            <div>DIAGNOSTICS: <span className="text-slate-200">{selectedStage.details}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
