'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { MetricCard } from './MetricCard';
import { RealTimePowerChart } from './RealTimePowerChart';
import { MultiMetricAnalytics } from './MultiMetricAnalytics';
import { HardwarePipelineHealth } from './HardwarePipelineHealth';
import { LiveSystemStatus } from './LiveSystemStatus';
import { DeviceInfoCard } from './DeviceInfoCard';
import { ActivityLogPanel } from './ActivityLogPanel';
import { ExecutiveEnergySummary } from './ExecutiveEnergySummary';
import { Radio, Zap, ShieldAlert, Cpu } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    deviceId,
    connectionState,
    secondsSinceLastUpdate,
    latestReading,
    readingsHistory,
  } = useEnergyData();

  const voltage = latestReading ? latestReading.voltage : 2.35;
  const current = latestReading ? latestReading.current : 0.12;
  const power = latestReading ? latestReading.power : 0.282;

  return (
    <div className="space-y-6">
      
      {/* SECTION 3: DASHBOARD HERO AREA */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl bg-radial-glow shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SYSTEM ONLINE & SYNCED</span>
              </span>
              <span className="text-xs font-mono text-slate-500">NODE: {deviceId}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              GREENCHARGE <span className="text-emerald-400 font-extralight text-2xl sm:text-4xl">Cloud</span>
            </h1>
            <p className="mt-1.5 text-sm sm:text-base font-medium text-slate-400">
              Intelligent Commercial IoT Energy Monitoring System (Arduino UNO + MAX471 + ESP8266)
            </p>
          </div>

          {/* Quick Hero Telemetry Summary */}
          <div className="flex items-center space-x-4 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 font-mono text-xs">
            <div className="space-y-1">
              <div className="text-slate-500">CURRENT DEVICE</div>
              <div className="text-white font-bold text-sm flex items-center space-x-1.5">
                <Radio className="h-4 w-4 text-cyan-400" />
                <span>{deviceId}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="space-y-1">
              <div className="text-slate-500">FRESHNESS</div>
              <div className="text-emerald-400 font-bold text-sm">
                {secondsSinceLastUpdate === 0 ? 'Just now' : `${secondsSinceLastUpdate}s ago`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Alert Banner if offline */}
      {connectionState === 'OFFLINE' && (
        <div className="rounded-2xl bg-red-950/60 border border-red-500/50 p-4 text-red-300 flex items-center justify-between shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="h-6 w-6 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">ESP8266 GATEWAY OFFLINE DETECTED</h4>
              <p className="text-xs font-mono text-red-300">
                No telemetry telemetry packet received in &gt;5 seconds. UART bridge or Wi-Fi connection interrupted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LIVE ENERGY OVERVIEW (3 METRIC CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          title="Voltage"
          value={voltage}
          unit="V"
          statusText={voltage > 2.0 ? 'Stable' : 'Low Voltage'}
          type="voltage"
          history={readingsHistory}
        />
        <MetricCard
          title="Current"
          value={current}
          unit="A"
          statusText={current > 0.05 ? 'Normal' : 'Idle'}
          type="current"
          history={readingsHistory}
        />
        <MetricCard
          title="Power Output"
          value={power}
          unit="W"
          statusText="ACTIVE"
          type="power"
          history={readingsHistory}
          isProminent={true}
        />
      </div>

      {/* SECTION 5: REAL-TIME POWER GRAPH */}
      <RealTimePowerChart history={readingsHistory} />

      {/* SECTION 6: MULTI-METRIC ANALYTICS */}
      <MultiMetricAnalytics history={readingsHistory} />

      {/* SECTION 8: HARDWARE PIPELINE HEALTH */}
      <HardwarePipelineHealth />

      {/* SECTION 7 & 9: LIVE SYSTEM STATUS & DEVICE INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LiveSystemStatus />
        <DeviceInfoCard />
      </div>

      {/* SECTION 12: EXECUTIVE ENERGY SUMMARY */}
      <ExecutiveEnergySummary />

      {/* SECTION 10: ACTIVITY LOG */}
      <ActivityLogPanel />
    </div>
  );
};
