'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  Cpu,
  Radio,
  Wifi,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Code,
  Sparkles,
} from 'lucide-react';
import { HardwarePipelineHealth } from './HardwarePipelineHealth';
import { DeviceInfoCard } from './DeviceInfoCard';

export const DeviceView: React.FC = () => {
  const { deviceInfo, connectionState, rawUartMessage, simulateIncomingData, loadEnabled } = useEnergyData();
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[BOOT] ESP32-S3 Dual-Core Xtensa LX7 initialized @ 240MHz',
    '[I2C BUS 1] INA219 current/voltage monitor detected at 0x40',
    '[PMIC INIT] TI BQ25570 boost converter & MPPT 80% reference active',
    '[WIFI SEC] Connected to 802.11 b/g/n (RSSI: -58 dBm)',
    '[SUPABASE REALTIME] Subscribed to energy_readings & device_control',
    `[UART RX] ${rawUartMessage}`,
  ]);

  const triggerTestPulse = () => {
    simulateIncomingData();
    setTerminalLogs((prev) => [
      ...prev,
      `[UART RX] ${rawUartMessage}`,
      `[SUPABASE POST] 201 Created (device_id: ${deviceInfo.deviceId})`,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Device View Header */}
      <div className="glass-panel relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold mb-2">
              <Cpu className="h-4 w-4" />
              <span>HARDWARE DIAGNOSTICS & BIOCHEMICAL HARVESTING TOPOLOGY</span>
            </div>
            <h1 className="text-3xl font-black text-white">Device & Hardware Architecture</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              ESP32-S3 + INA219 + TI BQ25570 Harvester Node: <span className="text-emerald-400 font-bold">{deviceInfo.deviceId}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={triggerTestPulse}
              className="flex items-center space-x-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>DISPATCH TEST TELEMETRY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Architecture Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Stage 1: MFC & Sensor */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">MFC & Sensor Stage</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              OK
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>BIO-SOURCE: <span className="text-white font-bold">{deviceInfo.energySource}</span></div>
            <div>SENSOR IC: <span className="text-cyan-300 font-bold">{deviceInfo.sensor}</span></div>
            <div>BUS ADDRESS: <span className="text-slate-400">0x40 (I2C Fast Mode)</span></div>
            <div>SHUNT: <span className="text-slate-400">0.100 Ω High-Side Resistor</span></div>
            <div>MAX V/I RANGE: <span className="text-slate-400">0–32V / 0–3.2A</span></div>
          </div>
        </div>

        {/* Stage 2: Harvester PMIC */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">BQ25570 PMIC Stage</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              OK
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>PMIC IC: <span className="text-white font-bold">{deviceInfo.pmic}</span></div>
            <div>MPPT TRACKING: <span className="text-cyan-300 font-bold">80% VOC Reference</span></div>
            <div>COLD-START: <span className="text-amber-400 font-bold">VIN_CS = 330 mV</span></div>
            <div>STORAGE BUFFER: <span className="text-slate-400">{deviceInfo.storageType}</span></div>
            <div>BUCK LOAD RAIL: <span className={loadEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>{loadEnabled ? 'ENABLED (ON)' : 'GATED (OFF)'}</span></div>
          </div>
        </div>

        {/* Stage 3: ESP32-S3 SoC & Cloud */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">SoC & Cloud Gateway</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              OK
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>CONTROLLER: <span className="text-white font-bold">{deviceInfo.mcu}</span></div>
            <div>NETWORK: <span className="text-emerald-400 font-bold">{deviceInfo.network} ({deviceInfo.rssi} dBm)</span></div>
            <div>IP CONFIG: <span className="text-slate-400">{deviceInfo.ipAddress}</span></div>
            <div>FIRMWARE: <span className="text-cyan-400 font-bold">{deviceInfo.firmwareVersion}</span></div>
            <div>CLOUD DB: <span className="text-emerald-400">{deviceInfo.cloudBackend}</span></div>
          </div>
        </div>

      </div>

      {/* End-to-End Pipeline Health Monitor */}
      <HardwarePipelineHealth />

      {/* Detailed Technical Device Specifications & Wi-Fi */}
      <DeviceInfoCard />

      {/* Hardware Schematic Diagram */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-4">
        <h3 className="text-base font-black text-white flex items-center space-x-2">
          <Code className="h-5 w-5 text-cyan-400" />
          <span>ESP32-S3 + INA219 + TI BQ25570 MICROBIAL FUEL CELL SCHEMATIC</span>
        </h3>

        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs overflow-x-auto">
          <div className="text-slate-300 leading-relaxed whitespace-pre">
{`┌────────────────────────────────┐         ┌────────────────────────────────┐
│   MICROBIAL FUEL CELL (MFC)    │         │      INA219 POWER MONITOR      │
│   (Soil / Sediment Bioreactor) │         │                                │
│                                │         │   VIN+ / VIN- (Shunt Monitor)  │
│   Anode (-) ───────────────────┼─────────┤   GND                          │
│   Cathode (+) ─────────────────┼─────────┤   SDA / SCL (I2C Bus @ 0x40)   │
└────────────────┬───────────────┘         └───────────────┬────────────────┘
                 │                                         │
                 ▼                                         ▼
┌────────────────────────────────┐         ┌────────────────────────────────┐
│      TI BQ25570 PMIC           │         │     ESP32-S3 DUAL-CORE SOC     │
│   (Ultra-Low-Power Harvester)  │         │                                │
│                                │         │   GPIO 8 (SDA) ────────────────┤
│   VIN_DC (MFC Boost Input)     │         │   GPIO 9 (SCL) ────────────────┤
│   VBAT (Supercap Rail ~3.3V)   │         │   GPIO 4 (VOUT_EN Gate Ctrl) ──┤
│   VOUT_EN (Gated Buck Enable)  │◄────────┤   Wi-Fi 802.11 b/g/n           │
│   VOUT (Switched System Load)  │         │   Supabase Realtime WSS Ingest │
└────────────────────────────────┘         └────────────────────────────────┘`}
          </div>
        </div>
      </div>

      {/* Live Serial UART Console Inspector */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">LIVE UART / SERIAL LOG CONSOLE</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">ESP32-S3 COM4 @ 115200 BAUD</span>
        </div>

        <div className="h-48 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 space-y-1 border border-slate-800">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="leading-tight">
              <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
