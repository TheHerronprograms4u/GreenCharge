'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { Zap, Activity, Gauge, Sparkles, ArrowUpRight, ArrowDownRight, Minus, ShieldCheck, Clock } from 'lucide-react';

export const HeroEnergyMonitor: React.FC = () => {
  const {
    latestReading,
    previousReading,
    connectionState,
    secondsSinceLastUpdate,
    loadEnabled,
    isLoadUpdating,
  } = useEnergyData();

  const isOnline = connectionState === 'ONLINE';
  const hasReading = Boolean(latestReading);

  // Values
  const powerVal = latestReading ? latestReading.power : 0;
  const voltageVal = latestReading ? latestReading.voltage : 0;
  const currentVal = latestReading ? latestReading.current : 0;

  // Power delta
  let powerDelta: number | null = null;
  let powerPctChange: number | null = null;
  if (latestReading && previousReading && previousReading.power > 0) {
    powerDelta = Number((latestReading.power - previousReading.power).toFixed(2));
    powerPctChange = Number(((powerDelta / previousReading.power) * 100).toFixed(1));
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-[#070d18]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)]">
      {/* Background radial glow & aura */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Top Meta Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
              LIVE ENERGY HARVESTING ENGINE
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-mono text-slate-400">
              Microbial Fuel Cell (MFC) + TI BQ25570 MPPT
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          {isOnline && hasReading ? (
            <div className="flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold">MPPT HARVESTING ACTIVE</span>
            </div>
          ) : !isOnline ? (
            <div className="flex items-center space-x-1.5 rounded-full bg-red-500/10 px-3 py-1 text-red-400 border border-red-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
              <span className="font-bold">DEVICE OFFLINE</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-400 border border-amber-500/30">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              <span className="font-bold">WAITING FOR TELEMETRY</span>
            </div>
          )}

          {/* Load indicator badge */}
          <div
            className={`rounded-full px-2.5 py-1 font-bold border transition-colors ${
              loadEnabled
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            LOAD: {isLoadUpdating ? 'SYNCING...' : loadEnabled ? 'ACTIVE (ON)' : 'STANDBY (OFF)'}
          </div>
        </div>
      </div>

      {/* Hero Centerpiece: Power Output */}
      <div className="relative z-10 my-6 sm:my-8 text-center flex flex-col items-center justify-center">
        <div className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-2 flex items-center space-x-2">
          <span>CURRENT HARVESTED POWER OUTPUT</span>
          {powerDelta !== null && powerDelta !== 0 && (
            <span
              className={`inline-flex items-center space-x-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                powerDelta > 0
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}
            >
              {powerDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{powerDelta > 0 ? `+${powerDelta}` : powerDelta} mW</span>
              {powerPctChange !== null && <span>({powerPctChange > 0 ? `+${powerPctChange}%` : `${powerPctChange}%`})</span>}
            </span>
          )}
        </div>

        {/* Primary Huge Power Value */}
        <div className="flex items-baseline justify-center space-x-3">
          {hasReading ? (
            <span className="font-mono text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-emerald-300 text-glow-emerald">
              {powerVal.toFixed(2)}
            </span>
          ) : (
            <span className="font-mono text-5xl sm:text-6xl font-black text-slate-600">
              --.--
            </span>
          )}
          <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 tracking-wider">
            mW
          </span>
        </div>

        <p className="mt-2 text-xs sm:text-sm font-mono text-slate-400 max-w-lg mx-auto">
          {hasReading
            ? 'Continuous bio-electrochemical power generated by microbial redox reaction & transferred via BQ25570 boost converter'
            : !isOnline
            ? 'Device is currently unreachable. Awaiting heartbeat telemetry.'
            : 'Synchronizing with telemetry table energy_readings...'}
        </p>
      </div>

      {/* Sub-readouts: Voltage & Current */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 border-t border-slate-800/80">
        
        {/* Voltage Sub-Card */}
        <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                MFC Cell Voltage
              </div>
              <div className="text-2xl font-black text-cyan-300">
                {hasReading ? `${voltageVal.toFixed(3)}` : '--.---'} <span className="text-sm text-cyan-500">V</span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <div>TARGET: <span className="text-slate-300 font-semibold">~0.780 V</span></div>
            <div className="text-cyan-400">80% MPPT POINT</div>
          </div>
        </div>

        {/* Current Sub-Card */}
        <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Harvesting Current
              </div>
              <div className="text-2xl font-black text-blue-300">
                {hasReading ? `${currentVal.toFixed(3)}` : '--.---'} <span className="text-sm text-blue-500">mA</span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <div>SHUNT: <span className="text-slate-300 font-semibold">0.100 Ω</span></div>
            <div className="text-blue-400">INA219 SENSE</div>
          </div>
        </div>

      </div>
    </div>
  );
};
