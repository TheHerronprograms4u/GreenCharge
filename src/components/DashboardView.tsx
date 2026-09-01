'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { HeroEnergyMonitor } from './HeroEnergyMonitor';
import { LiveTelemetryCards } from './LiveTelemetryCards';
import { RemoteLoadControl } from './RemoteLoadControl';
import { EnergyHarvestingFlow } from './EnergyHarvestingFlow';
import { EnergyTrendGraph } from './EnergyTrendGraph';
import { DeviceStatusPanel } from './DeviceStatusPanel';
import { TechnicalDetailsPanel } from './TechnicalDetailsPanel';
import { ActivityLogPanel } from './ActivityLogPanel';
import { AlertCircle, WifiOff, ShieldAlert } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { connectionState, freshnessTimeoutSec, deviceId } = useEnergyData();

  return (
    <div className="space-y-6">
      
      {/* Offline Alert Banner (Only displayed when offline timeout exceeded) */}
      {connectionState === 'OFFLINE' && (
        <div className="rounded-2xl bg-rose-950/70 border border-rose-500/60 p-4 text-rose-200 flex items-center justify-between shadow-[0_0_30px_rgba(244,63,94,0.25)] animate-pulse font-mono">
          <div className="flex items-center space-x-3">
            <WifiOff className="h-6 w-6 text-rose-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">HARDWARE OFFLINE — TELEMETRY TIMEOUT</h4>
              <p className="text-xs text-rose-300">
                No telemetry packet received from <strong>{deviceId}</strong> for &gt;{freshnessTimeoutSec} seconds. INA219 / ESP32-S3 link awaiting signal.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-block text-[11px] rounded-full bg-rose-900/60 px-3 py-1 border border-rose-500/40 text-rose-300 font-bold">
            AWAITING PACKET
          </span>
        </div>
      )}

      {/* 1. HERO ENERGY MONITOR (Centerpiece) */}
      <HeroEnergyMonitor />

      {/* 2. LIVE TELEMETRY CARDS (Voltage, Current, Power) */}
      <LiveTelemetryCards />

      {/* 3. REMOTE LOAD CONTROL (Critical Feature: BQ25570 Power Gate Switch) */}
      <RemoteLoadControl />

      {/* 4. ENERGY HARVESTING VISUALIZATION PATHWAY */}
      <EnergyHarvestingFlow />

      {/* 5. ENERGY TREND GRAPH (Interactive Historical Generation) */}
      <EnergyTrendGraph />

      {/* 6. TECHNICAL DEVICE STATUS MATRIX */}
      <DeviceStatusPanel />

      {/* 7. EXPANDABLE TECHNICAL DETAILS PANEL */}
      <TechnicalDetailsPanel />

      {/* 8. SYSTEM ACTIVITY & AUDIT LOG */}
      <ActivityLogPanel />

    </div>
  );
};
