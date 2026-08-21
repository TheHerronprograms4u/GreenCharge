'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Zap, Activity, Gauge } from 'lucide-react';
import { EnergyReading } from '@/types/energy';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  statusText: string;
  type: 'voltage' | 'current' | 'power';
  history: EnergyReading[];
  isProminent?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  statusText,
  type,
  history,
  isProminent = false,
}) => {
  // Extract history data for sparkline
  const sparklineData = history.slice(-20).map((item) => ({
    val: type === 'voltage' ? item.voltage : type === 'current' ? item.current : item.power,
  }));

  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (sparklineData.length >= 2) {
    const prev = sparklineData[sparklineData.length - 2].val;
    const curr = sparklineData[sparklineData.length - 1].val;
    if (curr > prev + 0.002) trend = 'up';
    else if (curr < prev - 0.002) trend = 'down';
  }

  // Min / Max calculation
  const values = sparklineData.map((d) => d.val);
  const minVal = values.length ? Math.min(...values).toFixed(3) : '0.000';
  const maxVal = values.length ? Math.max(...values).toFixed(3) : '0.000';

  // Styles per type
  const strokeColor =
    type === 'voltage' ? '#00f0ff' : type === 'current' ? '#3b82f6' : '#10b981';
  const glowColor =
    type === 'voltage'
      ? 'rgba(0, 240, 255, 0.2)'
      : type === 'current'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(16, 185, 129, 0.3)';

  const Icon = type === 'voltage' ? Gauge : type === 'current' ? Activity : Zap;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
        isProminent
          ? 'glass-panel-glow border-emerald-500/40 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-emerald-950/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]'
          : 'glass-panel glass-card-hover border-slate-800/80 bg-slate-900/60'
      }`}
    >
      {/* Background ambient light reflection */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border p-1.5"
            style={{
              borderColor: `${strokeColor}40`,
              backgroundColor: `${strokeColor}15`,
            }}
          >
            <Icon className="h-4 w-4" style={{ color: strokeColor }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </span>
        </div>

        {/* Status Pill */}
        <div
          className={`flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
            type === 'power'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-glow-emerald animate-pulse'
              : type === 'voltage'
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
          <span>{statusText}</span>
        </div>
      </div>

      {/* Main Metric Output Display */}
      <div className="my-2 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-2">
          <span
            className={`font-mono text-3xl font-black sm:text-4xl ${
              isProminent
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300 text-glow-emerald'
                : 'text-white'
            }`}
          >
            {value.toFixed(3)}
          </span>
          <span className="font-mono text-lg font-bold text-slate-400">{unit}</span>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center space-x-1 font-mono text-xs text-slate-400">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-amber-400" />}
          {trend === 'stable' && <Minus className="h-4 w-4 text-slate-500" />}
        </div>
      </div>

      {/* Sparkline Graph & Min/Max footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
          <div>MIN: <span className="text-slate-300">{minVal} {unit}</span></div>
          <div>MAX: <span className="text-slate-300">{maxVal} {unit}</span></div>
        </div>

        {/* Recharts Mini Sparkline */}
        <div className="h-10 w-28 sm:w-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line
                type="monotone"
                dataKey="val"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
