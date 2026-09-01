'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  Sparkles,
  Zap,
  Activity,
  BatteryCharging,
  Power,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const EnergyHarvestingFlow: React.FC = () => {
  const { latestReading, loadEnabled, connectionState } = useEnergyData();
  const [activeStageInfo, setActiveStageInfo] = useState<string | null>(null);

  const isOnline = connectionState === 'ONLINE';
  const voltage = latestReading ? latestReading.voltage : 0.785;
  const current = latestReading ? latestReading.current : 18.45;
  const power = latestReading ? latestReading.power : 14.48;

  const stages = [
    {
      id: 'mfc',
      title: 'Energy Source',
      subtitle: 'Microbial Fuel Cell',
      detail: `Bioelectrochemical redox harvesting ~${voltage.toFixed(3)}V open-circuit potential from soil/sediment bacteria.`,
      metric: `${voltage.toFixed(3)} V`,
      metricLabel: 'Cell Potential',
      icon: Sparkles,
      color: 'emerald',
      isActive: isOnline,
    },
    {
      id: 'sensor',
      title: 'INA219 Sensor',
      subtitle: 'Telemetry Monitor',
      detail: `High-side I2C telemetry sensor sampling shunt current (${current.toFixed(3)} mA) & power (${power.toFixed(2)} mW).`,
      metric: `${current.toFixed(3)} mA`,
      metricLabel: 'Harvest Flow',
      icon: Activity,
      color: 'cyan',
      isActive: isOnline,
    },
    {
      id: 'pmic',
      title: 'TI BQ25570',
      subtitle: 'MPPT & Boost PMIC',
      detail: 'Ultra-low-power boost charger tracking 80% VOC maximum power point & stepping up raw mV to storage rail.',
      metric: '80% MPPT',
      metricLabel: 'Boost Active',
      icon: Zap,
      color: 'emerald',
      isActive: isOnline,
    },
    {
      id: 'storage',
      title: 'Energy Storage',
      subtitle: 'Supercapacitor Bank',
      detail: 'High-density 5.5V supercapacitor buffer storing harvested Joules to power telemetry bursts and load spikes.',
      metric: '~3.30 V',
      metricLabel: 'Buffer Rail',
      icon: BatteryCharging,
      color: 'indigo',
      isActive: isOnline,
    },
    {
      id: 'load',
      title: 'System Load',
      subtitle: loadEnabled ? 'Active Output' : 'Isolated Rail',
      detail: loadEnabled
        ? 'Physical BQ25570 buck regulator output enabled, powering external connected sensors and IoT peripherals.'
        : 'Load gate is currently OPEN CIRCUIT / STANDBY. Harvested energy is accumulating in storage buffer.',
      metric: loadEnabled ? 'POWER ON' : 'STANDBY (OFF)',
      metricLabel: 'Load State',
      icon: Power,
      color: loadEnabled ? 'emerald' : 'slate',
      isActive: isOnline && loadEnabled,
    },
  ];

  return (
    <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
              <span>ENERGY HARVESTING PATHWAY & FLOW TOPOLOGY</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live power transfer from bio-chemical reaction to physical load
            </p>
          </div>
        </div>

        {/* Dynamic State Indicator */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-500">FLOW DYNAMICS:</span>
          <span
            className={`font-bold px-2.5 py-0.5 rounded-full border ${
              !isOnline
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : loadEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-glow-emerald'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {!isOnline
              ? 'SYSTEM OFFLINE'
              : loadEnabled
              ? 'ACTIVE HARVEST & DISCHARGE'
              : 'STORAGE BUFFER CHARGING (LOAD OFF)'}
          </span>
        </div>
      </div>

      {/* Interactive Pathway Node Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStageInfo === stage.id;
          const isLoadStage = stage.id === 'load';

          return (
            <div key={stage.id} className="relative flex flex-col">
              {/* Card Node */}
              <div
                onClick={() => setActiveStageInfo(isSelected ? null : stage.id)}
                className={`group relative flex flex-col justify-between rounded-2xl p-4 border transition-all duration-300 cursor-pointer h-full ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : stage.isActive
                    ? 'border-slate-800 bg-slate-950/80 hover:border-emerald-500/40 hover:bg-slate-900/90'
                    : isLoadStage
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-75'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                {/* Node Step Number & Icon */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold text-slate-500">0{idx + 1}</span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border p-1.5 transition-colors ${
                      stage.isActive
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : isLoadStage
                        ? 'border-slate-800 bg-slate-900 text-slate-500'
                        : 'border-slate-800 bg-slate-900 text-slate-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Node Titles */}
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">{stage.subtitle}</p>
                </div>

                {/* Node Metric Output */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 text-[10px] uppercase">{stage.metricLabel}:</span>
                  <span
                    className={`font-bold ${
                      stage.isActive ? 'text-emerald-400' : isLoadStage ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {stage.metric}
                  </span>
                </div>
              </div>

              {/* Arrow Connector between nodes on desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border bg-slate-950 shadow-md ${
                      idx === 3 && !loadEnabled
                        ? 'border-slate-800 text-slate-600'
                        : 'border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SVG Animated Energy Transfer Vector Bar */}
      <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">LIVE ENERGY BUS TRANSFER VECTOR</span>
          </span>
          <span className="text-slate-500">
            {loadEnabled ? 'FULL CONVERSION & LOAD RAIL ACTIVE' : 'UPSTREAM CHARGING • DOWNSTREAM GATED'}
          </span>
        </div>

        {/* Dynamic SVG Energy Line */}
        <div className="w-full h-8 relative flex items-center">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none">
            {/* Background track line */}
            <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="3" />

            {/* Upstream Active Energy Path (MFC -> INA219 -> BQ25570 -> Storage) */}
            <line
              x1="0%"
              y1="50%"
              x2="78%"
              y2="50%"
              stroke="#10b981"
              strokeWidth="3"
              className={isOnline ? 'animate-energy-flow' : ''}
            />

            {/* Downstream Path to Load (Storage -> Load) */}
            {loadEnabled ? (
              <line
                x1="78%"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#06b6d4"
                strokeWidth="3"
                className={isOnline ? 'animate-energy-flow' : ''}
              />
            ) : (
              <line
                x1="78%"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
          </svg>
        </div>

        {/* Labels under SVG line */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>MFC BIO-REACTION</span>
          <span>INA219 MEASUREMENT</span>
          <span>BQ25570 MPPT BOOST</span>
          <span>SUPERCAP BUFFER</span>
          <span className={loadEnabled ? 'text-cyan-400 font-bold' : 'text-slate-600 font-bold'}>
            {loadEnabled ? 'OUTPUT LOAD [ON]' : 'OUTPUT LOAD [OFF / GATED]'}
          </span>
        </div>
      </div>

      {/* Selected Stage Detail Box */}
      {activeStageInfo && (
        <div className="rounded-2xl bg-slate-950/95 p-4 border border-cyan-500/40 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase">
              <Info className="h-4 w-4" />
              <span>{stages.find((s) => s.id === activeStageInfo)?.title} Technical Details</span>
            </div>
            <button
              onClick={() => setActiveStageInfo(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">{stages.find((s) => s.id === activeStageInfo)?.detail}</p>
        </div>
      )}
    </div>
  );
};
