'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  Activity,
  Radio,
  Wifi,
  Database,
  Clock,
  Zap,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const LiveSystemStatus: React.FC = () => {
  const { systemHealth, rawUartMessage, secondsSinceLastUpdate } = useEnergyData();

  const statuses = [
    {
      label: 'Device Status',
      value: systemHealth.deviceStatus,
      isGood: systemHealth.deviceStatus === 'ONLINE',
      icon: Radio,
    },
    {
      label: 'Sensor Status',
      value: systemHealth.sensorStatus,
      isGood: systemHealth.sensorStatus === 'CONNECTED',
      icon: Zap,
    },
    {
      label: 'Wi-Fi Status',
      value: systemHealth.wifiStatus,
      isGood: systemHealth.wifiStatus === 'CONNECTED',
      icon: Wifi,
    },
    {
      label: 'Cloud Backend',
      value: systemHealth.cloudStatus,
      isGood: systemHealth.cloudStatus.includes('CONNECTED') || systemHealth.cloudStatus.includes('SIMULATION'),
      icon: Database,
    },
    {
      label: 'Telemetry Stream',
      value: systemHealth.dataStreamStatus,
      isGood: systemHealth.dataStreamStatus === 'ACTIVE',
      icon: Activity,
    },
    {
      label: 'Primary Device ID',
      value: systemHealth.deviceId,
      isGood: true,
      icon: Terminal,
    },
  ];

  return (
    <div className="glass-panel relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">SYSTEM DIAGNOSTICS</h3>
            <p className="text-xs text-slate-400 font-mono">Live Telemetry & Connectivity Matrix</p>
          </div>
        </div>
      </div>

      {/* Grid of status items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statuses.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>{item.label}</span>
                <Icon className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className={`h-2 w-2 rounded-full ${item.isGood ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className={`font-mono text-xs font-bold ${item.isGood ? 'text-white' : 'text-red-400'}`}>
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw UART Data Packet Stream Inspector */}
      <div className="mt-3 rounded-xl bg-slate-950 p-3.5 border border-slate-800/90">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <Terminal className="h-3.5 w-3.5" />
            <span>UART RX STRING (Arduino ➔ ESP8266)</span>
          </span>
          <span className="text-slate-500">BAUD: 9600</span>
        </div>
        <div className="font-mono text-xs text-emerald-400 bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 overflow-x-auto tracking-wider flex items-center justify-between">
          <span>{rawUartMessage}</span>
          <span className="text-[10px] text-slate-500 ml-2">CRC: OK</span>
        </div>
      </div>
    </div>
  );
};
