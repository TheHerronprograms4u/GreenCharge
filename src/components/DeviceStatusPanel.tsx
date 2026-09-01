'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  Cpu,
  Zap,
  Radio,
  Power,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from 'lucide-react';

export const DeviceStatusPanel: React.FC = () => {
  const { deviceStatusMatrix, secondsSinceLastUpdate, deviceId } = useEnergyData();

  const statusItems = [
    {
      label: 'ESP32-S3',
      subtext: 'Main SoC Controller',
      value: deviceStatusMatrix.esp32,
      isOk: deviceStatusMatrix.esp32 === 'ONLINE',
      icon: Cpu,
    },
    {
      label: 'INA219',
      subtext: 'I2C Current/Voltage Sensor',
      value: deviceStatusMatrix.ina219,
      isOk: deviceStatusMatrix.ina219 === 'CONNECTED',
      icon: Zap,
    },
    {
      label: 'BQ25570',
      subtext: 'MPPT Harvester PMIC',
      value: deviceStatusMatrix.bq25570 === 'MPPT_ACTIVE' ? 'Enabled (80% MPPT)' : 'Disabled',
      isOk: deviceStatusMatrix.bq25570 === 'MPPT_ACTIVE',
      icon: Activity,
    },
    {
      label: 'Load Output',
      subtext: 'BQ25570 Buck Rail',
      value: deviceStatusMatrix.load,
      isOk: deviceStatusMatrix.load === 'ON',
      isWarning: deviceStatusMatrix.load === 'SWITCHING',
      icon: Power,
    },
    {
      label: 'Supabase DB',
      subtext: 'PostgreSQL Realtime',
      value: deviceStatusMatrix.supabase,
      isOk: deviceStatusMatrix.supabase === 'CONNECTED',
      isWarning: deviceStatusMatrix.supabase === 'UNCONFIGURED',
      icon: Database,
    },
  ];

  return (
    <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-7 backdrop-blur-xl space-y-4">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              DEVICE HARDWARE & SUBSYSTEM STATUS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live hardware diagnostics matrix for node {deviceId}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-slate-500">
          HEARTBEAT: <strong className="text-slate-300">{secondsSinceLastUpdate}s</strong>
        </span>
      </div>

      {/* Grid of Compact Status Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{item.label}</span>
                <Icon className="h-3.5 w-3.5 text-slate-500" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      item.isOk
                        ? 'bg-emerald-400 animate-pulse'
                        : item.isWarning
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      item.isOk
                        ? 'text-emerald-400'
                        : item.isWarning
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">{item.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Timestamps Footer */}
      <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            LAST TELEMETRY RECEIVED: <strong className="text-white">{deviceStatusMatrix.lastTelemetry || 'Waiting...'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>
            LAST CONTROL SYNCHRONIZATION: <strong className="text-white">{deviceStatusMatrix.lastControlSync || 'Awaiting sync...'}</strong>
          </span>
        </div>
      </div>

    </div>
  );
};
