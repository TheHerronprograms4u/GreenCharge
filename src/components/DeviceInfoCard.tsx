'use client';

import React from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import { Cpu, Wifi, Server, Radio, ShieldCheck, Clock, Network, Zap, Sparkles } from 'lucide-react';

export const DeviceInfoCard: React.FC = () => {
  const { deviceInfo } = useEnergyData();

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              HARDWARE SPECIFICATIONS
            </h3>
            <p className="text-xs text-slate-400 font-mono">Microcontroller & Harvester Node</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Device UID</div>
          <div className="font-bold text-white text-sm">{deviceInfo.deviceId}</div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Microcontroller SoC</div>
          <div className="font-bold text-cyan-300 text-sm">{deviceInfo.mcu}</div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Energy Harvester PMIC</div>
          <div className="font-bold text-emerald-400">{deviceInfo.pmic}</div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Telemetry Sensor</div>
          <div className="font-bold text-slate-200">{deviceInfo.sensor}</div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Bio-Energy Source</div>
          <div className="font-bold text-emerald-300">{deviceInfo.energySource}</div>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
          <div className="text-slate-500 text-[10px] uppercase mb-1">Storage Buffer</div>
          <div className="font-bold text-slate-200">{deviceInfo.storageType}</div>
        </div>
      </div>

      {/* Wi-Fi RSSI Signal Bar */}
      <div className="rounded-xl bg-slate-950/90 p-4 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="flex items-center space-x-2 text-slate-300">
            <Wifi className="h-4 w-4 text-emerald-400" />
            <span>Wi-Fi Signal Strength (RSSI):</span>
          </span>
          <span className="font-bold text-emerald-400">{deviceInfo.rssi} dBm (Excellent Signal)</span>
        </div>

        {/* Signal Bars Visualizer */}
        <div className="flex items-center space-x-1.5 h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div className="h-full w-1/4 bg-emerald-500 rounded-full"></div>
          <div className="h-full w-1/4 bg-emerald-500 rounded-full"></div>
          <div className="h-full w-1/4 bg-emerald-500 rounded-full"></div>
          <div className="h-full w-1/4 bg-emerald-500/40 rounded-full"></div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
          <div>IP: <span className="text-white font-bold">{deviceInfo.ipAddress}</span></div>
          <div>FIRMWARE: <span className="text-cyan-400 font-bold">{deviceInfo.firmwareVersion}</span></div>
          <div>UPTIME: <span className="text-emerald-400">{formatUptime(deviceInfo.uptimeSeconds)}</span></div>
        </div>
      </div>
    </div>
  );
};
