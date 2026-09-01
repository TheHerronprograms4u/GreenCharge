'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { Power, Radio, ShieldCheck, RefreshCw, AlertCircle, Cpu, Zap, CheckCircle2, Lock } from 'lucide-react';

export const RemoteLoadControl: React.FC = () => {
  const {
    deviceId,
    loadEnabled,
    isLoadUpdating,
    loadStatusMessage,
    lastControlSync,
    toggleLoadControl,
    supabaseStatus,
  } = useEnergyData();

  const handleToggle = () => {
    if (isLoadUpdating) return;
    toggleLoadControl(!loadEnabled);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      {/* Background ambient light */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl transition-all duration-700 ${
          loadEnabled ? 'bg-emerald-500/20' : 'bg-slate-700/10'
        }`}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Info Area */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                loadEnabled
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                  : 'border-slate-700 bg-slate-800/80 text-slate-400'
              }`}
            >
              <Power className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                REMOTE LOAD CONTROL
              </span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                TI BQ25570 BUCK GATE
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
            <span>SYSTEM LOAD:</span>
            <span
              className={`font-mono text-2xl sm:text-3xl font-black transition-colors ${
                loadEnabled
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 text-glow-emerald'
                  : 'text-slate-500'
              }`}
            >
              {loadEnabled ? 'ON' : 'OFF'}
            </span>
          </h2>

          <p className="text-xs sm:text-sm font-mono text-slate-400 leading-relaxed">
            Directly switch the physical power rail of the BQ25570 nanopower buck converter on <strong className="text-slate-200">{deviceId}</strong>.
            Updates write directly to the Supabase <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">device_control</code> table.
          </p>

          {/* Status feedback line */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">STATUS:</span>
              <span
                className={`font-bold transition-all ${
                  isLoadUpdating
                    ? 'text-cyan-400 animate-pulse'
                    : loadStatusMessage.includes('unavailable')
                    ? 'text-rose-400'
                    : loadEnabled
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {loadStatusMessage}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="text-slate-500">LAST SYNC:</span>
              <span className="text-slate-300 font-semibold">
                {lastControlSync ? lastControlSync.toLocaleTimeString() : 'Awaiting sync'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Toggle Control Centerpiece */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-950/90 rounded-2xl p-5 border border-slate-800">
          
          <div className="space-y-1 font-mono text-xs">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">HARDWARE RELAY SWITCH</div>
            <div className="text-slate-200 font-bold flex items-center space-x-1.5">
              <span>{loadEnabled ? 'BUCK OUTPUT ACTIVE' : 'OPEN CIRCUIT / ISOLATED'}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {isLoadUpdating ? 'Syncing with Supabase...' : 'Click or press Space to toggle'}
            </div>
          </div>

          {/* High-End Industrial Toggle Switch */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              role="switch"
              aria-checked={loadEnabled}
              aria-label="Toggle Remote System Load"
              disabled={isLoadUpdating}
              onClick={handleToggle}
              onKeyDown={handleKeyDown}
              className={`relative inline-flex h-12 w-24 flex-shrink-0 cursor-pointer rounded-full border-2 p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#06090e] ${
                isLoadUpdating
                  ? 'border-cyan-500/50 bg-slate-900 opacity-80 cursor-wait'
                  : loadEnabled
                  ? 'border-emerald-400/80 bg-emerald-950/80 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                  : 'border-slate-700 bg-slate-900/90'
              }`}
            >
              {/* Internal Track Glow / Text */}
              <span
                className={`absolute inset-0 flex items-center justify-between px-3 text-[10px] font-mono font-black transition-opacity ${
                  loadEnabled ? 'text-emerald-400' : 'text-slate-600'
                }`}
              >
                <span className={loadEnabled ? 'opacity-100' : 'opacity-0'}>ON</span>
                <span className={!loadEnabled ? 'opacity-100' : 'opacity-0'}>OFF</span>
              </span>

              {/* Slider Knob */}
              <span
                aria-hidden="true"
                className={`pointer-events-none relative inline-flex h-9.5 w-9.5 transform items-center justify-center rounded-full bg-gradient-to-b from-white to-slate-200 shadow-lg ring-0 transition-transform duration-300 ease-in-out ${
                  loadEnabled ? 'translate-x-11.5 bg-gradient-to-b from-emerald-100 to-emerald-400 text-emerald-950' : 'translate-x-0 text-slate-600'
                }`}
              >
                {isLoadUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" />
                ) : loadEnabled ? (
                  <Zap className="h-4 w-4 text-emerald-900 fill-emerald-900" />
                ) : (
                  <Power className="h-4 w-4 text-slate-600" />
                )}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Safety & Pipeline Context Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-400">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>NODE: <strong className="text-white">{deviceId}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>CONTROL PIN: <strong className="text-slate-300">ESP32-S3 GPIO 4 (VOUT_EN)</strong></span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400">Row-Level Security & Conflict-Free Upsert Guarded</span>
        </div>
      </div>
    </div>
  );
};
