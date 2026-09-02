'use client';

import React, { useState, useEffect } from 'react';
import { EnergyDataProvider, useEnergyData } from '@/context/EnergyDataContext';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { ToastContainer } from '@/components/ToastContainer';
import { DashboardView } from '@/components/DashboardView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { DeviceView } from '@/components/DeviceView';
import { LogsView } from '@/components/LogsView';
import { SettingsView } from '@/components/SettingsView';
import { Zap, ShieldCheck, Sparkles, Radio, Cpu, Layers } from 'lucide-react';

function MainContent() {
  const { deviceId } = useEnergyData();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#06090e] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse">
          <Zap className="h-6 w-6" />
        </div>
        <div className="text-xs text-slate-300 font-bold tracking-widest uppercase">
          INITIALIZING DAGITAB COMMAND CENTER...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06090e] bg-tech-grid text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Navbar Header */}
      <HeaderNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'device' && <DeviceView />}
        {activeTab === 'logs' && <LogsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Futuristic Industrial Scientific Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider">DAGITAB</span>
              <span className="ml-2 text-[10px] text-slate-400">
                Microbial Fuel Cell Harvester • ESP32-S3 + INA219 + TI BQ25570 + Supabase
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-3 sm:space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-slate-400">
              <Radio className="h-3 w-3 text-cyan-400" />
              <span>NODE: <strong className="text-slate-200">{deviceId}</strong></span>
            </span>
            <span>|</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Layers className="h-3 w-3 text-emerald-400" />
              <span>PMIC: <strong className="text-emerald-400">BQ25570 MPPT</strong></span>
            </span>
            <span>|</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>RLS SECURED</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <EnergyDataProvider>
      <MainContent />
    </EnergyDataProvider>
  );
}
