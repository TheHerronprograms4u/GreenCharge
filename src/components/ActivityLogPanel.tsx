'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  FileText,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  WifiOff,
  Search,
  Trash2,
  Download,
} from 'lucide-react';
import { ActivityEvent } from '@/types/energy';

export const ActivityLogPanel: React.FC = () => {
  const { activityLogs, clearActivityLogs } = useEnergyData();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getLogIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-cyan-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-400" />;
    }
  };

  const getLogBadge = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'info':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'error':
      case 'offline':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        log.timestamp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportLogsCsv = () => {
    const headers = ['Timestamp', 'Type', 'Title', 'Message', 'Device ID'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.type,
      `"${l.title}"`,
      `"${l.message}"`,
      l.deviceId,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dagitab_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">SYSTEM ACTIVITY LOG & AUDIT TRAIL</h3>
            <p className="text-xs text-slate-400 font-mono">Telemetry Events & Hardware State Transitions</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogsCsv}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={clearActivityLogs}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-mono font-bold text-red-400 border border-slate-800 hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-1.5 pl-9 pr-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'info', 'success', 'warning', 'offline'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-lg px-2.5 py-1 uppercase transition-all border ${
                filterType === type
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Event Timeline List */}
      <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center font-mono text-slate-500 text-xs">
            No activity records match your filter query.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getLogIcon(log.type)}</div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{log.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-mono uppercase font-bold border ${getLogBadge(
                        log.type
                      )}`}
                    >
                      {log.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">{log.message}</p>
                </div>
              </div>

              <div className="text-right font-mono text-[10px] text-slate-500 space-y-1">
                <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                <div className="text-slate-600">{log.deviceId}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
