'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Zap, Activity, Gauge, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { EnergyReading } from '@/types/energy';

export const LiveTelemetryCards: React.FC = () => {
  const { latestReading, previousReading, readingsHistory } = useEnergyData();

  const voltage = latestReading ? latestReading.voltage : null;
  const current = latestReading ? latestReading.current : null;
  const power = latestReading ? latestReading.power : null;

  const prevVoltage = previousReading ? previousReading.voltage : null;
  const prevCurrent = previousReading ? previousReading.current : null;
  const prevPower = previousReading ? previousReading.power : null;

  // Voltage delta & trend
  const voltageDiff = voltage !== null && prevVoltage !== null ? Number((voltage - prevVoltage).toFixed(3)) : 0;
  const voltageTrend = voltageDiff > 0.001 ? 'up' : voltageDiff < -0.001 ? 'down' : 'stable';

  // Current delta & trend
  const currentDiff = current !== null && prevCurrent !== null ? Number((current - prevCurrent).toFixed(3)) : 0;
  const currentTrend = currentDiff > 0.05 ? 'up' : currentDiff < -0.05 ? 'down' : 'stable';

  // Power delta & trend
  const powerDiff = power !== null && prevPower !== null ? Number((power - prevPower).toFixed(2)) : 0;
  const powerTrend = powerDiff > 0.01 ? 'up' : powerDiff < -0.01 ? 'down' : 'stable';
  const powerPct = prevPower && prevPower > 0 && power !== null ? Number(((powerDiff / prevPower) * 100).toFixed(1)) : 0;

  // Measurement status text
  const getVoltageStatus = () => {
    if (voltage === null) return 'No Telemetry';
    if (voltage >= 0.70 && voltage <= 0.88) return 'Optimal MPPT Point';
    if (voltage < 0.70) return 'Sub-threshold Bio-Cell';
    return 'Over-Potential Spike';
  };

  const getCurrentStatus = () => {
    if (current === null) return 'No Telemetry';
    if (current > 15) return 'High Harvesting Flow';
    if (current >= 5) return 'Active Harvester Rate';
    return 'Low Energy Flux';
  };

  const getPowerStatus = () => {
    if (power === null) return 'No Telemetry';
    if (power > 12) return 'Peak Generation';
    if (power >= 4) return 'Continuous Harvester';
    return 'Sub-Milliwatt Idle';
  };

  // Sparkline data
  const sparklineSlice = readingsHistory.slice(-24);
  const voltageSparkline = sparklineSlice.map((r) => ({ val: r.voltage }));
  const currentSparkline = sparklineSlice.map((r) => ({ val: r.current }));
  const powerSparkline = sparklineSlice.map((r) => ({ val: r.power }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* 1. VOLTAGE CARD */}
      <div className="glass-panel glass-card-hover relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-5 backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl" />

        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                VOLTAGE
              </span>
              <span className="block text-[10px] font-mono text-slate-500">INA219 Bus Potential</span>
            </div>
          </div>

          <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
            {getVoltageStatus()}
          </span>
        </div>

        {/* Primary Value */}
        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl font-black text-white">
              {voltage !== null ? voltage.toFixed(3) : '--.---'}
            </span>
            <span className="font-mono text-lg font-bold text-cyan-400">V</span>
          </div>

          {/* Trend Delta vs Previous */}
          <div className="text-right font-mono text-xs">
            <div className="flex items-center justify-end space-x-1">
              {voltageTrend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
              {voltageTrend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-amber-400" />}
              {voltageTrend === 'stable' && <Minus className="h-3.5 w-3.5 text-slate-500" />}
              <span
                className={
                  voltageTrend === 'up'
                    ? 'text-emerald-400 font-bold'
                    : voltageTrend === 'down'
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400'
                }
              >
                {voltageDiff > 0 ? `+${voltageDiff.toFixed(3)}` : voltageDiff.toFixed(3)} V
              </span>
            </div>
            <span className="text-[10px] text-slate-500">vs prev reading</span>
          </div>
        </div>

        {/* Footer Sparkline */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            <div>MIN: <span className="text-slate-300">{voltageSparkline.length ? Math.min(...voltageSparkline.map(d => d.val)).toFixed(3) : '0.000'} V</span></div>
            <div>MAX: <span className="text-slate-300">{voltageSparkline.length ? Math.max(...voltageSparkline.map(d => d.val)).toFixed(3) : '0.000'} V</span></div>
          </div>

          <div className="h-10 w-28 sm:w-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={voltageSparkline}>
                <YAxis domain={['auto', 'auto']} hide />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. CURRENT CARD */}
      <div className="glass-panel glass-card-hover relative overflow-hidden rounded-2xl border border-blue-500/30 bg-slate-900/70 p-5 backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                CURRENT
              </span>
              <span className="block text-[10px] font-mono text-slate-500">Shunt Current Flux</span>
            </div>
          </div>

          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-400 border border-blue-500/30">
            {getCurrentStatus()}
          </span>
        </div>

        {/* Primary Value */}
        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl font-black text-white">
              {current !== null ? current.toFixed(3) : '--.---'}
            </span>
            <span className="font-mono text-lg font-bold text-blue-400">mA</span>
          </div>

          {/* Trend Delta vs Previous */}
          <div className="text-right font-mono text-xs">
            <div className="flex items-center justify-end space-x-1">
              {currentTrend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
              {currentTrend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-amber-400" />}
              {currentTrend === 'stable' && <Minus className="h-3.5 w-3.5 text-slate-500" />}
              <span
                className={
                  currentTrend === 'up'
                    ? 'text-emerald-400 font-bold'
                    : currentTrend === 'down'
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400'
                }
              >
                {currentDiff > 0 ? `+${currentDiff.toFixed(3)}` : currentDiff.toFixed(3)} mA
              </span>
            </div>
            <span className="text-[10px] text-slate-500">vs prev reading</span>
          </div>
        </div>

        {/* Footer Sparkline */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            <div>MIN: <span className="text-slate-300">{currentSparkline.length ? Math.min(...currentSparkline.map(d => d.val)).toFixed(3) : '0.000'} mA</span></div>
            <div>MAX: <span className="text-slate-300">{currentSparkline.length ? Math.max(...currentSparkline.map(d => d.val)).toFixed(3) : '0.000'} mA</span></div>
          </div>

          <div className="h-10 w-28 sm:w-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentSparkline}>
                <YAxis domain={['auto', 'auto']} hide />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. POWER CARD */}
      <div className="glass-panel glass-card-hover relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-emerald-950/20 p-5 backdrop-blur-xl shadow-[0_0_25px_-5px_rgba(16,185,129,0.18)]">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl" />

        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
                POWER
              </span>
              <span className="block text-[10px] font-mono text-slate-400">P = V × I Output</span>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40 animate-pulse">
            {getPowerStatus()}
          </span>
        </div>

        {/* Primary Value */}
        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300 text-glow-emerald">
              {power !== null ? power.toFixed(2) : '--.--'}
            </span>
            <span className="font-mono text-lg font-bold text-emerald-400">mW</span>
          </div>

          {/* Trend Delta vs Previous */}
          <div className="text-right font-mono text-xs">
            <div className="flex items-center justify-end space-x-1">
              {powerTrend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
              {powerTrend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-amber-400" />}
              {powerTrend === 'stable' && <Minus className="h-3.5 w-3.5 text-slate-500" />}
              <span
                className={
                  powerTrend === 'up'
                    ? 'text-emerald-400 font-bold'
                    : powerTrend === 'down'
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400'
                }
              >
                {powerDiff > 0 ? `+${powerDiff.toFixed(2)}` : powerDiff.toFixed(2)} mW
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {powerPct !== 0 ? `(${powerPct > 0 ? `+${powerPct}%` : `${powerPct}%`}) vs prev` : 'vs prev reading'}
            </span>
          </div>
        </div>

        {/* Footer Sparkline */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            <div>MIN: <span className="text-slate-300">{powerSparkline.length ? Math.min(...powerSparkline.map(d => d.val)).toFixed(2) : '0.00'} mW</span></div>
            <div>MAX: <span className="text-slate-300">{powerSparkline.length ? Math.max(...powerSparkline.map(d => d.val)).toFixed(2) : '0.00'} mW</span></div>
          </div>

          <div className="h-10 w-28 sm:w-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerSparkline}>
                <YAxis domain={['auto', 'auto']} hide />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};
