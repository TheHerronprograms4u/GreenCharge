'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEnergyData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        const Icon = isSuccess
          ? CheckCircle2
          : isError
          ? XCircle
          : isWarning
          ? AlertCircle
          : Info;

        const borderClass = isSuccess
          ? 'border-emerald-500/40 bg-slate-950/95 text-emerald-400'
          : isError
          ? 'border-rose-500/50 bg-slate-950/95 text-rose-400'
          : isWarning
          ? 'border-amber-500/40 bg-slate-950/95 text-amber-400'
          : 'border-cyan-500/40 bg-slate-950/95 text-cyan-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between rounded-xl border p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="font-mono text-xs font-bold text-white tracking-wide">{toast.title}</h5>
                <p className="font-mono text-[11px] text-slate-300 leading-snug">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors ml-2 p-1"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
