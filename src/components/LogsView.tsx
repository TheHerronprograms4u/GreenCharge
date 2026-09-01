'use client';

import React from 'react';
import { ActivityLogPanel } from './ActivityLogPanel';
import { FileText } from 'lucide-react';

export const LogsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold mb-2">
          <FileText className="h-4 w-4" />
          <span>AUDIT TRAIL & SYSTEM LOGS</span>
        </div>
        <h1 className="text-3xl font-black text-white">System Activity & Security Log</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Historical telemetry records, BQ25570 remote load transitions, and database synchronization heartbeats
        </p>
      </div>

      <ActivityLogPanel />
    </div>
  );
};
