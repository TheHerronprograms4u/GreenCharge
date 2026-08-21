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
  ShieldCheck,
} from 'lucide-react';

export const DeviceView: React.FC = () => {
  const { deviceInfo, connectionState, rawUartMessage, simulateIncomingData } = useEnergyData();
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM INIT] ESP8266 NodeMCU v1.4.2 Booting...',
    '[WIFI STATUS] Connected to DAGITAB_AP (RSSI: -52 dBm)',
    '[UART INIT] SoftwareSerial RX:D1, TX:D2 @ 9600 Baud',
    '[SENSOR CONNECTED] MAX471 Current & Voltage Sensor initialized',
    '[SUPABASE REALTIME] Connected to WSS wss://supabase.co/realtime/v1',
    `[UART RX] ${rawUartMessage}`,
  ]);

  const triggerTestPulse = () => {
    simulateIncomingData();
    setTerminalLogs((prev) => [
      ...prev,
      `[UART RX] ${rawUartMessage}`,
      `[SUPABASE POST] 200 OK (Device: ${deviceInfo.deviceId})`,
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
              <span>HARDWARE DIAGNOSTICS & SYSTEM ARCHITECTURE</span>
            </div>
            <h1 className="text-3xl font-black text-white">Device & Gateway Control</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Arduino UNO + MAX471 + ESP8266 Hardware Node Status: <span className="text-emerald-400 font-bold">{deviceInfo.deviceId}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={triggerTestPulse}
              className="flex items-center space-x-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>TRIGGER UART PULSE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Architecture Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stage 1: Sensor & Controller */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Sensor Stage</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              OK
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>SENSOR MODULE: <span className="text-white font-bold">{deviceInfo.sensor}</span></div>
            <div>CONTROLLER: <span className="text-cyan-300 font-bold">{deviceInfo.sensorController}</span></div>
            <div>VOLTAGE PIN: <span className="text-slate-400">Analog Pin A0 (0 - 25V)</span></div>
            <div>CURRENT PIN: <span className="text-slate-400">Analog Pin A1 (0 - 3A)</span></div>
            <div>SHUNT RESISTOR: <span className="text-slate-400">35 mΩ Onboard Shunt</span></div>
          </div>
        </div>

        {/* Stage 2: Gateway */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">IoT Gateway</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              OK
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>GATEWAY CHIP: <span className="text-white font-bold">{deviceInfo.gateway}</span></div>
            <div>COMMUNICATION: <span className="text-cyan-300 font-bold">{deviceInfo.communication}</span></div>
            <div>RX/TX PINS: <span className="text-slate-400">SoftwareSerial D1/D2</span></div>
            <div>FIRMWARE: <span className="text-emerald-400 font-bold">{deviceInfo.firmwareVersion}</span></div>
            <div>IP CONFIG: <span className="text-slate-400">{deviceInfo.ipAddress}</span></div>
          </div>
        </div>

        {/* Stage 3: Network & Cloud */}
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Wi-Fi & Cloud</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              OK
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>NETWORK: <span className="text-white font-bold">{deviceInfo.network}</span></div>
            <div>RSSI SIGNAL: <span className="text-emerald-400 font-bold">{deviceInfo.rssi} dBm</span></div>
            <div>CLOUD DB: <span className="text-cyan-300 font-bold">{deviceInfo.cloudBackend}</span></div>
            <div>TABLE: <span className="text-slate-400">energy_readings</span></div>
            <div>SECURITY: <span className="text-emerald-400">RLS Policies Enabled</span></div>
          </div>
        </div>
      </div>

      {/* Hardware Pinout Schematic Diagram */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-4">
        <h3 className="text-base font-black text-white flex items-center space-x-2">
          <Code className="h-5 w-5 text-cyan-400" />
          <span>ARDUINO UNO ➔ ESP8266 HARDWARE WIRING SCHEMATIC</span>
        </h3>
        
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 leading-relaxed whitespace-pre">
{`┌────────────────────────────────┐         ┌────────────────────────────────┐
│          ARDUINO UNO           │         │         MAX471 SENSOR          │
│                                │         │                                │
│   Analog Pin A0  ──────────────┼─────────┤ RS+ / RS- (Voltage Sense)      │
│   Analog Pin A1  ──────────────┼─────────┤ OUT (Current Sense)            │
│   5V / GND       ──────────────┼─────────┤ VCC / GND                      │
│                                │         └────────────────────────────────┘
│   Digital Pin 3 (TX) ──────────┼───────┐
│   Digital Pin 2 (RX) ──────────┼────┐  │
└────────────────────────────────┘    │  │ 9600 Baud UART
                                      │  │ DATA,Voltage,Current,Power
                                      ▼  ▼
                           ┌────────────────────────────────┐
                           │      ESP8266 NODEMCU ESP-12E   │
                           │                                │
                           │   D1 (SoftwareSerial RX)       │
                           │   D2 (SoftwareSerial TX)       │
                           │                                │
                           │   Wi-Fi 802.11 b/g/n (2.4GHz)   │
                           │   HTTP / WSS POST to Supabase  │
                           └────────────────────────────────┘`}
          </div>
        </div>
      </div>

      {/* Live Serial UART Console Inspector */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">LIVE UART SERIAL TERMINAL CONSOLE</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">COM3 @ 9600 BAUD</span>
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
