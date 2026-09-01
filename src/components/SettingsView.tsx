'use client';

import React, { useState, useEffect } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { getSupabaseCredentials, SUPABASE_SQL_SETUP, resetSupabaseClient } from '@/lib/supabase';
import {
  Settings as SettingsIcon,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Radio,
  Play,
  Pause,
  ShieldCheck,
  Power,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    deviceId,
    setDeviceId,
    freshnessTimeoutSec,
    setFreshnessTimeoutSec,
    isSimulatorActive,
    setIsSimulatorActive,
    supabaseStatus,
    triggerOfflineState,
    simulateIncomingData,
    loadEnabled,
    toggleLoadControl,
    isLoadUpdating,
    addActivityLog,
    addToast,
  } = useEnergyData();

  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseAnonKey(creds.key);
  }, []);

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('GREENCHARGE_SUPABASE_URL', supabaseUrl.trim());
      localStorage.setItem('GREENCHARGE_SUPABASE_ANON_KEY', supabaseAnonKey.trim());
      resetSupabaseClient();
      setSaveSuccess(true);
      addActivityLog('success', 'Supabase Credentials Updated', 'Saved new Supabase API endpoint & key.');
      addToast('Supabase Saved', 'Reconnecting to real-time telemetry stream...', 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClearSupabaseConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('GREENCHARGE_SUPABASE_URL');
      localStorage.removeItem('GREENCHARGE_SUPABASE_ANON_KEY');
      localStorage.removeItem('DAGITAB_SUPABASE_URL');
      localStorage.removeItem('DAGITAB_SUPABASE_ANON_KEY');
      setSupabaseUrl('');
      setSupabaseAnonKey('');
      resetSupabaseClient();
      addActivityLog('info', 'Supabase Credentials Cleared', 'Reset to environment variables.');
      addToast('Credentials Reset', 'Reverted to default settings.', 'info');
    }
  };

  const copySqlSetup = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    addToast('SQL Copied', 'Paste into Supabase SQL Editor to initialize tables.', 'info');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-2">
          <SettingsIcon className="h-4 w-4" />
          <span>SYSTEM CONTROL & CLOUD BACKEND</span>
        </div>
        <h1 className="text-3xl font-black text-white">System Settings & Database</h1>
        <p className="text-sm font-medium text-slate-400 mt-1 font-sans">
          Configure Supabase project credentials, heartbeat parameters, device identifier, and telemetry simulator
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Supabase Configuration */}
        <div className="glass-panel rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-black text-white">SUPABASE CLOUD DATABASE CONFIG</h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                supabaseStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {supabaseStatus}
            </span>
          </div>

          <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">SUPABASE PROJECT URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">SUPABASE ANON / PUBLIC KEY</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>SAVE & CONNECT</span>
              </button>

              <button
                type="button"
                onClick={handleClearSupabaseConfig}
                className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-slate-400 border border-slate-800 hover:text-white transition-all"
              >
                RESET
              </button>

              {saveSuccess && (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <Check className="h-4 w-4" />
                  <span>Saved!</span>
                </span>
              )}
            </div>
          </form>

          {/* Copy SQL Schema Button */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">SQL Database Schema DDL (Readings + Control)</span>
              <button
                onClick={copySqlSetup}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors font-bold"
              >
                {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSql ? 'COPIED SQL!' : 'COPY SQL SETUP'}</span>
              </button>
            </div>
            <pre className="rounded-xl bg-slate-950 p-3 font-mono text-[10px] text-slate-400 max-h-40 overflow-y-auto border border-slate-800 leading-normal">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>
        </div>

        {/* Section 2: Heartbeat, Timeout & Simulator */}
        <div className="glass-panel rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-black text-white">DEVICE PARAMETERS & SIMULATION</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Device ID setting */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">PRIMARY DEVICE IDENTIFIER</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:border-cyan-500 focus:outline-none font-bold"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Filters incoming telemetry from <code className="text-emerald-400">energy_readings</code> and controls <code className="text-cyan-400">device_control</code>.
              </p>
            </div>

            {/* Freshness threshold slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-bold">DEVICE OFFLINE TIMEOUT THRESHOLD</label>
                <span className="text-cyan-400 font-bold">{freshnessTimeoutSec} SECONDS</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={freshnessTimeoutSec}
                onChange={(e) => setFreshnessTimeoutSec(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Transitions state to OFFLINE if no packet is received for &gt;{freshnessTimeoutSec}s.
              </p>
            </div>

            {/* Telemetry Simulator Controls */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-bold block">MICROBIAL FUEL CELL SIMULATOR</span>
                  <span className="text-[10px] text-slate-500">Generates realistic bio-redox telemetry</span>
                </div>

                <button
                  onClick={() => setIsSimulatorActive(!isSimulatorActive)}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                    isSimulatorActive
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {isSimulatorActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isSimulatorActive ? 'ACTIVE' : 'PAUSED'}</span>
                </button>
              </div>

              {/* Simulation test triggers */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={simulateIncomingData}
                  className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-emerald-400 hover:bg-slate-900 transition-colors font-bold text-[11px] flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>INJECT TEST PACKET</span>
                </button>

                <button
                  onClick={triggerOfflineState}
                  className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition-colors font-bold text-[11px] flex items-center justify-center space-x-1.5"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>TRIGGER DISCONNECT</span>
                </button>
              </div>
            </div>

            {/* Quick Load Test */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-bold block">REMOTE LOAD TEST SWITCH</span>
                <span className="text-[10px] text-slate-500">Current state: {loadEnabled ? 'ON' : 'OFF'}</span>
              </div>

              <button
                disabled={isLoadUpdating}
                onClick={() => toggleLoadControl(!loadEnabled)}
                className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
                  loadEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{isLoadUpdating ? 'SYNCING...' : loadEnabled ? 'LOAD ON' : 'LOAD OFF'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
