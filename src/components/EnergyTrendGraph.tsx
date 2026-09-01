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
  ReferenceDot,
} from 'recharts';
import { Zap, Gauge, Activity, Clock, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { EnergyReading, TimeWindow, MetricDisplayMode } from '@/types/energy';

export const EnergyTrendGraph: React.FC = () => {
  const { readingsHistory, connectionState, refreshData } = useEnergyData();
  const [selectedMetric, setSelectedMetric] = useState<MetricDisplayMode>('power');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('LIVE');

  const isOnline = connectionState === 'ONLINE';

  // Filter history based on time window
  const getFilteredData = () => {
    if (!readingsHistory || readingsHistory.length === 0) return [];

    const now = Date.now();
    let durationMs = 5 * 60 * 1000; // LIVE default: ~5 mins of recent stream

    switch (timeWindow) {
      case 'LIVE':
        durationMs = 5 * 60 * 1000;
        break;
      case '1H':
        durationMs = 60 * 60 * 1000;
        break;
      case '6H':
        durationMs = 6 * 60 * 60 * 1000;
        break;
      case '24H':
        durationMs = 24 * 60 * 60 * 1000;
        break;
      case '7D':
        durationMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30D':
        durationMs = 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const cutoff = now - durationMs;
    const filtered = readingsHistory.filter((item) => new Date(item.created_at).getTime() >= cutoff);

    // Fallback if sparse data
    return filtered.length > 0 ? filtered : readingsHistory.slice(-35);
  };

  const filteredHistory = getFilteredData();

  const chartData = filteredHistory.map((item) => {
    const d = new Date(item.created_at);
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      fullTimestamp: d.toLocaleString(),
      power: item.power,
      voltage: item.voltage,
      current: item.current,
      activeValue:
        selectedMetric === 'power'
          ? item.power
          : selectedMetric === 'voltage'
          ? item.voltage
          : item.current,
    };
  });

  const latestItem = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  // Metric styling
  const metricConfigs = {
    power: {
      label: 'Harvested Power',
      unit: ' mW',
      color: '#10b981',
      gradientId: 'powerTrendGradient',
      icon: Zap,
    },
    voltage: {
      label: 'Cell Voltage',
      unit: ' V',
      color: '#06b6d4',
      gradientId: 'voltageTrendGradient',
      icon: Gauge,
    },
    current: {
      label: 'Harvest Current',
      unit: ' mA',
      color: '#3b82f6',
      gradientId: 'currentTrendGradient',
      icon: Activity,
    },
  };

  const activeConfig = metricConfigs[selectedMetric];
  const ActiveIcon = activeConfig.icon;

  // Aggregate statistics for the current filtered window
  const activeValues = chartData.map((d) => d.activeValue);
  const avgVal = activeValues.length
    ? (activeValues.reduce((a, b) => a + b, 0) / activeValues.length).toFixed(selectedMetric === 'power' ? 2 : 3)
    : '0.000';
  const peakVal = activeValues.length
    ? Math.max(...activeValues).toFixed(selectedMetric === 'power' ? 2 : 3)
    : '0.000';
  const minVal = activeValues.length
    ? Math.min(...activeValues).toFixed(selectedMetric === 'power' ? 2 : 3)
    : '0.000';

  return (
    <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-5 shadow-2xl">
      
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        
        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 mr-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border p-1.5"
              style={{
                borderColor: `${activeConfig.color}40`,
                backgroundColor: `${activeConfig.color}15`,
                color: activeConfig.color,
              }}
            >
              <ActiveIcon className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black text-white tracking-wide">
              HISTORICAL TELEMETRY TREND
            </h3>
          </div>

          <div className="flex items-center space-x-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
            {(['power', 'voltage', 'current'] as MetricDisplayMode[]).map((metric) => {
              const isSelected = selectedMetric === metric;
              const config = metricConfigs[metric];
              return (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`rounded-lg px-3 py-1 font-mono text-xs font-bold uppercase transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  style={isSelected ? { color: config.color } : {}}
                >
                  {metric} ({metric === 'power' ? 'mW' : metric === 'voltage' ? 'V' : 'mA'})
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center space-x-1 rounded-xl bg-slate-950 p-1 border border-slate-800 overflow-x-auto">
          {(['LIVE', '1H', '6H', '24H', '7D', '30D'] as TimeWindow[]).map((window) => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                timeWindow === window
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="h-80 w-full relative">
        {chartData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500 font-mono space-y-2">
            {!isOnline ? (
              <>
                <AlertCircle className="h-8 w-8 text-rose-500" />
                <p className="text-sm text-slate-400">Device Offline — No recent data in selected time window</p>
              </>
            ) : (
              <>
                <Clock className="h-8 w-8 animate-spin text-slate-600" />
                <p className="text-sm text-slate-400">Waiting for telemetry from energy_readings...</p>
              </>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="powerTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="voltageTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="currentTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                unit={activeConfig.unit}
                domain={['auto', 'auto']}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700/80 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-xl font-mono">
                        <div className="text-[11px] text-slate-400 mb-2 border-b border-slate-800 pb-1">
                          TIMESTAMP: <span className="text-white font-semibold">{data.fullTimestamp}</span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div
                            className="flex items-center justify-between font-bold"
                            style={{ color: activeConfig.color }}
                          >
                            <span>{activeConfig.label}:</span>
                            <span className="text-sm font-black">
                              {data.activeValue.toFixed(selectedMetric === 'power' ? 2 : 3)}
                              {activeConfig.unit}
                            </span>
                          </div>

                          <div className="pt-1.5 border-t border-slate-800/80 space-y-0.5 text-[11px] text-slate-400">
                            <div className="flex items-center justify-between">
                              <span>Power:</span>
                              <span className="text-emerald-400 font-semibold">{data.power.toFixed(2)} mW</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Voltage:</span>
                              <span className="text-cyan-400 font-semibold">{data.voltage.toFixed(3)} V</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Current:</span>
                              <span className="text-blue-400 font-semibold">{data.current.toFixed(3)} mA</span>
                            </div>
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
                dataKey="activeValue"
                stroke={activeConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${activeConfig.gradientId})`}
                isAnimationActive={false}
              />

              {latestItem && (
                <ReferenceDot
                  x={latestItem.time}
                  y={latestItem.activeValue}
                  r={5}
                  fill={activeConfig.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Aggregate Statistics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">WINDOW AVERAGE</div>
          <div className="text-base font-bold text-white mt-0.5">
            {avgVal} {activeConfig.unit}
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">WINDOW PEAK</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">
            {peakVal} {activeConfig.unit}
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">WINDOW MINIMUM</div>
          <div className="text-base font-bold text-slate-300 mt-0.5">
            {minVal} {activeConfig.unit}
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase">SAMPLES RENDERED</div>
          <div className="text-base font-bold text-cyan-400 mt-0.5">
            {chartData.length} records
          </div>
        </div>
      </div>

    </div>
  );
};
