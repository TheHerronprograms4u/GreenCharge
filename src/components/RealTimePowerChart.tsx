'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import { Zap, Clock, Maximize2 } from 'lucide-react';
import { EnergyReading, TimeWindow } from '@/types/energy';

interface RealTimePowerChartProps {
  history: EnergyReading[];
}

export const RealTimePowerChart: React.FC<RealTimePowerChartProps> = ({ history }) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('5m');

  // Filter history based on time window
  const getFilteredData = () => {
    if (!history || history.length === 0) return [];
    
    const now = Date.now();
    let durationMs = 5 * 60 * 1000; // 5 min default

    switch (timeWindow) {
      case '1m':
        durationMs = 1 * 60 * 1000;
        break;
      case '5m':
        durationMs = 5 * 60 * 1000;
        break;
      case '15m':
        durationMs = 15 * 60 * 1000;
        break;
      case '1h':
        durationMs = 60 * 60 * 1000;
        break;
      case '24h':
        durationMs = 24 * 60 * 60 * 1000;
        break;
    }

    const cutoff = now - durationMs;
    const filtered = history.filter((item) => new Date(item.created_at).getTime() >= cutoff);
    
    // If filtered is empty, return last 20 items so chart always shows data
    return filtered.length > 0 ? filtered : history.slice(-20);
  };

  const chartData = getFilteredData().map((item) => {
    const d = new Date(item.created_at);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      power: item.power,
      voltage: item.voltage,
      current: item.current,
      fullTime: d.toISOString(),
      raw: item,
    };
  });

  const latestItem = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  return (
    <div className="glass-panel relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
              <span>REAL-TIME POWER STREAM</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              MAX471 Telemetry Output (Watts vs Time)
            </p>
          </div>
        </div>

        {/* Time Window Selectors */}
        <div className="flex items-center space-x-1 rounded-xl bg-slate-950/80 p-1 border border-slate-800">
          {(['1m', '5m', '15m', '1h', '24h'] as TimeWindow[]).map((window) => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                timeWindow === window
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-glow-emerald'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <Clock className="h-8 w-8 mb-2 animate-spin text-slate-600" />
            <p className="text-sm font-mono">Waiting for Telemetry Measurements...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                unit=" W"
                domain={['auto', 'auto']}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700/80 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md">
                        <div className="text-[11px] font-mono text-slate-400 mb-1 border-b border-slate-800 pb-1">
                          TIME: <span className="text-white font-semibold">{data.time}</span>
                        </div>
                        <div className="space-y-1 font-mono text-xs">
                          <div className="flex items-center justify-between text-emerald-400 font-bold">
                            <span>Power:</span>
                            <span className="text-sm">{data.power.toFixed(3)} W</span>
                          </div>
                          <div className="flex items-center justify-between text-cyan-300">
                            <span>Voltage:</span>
                            <span>{data.voltage.toFixed(3)} V</span>
                          </div>
                          <div className="flex items-center justify-between text-blue-400">
                            <span>Current:</span>
                            <span>{data.current.toFixed(3)} A</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="power"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#powerGradient)"
                isAnimationActive={false}
              />

              {latestItem && (
                <ReferenceDot
                  x={latestItem.time}
                  y={latestItem.power}
                  r={5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer bar with live statistics */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center space-x-4">
          <span className="text-slate-500">WINDOW SAMPLES: <span className="text-slate-200">{chartData.length}</span></span>
          <span className="text-slate-500">PRIMARY SENSOR: <span className="text-cyan-400 font-semibold">MAX471</span></span>
        </div>
        {latestItem && (
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <span>LATEST POWER:</span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
              {latestItem.power.toFixed(3)} W
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
