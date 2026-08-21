'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart2, Check, Eye } from 'lucide-react';
import { EnergyReading } from '@/types/energy';

interface MultiMetricAnalyticsProps {
  history: EnergyReading[];
}

export const MultiMetricAnalytics: React.FC<MultiMetricAnalyticsProps> = ({ history }) => {
  const [showVoltage, setShowVoltage] = useState<boolean>(true);
  const [showCurrent, setShowCurrent] = useState<boolean>(true);
  const [showPower, setShowPower] = useState<boolean>(true);

  const dataSlice = history.slice(-30);

  const chartData = dataSlice.map((item) => {
    const d = new Date(item.created_at);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      voltage: item.voltage,
      current: item.current,
      power: item.power,
    };
  });

  // Calculate statistics for selected metrics
  const getStats = (key: 'voltage' | 'current' | 'power') => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0, latest: 0 };
    const vals = chartData.map((d) => d[key]);
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      avg: Number((sum / vals.length).toFixed(3)),
      min: Number(Math.min(...vals).toFixed(3)),
      max: Number(Math.max(...vals).toFixed(3)),
      latest: Number(vals[vals.length - 1].toFixed(3)),
    };
  };

  const vStats = getStats('voltage');
  const cStats = getStats('current');
  const pStats = getStats('power');

  return (
    <div className="glass-panel relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
      {/* Header & Toggle Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">MULTI-METRIC TELEMETRY ANALYTICS</h3>
            <p className="text-xs text-slate-400 font-mono">Synchronized Voltage, Current & Power Comparison</p>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowVoltage(!showVoltage)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
              showVoltage
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showVoltage ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
            <span>Voltage (V)</span>
          </button>

          <button
            onClick={() => setShowCurrent(!showCurrent)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
              showCurrent
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showCurrent ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
            <span>Current (A)</span>
          </button>

          <button
            onClick={() => setShowPower(!showPower)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
              showPower
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showPower ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            <span>Power (W)</span>
          </button>
        </div>
      </div>

      {/* Multi-Line Synchronized Recharts Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">{d.time}</div>
                      {showVoltage && <div className="text-xs font-mono text-cyan-400">Voltage: {d.voltage.toFixed(3)} V</div>}
                      {showCurrent && <div className="text-xs font-mono text-blue-400">Current: {d.current.toFixed(3)} A</div>}
                      {showPower && <div className="text-xs font-mono text-emerald-400 font-bold">Power: {d.power.toFixed(3)} W</div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            {showVoltage && (
              <Line
                type="monotone"
                dataKey="voltage"
                name="Voltage (V)"
                stroke="#00f0ff"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showCurrent && (
              <Line
                type="monotone"
                dataKey="current"
                name="Current (A)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showPower && (
              <Line
                type="monotone"
                dataKey="power"
                name="Power (W)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics Table */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Voltage Summary */}
        <div className={`rounded-xl bg-slate-950/80 p-3 border transition-all ${showVoltage ? 'border-cyan-500/30' : 'border-slate-800 opacity-50'}`}>
          <div className="text-xs font-mono font-bold text-cyan-400 mb-1">VOLTAGE METRICS</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
            <div>AVG: <span className="text-slate-200">{vStats.avg} V</span></div>
            <div>MIN: <span className="text-slate-200">{vStats.min} V</span></div>
            <div>MAX: <span className="text-slate-200">{vStats.max} V</span></div>
            <div>LATEST: <span className="text-cyan-300 font-bold">{vStats.latest} V</span></div>
          </div>
        </div>

        {/* Current Summary */}
        <div className={`rounded-xl bg-slate-950/80 p-3 border transition-all ${showCurrent ? 'border-blue-500/30' : 'border-slate-800 opacity-50'}`}>
          <div className="text-xs font-mono font-bold text-blue-400 mb-1">CURRENT METRICS</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
            <div>AVG: <span className="text-slate-200">{cStats.avg} A</span></div>
            <div>MIN: <span className="text-slate-200">{cStats.min} A</span></div>
            <div>MAX: <span className="text-slate-200">{cStats.max} A</span></div>
            <div>LATEST: <span className="text-blue-300 font-bold">{cStats.latest} A</span></div>
          </div>
        </div>

        {/* Power Summary */}
        <div className={`rounded-xl bg-slate-950/80 p-3 border transition-all ${showPower ? 'border-emerald-500/30' : 'border-slate-800 opacity-50'}`}>
          <div className="text-xs font-mono font-bold text-emerald-400 mb-1">POWER METRICS</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
            <div>AVG: <span className="text-slate-200">{pStats.avg} W</span></div>
            <div>MIN: <span className="text-slate-200">{pStats.min} W</span></div>
            <div>MAX: <span className="text-slate-200">{pStats.max} W</span></div>
            <div>LATEST: <span className="text-emerald-300 font-bold">{pStats.latest} W</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
