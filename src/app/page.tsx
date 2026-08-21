'use client';

import React, { useState } from 'react';
import { EnergyDataProvider } from '@/context/EnergyDataContext';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { DashboardView } from '@/components/DashboardView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { DeviceView } from '@/components/DeviceView';
import { LogsView } from '@/components/LogsView';
import { SettingsView } from '@/components/SettingsView';
import { Zap, ShieldCheck, Terminal, Cpu } from 'lucide-react';

function MainContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-[#07090e] bg-tech-grid text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
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

      {/* Futuristic Industrial Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider">GREENCHARGE</span>
              <span className="ml-2 text-[10px] text-slate-500">Arduino UNO + MAX471 + ESP8266 + Supabase</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>NODE: <strong className="text-slate-300">GREENCHARGE-001</strong></span>
            <span>|</span>
            <span>PROTOCOL: <strong className="text-cyan-400">UART 9600 BAUD</strong></span>
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
