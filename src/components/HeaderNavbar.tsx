'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  Zap,
  Activity,
  BarChart3,
  Cpu,
  FileText,
  Settings as SettingsIcon,
  Play,
  Pause,
  RefreshCw,
  Menu,
  X,
  Radio,
  Wifi,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HeaderNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    deviceId,
    connectionState,
    secondsSinceLastUpdate,
    isSimulatorActive,
    setIsSimulatorActive,
    simulateIncomingData,
    supabaseStatus,
  } = useEnergyData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analytics', label: 'Energy Analytics', icon: BarChart3 },
    { id: 'device', label: 'Device & Hardware', icon: Cpu },
    { id: 'logs', label: 'Activity Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-2 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Zap className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-wider text-white">GREENCHARGE</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                v1.4.2 IoT
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              Intelligent Energy Monitoring System
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-slate-900/80 p-1.5 border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicators & Control Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Device ID Badge */}
          <div className="hidden xl:flex items-center space-x-2 rounded-lg bg-slate-900/90 px-3 py-1.5 border border-slate-800">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200">{deviceId}</span>
          </div>

          {/* Connection Status Indicator */}
          <div
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
              connectionState === 'ONLINE'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-red-950/40 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  connectionState === 'ONLINE' ? 'animate-ping bg-emerald-400' : 'animate-ping bg-red-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  connectionState === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              ></span>
            </span>
            <span>{connectionState}</span>
          </div>

          {/* Telemetry Simulator Control Pill */}
          <button
            onClick={() => setIsSimulatorActive(!isSimulatorActive)}
            title={isSimulatorActive ? 'Telemetry Simulator Active' : 'Simulator Paused'}
            className={`hidden sm:flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all ${
              isSimulatorActive
                ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40 hover:bg-cyan-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isSimulatorActive ? (
              <>
                <Pause className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono">SIM: LIVE</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] font-mono">SIM: PAUSED</span>
              </>
            )}
          </button>

          {/* Quick Manual Pulse Trigger */}
          <button
            onClick={simulateIncomingData}
            title="Inject Test Telemetry Packet"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Ticker bar for time since last reading */}
      <div className="bg-slate-950/80 px-4 py-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="text-slate-500">LAST TELEMETRY:</span>
            <span className="text-emerald-400 font-semibold">
              {secondsSinceLastUpdate === 0 ? 'Just now' : `${secondsSinceLastUpdate}s ago`}
            </span>
          </span>
          <span className="hidden sm:inline-block text-slate-700">|</span>
          <span className="hidden sm:flex items-center space-x-1.5">
            <Database className="h-3 w-3 text-cyan-400" />
            <span className="text-slate-400">CLOUD SYNC:</span>
            <span className={supabaseStatus === 'CONNECTED' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {supabaseStatus}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-500">UART STREAM:</span>
          <span className="text-cyan-300 font-semibold tracking-wide">DATA,V,I,P</span>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#07090e]/95 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
