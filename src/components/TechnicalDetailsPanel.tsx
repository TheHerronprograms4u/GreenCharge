'use client';

import React, { useState } from 'react';
import { useEnergyData } from '@/context/EnergyDataContext';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Terminal,
  Code2,
  HardDrive,
  Network,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const TechnicalDetailsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { deviceInfo, lastControlSync, lastUpdatedTime, rawUartMessage } = useEnergyData();

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Header Button to Toggle Accordion */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-mono hover:bg-slate-800/30 transition-colors focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <span>TECHNICAL HARDWARE SPECIFICATIONS & SYSTEM ARCHITECTURE</span>
              <span className="text-[10px] text-slate-500 font-normal">[ENGINEERING INSTRUMENTATION]</span>
            </div>
            <div className="text-[11px] text-slate-500">
              ESP32-S3 SoC, INA219 I2C bus address, BQ25570 MPPT profile, firmware revision
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expandable Content Body */}
      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-800/60 font-mono text-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            
            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Device Identifier</div>
              <div className="font-bold text-white text-sm mt-0.5">{deviceInfo.deviceId}</div>
              <div className="text-[10px] text-emerald-400 mt-1">Unique Hardware UID</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Microcontroller SoC</div>
              <div className="font-bold text-cyan-300 text-sm mt-0.5">{deviceInfo.mcu}</div>
              <div className="text-[10px] text-slate-400 mt-1">Wi-Fi + BLE 5 (LE) Core</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">INA219 Sensor I2C Address</div>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">0x40 (I2C Bus 1)</div>
              <div className="text-[10px] text-slate-400 mt-1">400 kHz Fast-Mode I2C</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">BQ25570 PMIC Profile</div>
              <div className="font-bold text-amber-300 text-sm mt-0.5">{deviceInfo.mpptReference}</div>
              <div className="text-[10px] text-slate-400 mt-1">Cold-Start: {deviceInfo.coldStartVoltage}</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Firmware Revision</div>
              <div className="font-bold text-slate-200 text-sm mt-0.5">{deviceInfo.firmwareVersion}</div>
              <div className="text-[10px] text-slate-400 mt-1">GreenCharge RTOS Image</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Telemetry Update Interval</div>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">3,000 ms (3.0s)</div>
              <div className="text-[10px] text-slate-400 mt-1">Batch POST & WebSocket Stream</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Last DB Synchronization</div>
              <div className="font-bold text-white text-sm mt-0.5">
                {lastUpdatedTime ? lastUpdatedTime.toLocaleTimeString() : 'N/A'}
              </div>
              <div className="text-[10px] text-cyan-400 mt-1">Table: energy_readings</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Last Control Sync</div>
              <div className="font-bold text-white text-sm mt-0.5">
                {lastControlSync ? lastControlSync.toLocaleTimeString() : 'Awaiting sync'}
              </div>
              <div className="text-[10px] text-cyan-400 mt-1">Table: device_control</div>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Wi-Fi RSSI & IP</div>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">
                {deviceInfo.rssi} dBm ({deviceInfo.ipAddress})
              </div>
              <div className="text-[10px] text-slate-400 mt-1">WPA3-Personal Network</div>
            </div>

          </div>

          {/* Raw UART Data Packet Stream Inspector */}
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                <Terminal className="h-3.5 w-3.5" />
                <span>RAW ESP32-S3 SERIAL TELEMETRY STREAM</span>
              </span>
              <span className="text-slate-500">115200 BAUD</span>
            </div>
            <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-emerald-400 overflow-x-auto text-[11px] flex items-center justify-between">
              <span>{rawUartMessage}</span>
              <span className="text-slate-500 ml-2 text-[10px]">CRC-32: VALID</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
