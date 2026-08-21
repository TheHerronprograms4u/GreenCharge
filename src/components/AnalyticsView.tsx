'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { BarChart3, Calendar, Download, RefreshCw, Zap, Gauge, Activity, Database } from 'lucide-react';
import { HistoricalWindow } from '@/types/energy';

export const AnalyticsView: React.FC = () => {
  const { readingsHistory, deviceId, refreshData } = useEnergyData();
  const [selectedRange, setSelectedRange] = useState<HistoricalWindow>('today');

  const history = readingsHistory;

  const count = history.length;
  const powers = history.map((r) => r.power);
  const voltages = history.map((r) => r.voltage);
  const currents = history.map((r) => r.current);

  const avgPower = powers.length ? (powers.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';
  const peakPower = powers.length ? Math.max(...powers).toFixed(3) : '0.000';
  const minPower = powers.length ? Math.min(...powers).toFixed(3) : '0.000';
  const avgVoltage = voltages.length ? (voltages.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';
  const avgCurrent = currents.length ? (currents.reduce((a, b) => a + b, 0) / count).toFixed(3) : '0.000';

  const chartData = history.map((item) => {
    const d = new Date(item.created_at);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: d.toLocaleDateString(),
      voltage: item.voltage,
      current: item.current,
      power: item.power,
      deviceId: item.device_id || deviceId,
      fullTime: item.created_at,
    };
  });

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold mb-2">
              <BarChart3 className="h-4 w-4" />
              <span>HISTORICAL TELEMETRY INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl font-black text-white">Energy Consumption Analytics</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Historical power generation & load performance data for device {deviceId}
            </p>
          </div>

          {/* Range Selector */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-950 p-1.5 border border-slate-800 font-mono text-xs">
            {(['today', 'yesterday', '7d', '30d', 'custom'] as HistoricalWindow[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`rounded-xl px-3 py-1.5 uppercase font-bold transition-all ${
                  selectedRange === range
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="rounded-2xl glass-panel p-4 border border-slate-800 bg-slate-900/70">
          <div className="text-[11px] text-slate-500 mb-1">TOTAL READINGS</div>
          <div className="text-2xl font-black text-white">{count}</div>
          <div className="text-[10px] text-slate-400 mt-1">Recorded to Supabase</div>
        </div>

        <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-slate-900/70">
          <div className="text-[11px] text-emerald-400 mb-1">AVERAGE POWER</div>
          <div className="text-2xl font-black text-emerald-300">{avgPower} W</div>
          <div className="text-[10px] text-slate-400 mt-1">Across time window</div>
        </div>

        <div className="rounded-2xl glass-panel p-4 border border-cyan-500/30 bg-slate-900/70">
          <div className="text-[11px] text-cyan-400 mb-1">PEAK POWER</div>
          <div className="text-2xl font-black text-cyan-300">{peakPower} W</div>
          <div className="text-[10px] text-slate-400 mt-1">Maximum surge load</div>
        </div>

        <div className="rounded-2xl glass-panel p-4 border border-slate-800 bg-slate-900/70">
          <div className="text-[11px] text-slate-500 mb-1">AVG VOLTAGE & CURRENT</div>
          <div className="text-lg font-bold text-slate-200">{avgVoltage}V / {avgCurrent}A</div>
          <div className="text-[10px] text-slate-400 mt-1">MAX471 sensor RMS</div>
        </div>
      </div>

      {/* Power History Chart */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <span>HISTORICAL POWER CURVE (WATTS)</span>
          </h3>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="histPowerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} unit=" W" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md">
                        <div className="text-[11px] font-mono text-slate-400 mb-1">
                          TIMESTAMP: <span className="text-white">{data.fullTime}</span>
                        </div>
                        <div className="space-y-1 font-mono text-xs">
                          <div className="text-emerald-400 font-bold">Power: {data.power.toFixed(3)} W</div>
                          <div className="text-cyan-300">Voltage: {data.voltage.toFixed(3)} V</div>
                          <div className="text-blue-400">Current: {data.current.toFixed(3)} A</div>
                          <div className="text-slate-500 pt-1 text-[10px]">Device ID: {data.deviceId}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="power" stroke="#10b981" strokeWidth={2} fill="url(#histPowerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Synchronized Voltage and Current History Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-cyan-400" />
            <span>VOLTAGE STABILITY HISTORY</span>
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} unit=" V" />
                <Line type="monotone" dataKey="voltage" stroke="#00f0ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span>CURRENT LOAD HISTORY</span>
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} unit=" A" />
                <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
