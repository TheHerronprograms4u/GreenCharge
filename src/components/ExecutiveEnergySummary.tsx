'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { Zap, Gauge, Activity, Database, Clock, ShieldCheck } from 'lucide-react';

export const ExecutiveEnergySummary: React.FC = () => {
  const { readingsHistory, latestReading, secondsSinceLastUpdate, deviceInfo } = useEnergyData();

  const count = readingsHistory.length;

  const powers = readingsHistory.map((r) => r.power);
  const voltages = readingsHistory.map((r) => r.voltage);
  const currents = readingsHistory.map((r) => r.current);

  const currentPower = latestReading ? latestReading.power.toFixed(3) : '0.000';
  const peakPower = powers.length ? Math.max(...powers).toFixed(3) : '0.000';
  const avgPower = powers.length ? (powers.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';
  const avgVoltage = voltages.length ? (voltages.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';
  const avgCurrent = currents.length ? (currents.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const summaryCards = [
    {
      label: 'Current Power',
      value: `${currentPower} W`,
      subText: 'Realtime Output',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: Zap,
    },
    {
      label: 'Peak Power',
      value: `${peakPower} W`,
      subText: 'Session Maximum',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: Activity,
    },
    {
      label: 'Average Power',
      value: `${avgPower} W`,
      subText: 'Session Mean',
      color: 'text-emerald-300',
      border: 'border-slate-800',
      icon: Zap,
    },
    {
      label: 'Average Voltage',
      value: `${avgVoltage} V`,
      subText: 'RMS Voltage',
      color: 'text-cyan-300',
      border: 'border-slate-800',
      icon: Gauge,
    },
    {
      label: 'Average Current',
      value: `${avgCurrent} A`,
      subText: 'RMS Current',
      color: 'text-blue-400',
      border: 'border-slate-800',
      icon: Activity,
    },
    {
      label: 'Measurements Recorded',
      value: count.toString(),
      subText: 'Database Rows',
      color: 'text-purple-400',
      border: 'border-slate-800',
      icon: Database,
    },
    {
      label: 'Device Uptime',
      value: formatUptime(deviceInfo.uptimeSeconds),
      subText: 'Continuous Run',
      color: 'text-amber-400',
      border: 'border-slate-800',
      icon: Clock,
    },
    {
      label: 'Last Data Received',
      value: secondsSinceLastUpdate === 0 ? 'Just now' : `${secondsSinceLastUpdate}s ago`,
      subText: 'Telemetry Freshness',
      color: 'text-emerald-400',
      border: 'border-slate-800',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
          <span>EXECUTIVE TELEMETRY SUMMARY</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl glass-panel p-4 border ${card.border} bg-slate-900/70 hover:border-slate-700 transition-all`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>{card.label}</span>
                <Icon className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className={`font-mono text-xl font-black ${card.color} my-1`}>
                {card.value}
              </div>
              <div className="text-[10px] font-mono text-slate-500">{card.subText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
