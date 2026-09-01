'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { Zap, Gauge, Activity, Database, Clock, ShieldCheck, BatteryCharging, Sparkles } from 'lucide-react';

export const ExecutiveEnergySummary: React.FC = () => {
  const { readingsHistory, latestReading, secondsSinceLastUpdate, deviceInfo } = useEnergyData();

  const count = readingsHistory.length;

  const powers = readingsHistory.map((r) => r.power);
  const voltages = readingsHistory.map((r) => r.voltage);
  const currents = readingsHistory.map((r) => r.current);

  const currentPower = latestReading ? latestReading.power.toFixed(2) : '0.00';
  const peakPower = powers.length ? Math.max(...powers).toFixed(2) : '0.00';
  const avgPower = powers.length ? (powers.reduce((a, b) => a + b, 0) / count).toFixed(2) : '0.00';
  const avgVoltage = voltages.length ? (voltages.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';
  const avgCurrent = currents.length ? (currents.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';

  // Energy yield estimate: (avgPower in mW * (count * 3 sec / 3600 sec)) = mWh
  const energyMwh = powers.length ? ((Number(avgPower) * (count * 3)) / 3600).toFixed(3) : '0.000';

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const summaryCards = [
    {
      label: 'Current Power',
      value: `${currentPower} mW`,
      subText: 'Real-time Generation',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      icon: Zap,
    },
    {
      label: 'Peak Harvested Power',
      value: `${peakPower} mW`,
      subText: 'Maximum Bio-Output',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: Activity,
    },
    {
      label: 'Average Power',
      value: `${avgPower} mW`,
      subText: 'Session Mean Output',
      color: 'text-emerald-300',
      border: 'border-slate-800',
      icon: Sparkles,
    },
    {
      label: 'Cumulative Energy Yield',
      value: `${energyMwh} mWh`,
      subText: 'Estimated Harvest Yield',
      color: 'text-indigo-400',
      border: 'border-slate-800',
      icon: BatteryCharging,
    },
    {
      label: 'Average Cell Voltage',
      value: `${avgVoltage} V`,
      subText: 'MFC Potential Mean',
      color: 'text-cyan-300',
      border: 'border-slate-800',
      icon: Gauge,
    },
    {
      label: 'Average Shunt Current',
      value: `${avgCurrent} mA`,
      subText: 'RMS Harvester Flux',
      color: 'text-blue-400',
      border: 'border-slate-800',
      icon: Activity,
    },
    {
      label: 'Telemetry Readings',
      value: count.toString(),
      subText: 'Database Packets Ingested',
      color: 'text-purple-400',
      border: 'border-slate-800',
      icon: Database,
    },
    {
      label: 'Device Uptime',
      value: formatUptime(deviceInfo.uptimeSeconds),
      subText: 'Continuous Node Run',
      color: 'text-amber-400',
      border: 'border-slate-800',
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
          <span>EXECUTIVE HARVESTING SUMMARY</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl glass-panel p-4 border ${card.border} bg-slate-900/70 hover:border-slate-700 transition-all font-mono`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>{card.label}</span>
                <Icon className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className={`text-xl font-black ${card.color} my-1`}>
                {card.value}
              </div>
              <div className="text-[10px] text-slate-500">{card.subText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
