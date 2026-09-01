'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Cpu,
  Zap,
  Wifi,
  Database,
  Monitor,
  Radio,
  Info,
  Sparkles,
  BatteryCharging,
  Power,
} from 'lucide-react';
import { PipelineStage } from '@/types/energy';

export const HardwarePipelineHealth: React.FC = () => {
  const { pipelineStages, connectionState } = useEnergyData();
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const getStageIcon = (id: string) => {
    switch (id) {
      case 'mfc_source':
        return Sparkles;
      case 'ina219_sensor':
        return Zap;
      case 'bq25570_pmic':
        return Zap;
      case 'esp32s3_mcu':
        return Cpu;
      case 'storage_buffer':
        return BatteryCharging;
      case 'load_output':
        return Power;
      case 'supabase_cloud':
        return Database;
      case 'dashboard':
        return Monitor;
      default:
        return Cpu;
    }
  };

  return (
    <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-7 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
            <span>END-TO-END HARDWARE & TELEMETRY PIPELINE HEALTH</span>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
              8 NODES ACTIVE
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Bio-Electrochemical Harvester ➔ Sensor ➔ PMIC ➔ ESP32-S3 ➔ Cloud ➔ Command Center
          </p>
        </div>
      </div>

      {/* Connection Chain Visualization Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
        {pipelineStages.map((stage, idx) => {
          const Icon = getStageIcon(stage.id);
          const isError =
            stage.status === 'ERROR' ||
            (connectionState === 'OFFLINE' &&
              (stage.id === 'mfc_source' ||
                stage.id === 'ina219_sensor' ||
                stage.id === 'esp32s3_mcu'));
          const isWarning = stage.status === 'WARNING';
          const isOk = !isError && !isWarning;

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`group relative flex flex-col justify-between rounded-2xl p-3 border cursor-pointer transition-all duration-200 ${
                isOk
                  ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              }`}
            >
              {/* Stage Header Number */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500">STAGE 0{idx + 1}</span>
                {isOk && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                {isWarning && <AlertCircle className="h-3.5 w-3.5 text-amber-400" />}
                {isError && <XCircle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />}
              </div>

              {/* Component Icon & Name */}
              <div className="space-y-1 my-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border p-1 ${
                    isOk
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                  {stage.name}
                </h4>
                <p className="text-[9px] text-slate-400 truncate">{stage.tech}</p>
              </div>

              {/* Status Badge & Latency */}
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px]">
                <span className={isOk ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {isOk ? 'ONLINE' : 'FAILED'}
                </span>
                <span className="text-slate-500">{stage.latencyMs ? `${stage.latencyMs}ms` : '--'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer */}
      {selectedStage && (
        <div className="mt-4 rounded-2xl bg-slate-950/95 p-4 border border-cyan-500/40 text-xs font-mono">
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
