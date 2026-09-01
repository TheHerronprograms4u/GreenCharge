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
} from 'recharts';
import { BarChart2, Zap, Gauge, Activity } from 'lucide-react';
import { EnergyReading } from '@/types/energy';

interface MultiMetricAnalyticsProps {
  history: EnergyReading[];
}

export const MultiMetricAnalytics: React.FC<MultiMetricAnalyticsProps> = ({ history }) => {
  const [showVoltage, setShowVoltage] = useState<boolean>(true);
  const [showCurrent, setShowCurrent] = useState<boolean>(true);
  const [showPower, setShowPower] = useState<boolean>(true);

  const dataSlice = history.slice(-35);

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
    if (chartData.length === 0) return { avg: '0.000', min: '0.000', max: '0.000', latest: '0.000' };
    const vals = chartData.map((d) => d[key]);
    const sum = vals.reduce((a, b) => a + b, 0);
    const decimals = key === 'power' ? 2 : 3;
    return {
      avg: (sum / vals.length).toFixed(decimals),
      min: Math.min(...vals).toFixed(decimals),
      max: Math.max(...vals).toFixed(decimals),
      latest: vals[vals.length - 1].toFixed(decimals),
    };
  };

  const vStats = getStats('voltage');
  const cStats = getStats('current');
  const pStats = getStats('power');

  return (
    <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-7 backdrop-blur-xl">
      {/* Header & Toggle Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              SYNCHRONIZED MULTI-METRIC ANALYTICS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Comparative Voltage (V), Current (mA), and Power (mW) Streams
            </p>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={() => setShowVoltage(!showVoltage)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
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
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
              showCurrent
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showCurrent ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
            <span>Current (mA)</span>
          </button>

          <button
            onClick={() => setShowPower(!showPower)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
              showPower
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showPower ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            <span>Power (mW)</span>
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
                    <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-3.5 shadow-xl backdrop-blur-md font-mono">
                      <div className="text-[11px] text-slate-400 mb-1 border-b border-slate-800 pb-1">{d.time}</div>
                      {showVoltage && <div className="text-xs text-cyan-400">Voltage: {d.voltage.toFixed(3)} V</div>}
                      {showCurrent && <div className="text-xs text-blue-400">Current: {d.current.toFixed(3)} mA</div>}
                      {showPower && <div className="text-xs text-emerald-400 font-bold">Power: {d.power.toFixed(2)} mW</div>}
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
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showCurrent && (
              <Line
                type="monotone"
                dataKey="current"
                name="Current (mA)"
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
                name="Power (mW)"
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
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        {/* Voltage Summary */}
        <div className={`rounded-xl bg-slate-950/80 p-3 border transition-all ${showVoltage ? 'border-cyan-500/30' : 'border-slate-800 opacity-50'}`}>
          <div className="font-bold text-cyan-400 mb-1">VOLTAGE METRICS</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
            <div>AVG: <span className="text-slate-200">{vStats.avg} V</span></div>
            <div>MIN: <span className="text-slate-200">{vStats.min} V</span></div>
            <div>MAX: <span className="text-slate-200">{vStats.max} V</span></div>
            <div>LATEST: <span className="text-cyan-300 font-bold">{vStats.latest} V</span></div>
          </div>
        </div>

        {/* Current Summary */}
        <div className={`rounded-xl bg-slate-950/80 p-3 border transition-all ${showCurrent ? 'border-blue-500/30' : 'border-slate-800 opacity-50'}`}>
          <div className="font-bold text-blue-400 mb-1">CURRENT METRICS</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
            <div>AVG: <span className="text-slate-200">{cStats.avg} mA</span></div>
            <div>MIN: <span className="text-slate-200">{cStats.min} mA</span></div>
            <div>MAX: <span className="text-slate-200">{cStats.max} mA</span></div>
            <div>LATEST: <span className="text-blue-300 font-bold">{cStats.latest} mA</span></div>
          </div>
        </div>

        {/* Power Summary */}
        <div className={`rounded-xl bg-slate-950/80 p-3 border transition-all ${showPower ? 'border-emerald-500/30' : 'border-slate-800 opacity-50'}`}>
          <div className="font-bold text-emerald-400 mb-1">POWER METRICS</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
            <div>AVG: <span className="text-slate-200">{pStats.avg} mW</span></div>
            <div>MIN: <span className="text-slate-200">{pStats.min} mW</span></div>
            <div>MAX: <span className="text-slate-200">{pStats.max} mW</span></div>
            <div>LATEST: <span className="text-emerald-300 font-bold">{pStats.latest} mW</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
