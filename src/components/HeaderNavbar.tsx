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
  ShieldCheck,
  User,
  Sparkles,
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
    lastUpdatedTime,
    isSimulatorActive,
    setIsSimulatorActive,
    simulateIncomingData,
    refreshData,
    supabaseStatus,
  } = useEnergyData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'analytics', label: 'Energy Analytics', icon: BarChart3 },
    { id: 'device', label: 'Hardware & Architecture', icon: Cpu },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Cloud & Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#06090e]/95 backdrop-blur-xl">
      {/* Primary Top Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Device Identifier */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-cyan-500/20 p-2 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Zap className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-wider text-white">
                GREEN<span className="text-emerald-400">CHARGE</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                MFC IoT
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Microbial Fuel Cell Energy-Harvesting System
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 rounded-xl bg-slate-950/80 p-1.5 border border-slate-800/90 font-mono">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.18)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicators & Control Actions */}
        <div className="flex items-center space-x-2.5">
          
          {/* Small Device Identifier */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-slate-950 px-2.5 py-1.5 border border-slate-800 font-mono text-xs">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-300">{deviceId}</span>
          </div>

          {/* Compact System Status Indicator (ONLINE / OFFLINE) */}
          <div
            className={`flex items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold border transition-all ${
              connectionState === 'ONLINE'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-red-950/40 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  connectionState === 'ONLINE' ? 'animate-ping bg-emerald-400' : 'bg-red-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  connectionState === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              ></span>
            </span>
            <span>{connectionState}</span>
          </div>

          {/* System Refresh Indicator Button */}
          <button
            onClick={handleManualRefresh}
            title="Refresh System Telemetry & Control"
            aria-label="Refresh Data"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-900 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Simulator Toggle Pill */}
          <button
            onClick={() => setIsSimulatorActive(!isSimulatorActive)}
            title={isSimulatorActive ? 'Telemetry Simulator Active' : 'Simulator Paused'}
            className={`hidden md:flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold border transition-all ${
              isSimulatorActive
                ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40 hover:bg-cyan-900/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isSimulatorActive ? (
              <>
                <Pause className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px]">SIM: LIVE</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px]">SIM: PAUSED</span>
              </>
            )}
          </button>

          {/* Profile / Engineer Area */}
          <div className="hidden xl:flex items-center space-x-2 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <User className="h-4 w-4" />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Navigation"
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Sub-header Information Strip */}
      <div className="bg-slate-950/90 px-4 py-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="text-slate-500">LAST SYNC:</span>
            <span className="text-emerald-400 font-semibold">
              {secondsSinceLastUpdate === 0 ? 'Just now' : `${secondsSinceLastUpdate}s ago`}
              {lastUpdatedTime ? ` (${lastUpdatedTime.toLocaleTimeString()})` : ''}
            </span>
          </span>

          <span className="hidden sm:inline-block text-slate-700">|</span>

          <span className="hidden sm:flex items-center space-x-1.5">
            <Database className="h-3 w-3 text-cyan-400" />
            <span className="text-slate-500">SUPABASE REALTIME:</span>
            <span
              className={`font-semibold ${
                supabaseStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {supabaseStatus}
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-500">
          <span className="hidden md:inline-block">
            HARVESTER: <strong className="text-slate-300">BQ25570 MPPT + INA219</strong>
          </span>
          <span>
            TARGET TABLE: <strong className="text-cyan-400">energy_readings</strong>
          </span>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#06090e]/98 px-4 py-3 space-y-2 font-mono">
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
                className={`flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
