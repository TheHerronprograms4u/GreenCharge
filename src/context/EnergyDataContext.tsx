'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EnergyReading,
  ConnectionState,
  PipelineStage,
  SystemHealthState,
  ActivityEvent,
  DeviceInfo,
} from '@/types/energy';
import { getSupabaseClient, fetchLatestReadings, insertEnergyReading } from '@/lib/supabase';
import { telemetrySimulator } from '@/lib/telemetrySimulator';

interface EnergyDataContextType {
  deviceId: string;
  setDeviceId: (id: string) => void;
  connectionState: ConnectionState;
  freshnessTimeoutSec: number;
  setFreshnessTimeoutSec: (sec: number) => void;
  lastUpdatedTime: Date | null;
  secondsSinceLastUpdate: number;
  latestReading: EnergyReading | null;
  readingsHistory: EnergyReading[];
  pipelineStages: PipelineStage[];
  systemHealth: SystemHealthState;
  activityLogs: ActivityEvent[];
  deviceInfo: DeviceInfo;
  rawUartMessage: string;
  isSimulatorActive: boolean;
  setIsSimulatorActive: (active: boolean) => void;
  isSupabaseConfigured: boolean;
  supabaseStatus: 'CONNECTED' | 'DISCONNECTED' | 'UNCONFIGURED';
  refreshData: () => Promise<void>;
  simulateIncomingData: () => void;
  triggerOfflineState: () => void;
  clearActivityLogs: () => void;
  addActivityLog: (type: ActivityEvent['type'], title: string, message: string) => void;
}

const EnergyDataContext = createContext<EnergyDataContextType | undefined>(undefined);

export const EnergyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string>('GREENCHARGE-001');
  const [freshnessTimeoutSec, setFreshnessTimeoutSec] = useState<number>(5);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('INITIALIZING');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState<number>(0);
  const [latestReading, setLatestReading] = useState<EnergyReading | null>(null);
  const [readingsHistory, setReadingsHistory] = useState<EnergyReading[]>([]);
  const [rawUartMessage, setRawUartMessage] = useState<string>('DATA,0.000,0.000,0.000');
  const [supabaseStatus, setSupabaseStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'UNCONFIGURED'>('UNCONFIGURED');

  // Logs
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'info',
      title: 'Dashboard Initialized',
      message: 'DAGITAB Cloud Monitoring System initialized.',
      deviceId: 'GREENCHARGE-001',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      type: 'success',
      title: 'UART Gateway Synced',
      message: 'ESP8266 NodeMCU established communication pipeline with Arduino UNO.',
      deviceId: 'GREENCHARGE-001',
    },
  ]);

  // Hardware Pipeline
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    {
      id: 'sensor',
      name: 'MAX471 Energy Sensor',
      tech: 'Analog Sensor',
      status: 'ONLINE',
      latencyMs: 2,
      details: 'Measuring current & voltage across shunt resistor',
      lastVerified: 'Just now',
    },
    {
      id: 'arduino',
      name: 'Arduino UNO',
      tech: 'ATmega328P',
      status: 'ONLINE',
      latencyMs: 12,
      details: 'Processing ADC voltage/current readings & formatting UART string',
      lastVerified: 'Just now',
    },
    {
      id: 'esp8266',
      name: 'ESP8266 NodeMCU',
      tech: 'ESP-12E Gateway',
      status: 'ONLINE',
      latencyMs: 45,
      details: 'Receiving UART telemetry & batching HTTP/WSS requests',
      lastVerified: 'Just now',
    },
    {
      id: 'wifi',
      name: 'Wi-Fi Network',
      tech: '802.11 b/g/n (2.4GHz)',
      status: 'ONLINE',
      latencyMs: 18,
      details: 'Signal: -52 dBm (Excellent Signal)',
      lastVerified: 'Just now',
    },
    {
      id: 'supabase',
      name: 'Supabase Cloud DB',
      tech: 'PostgreSQL + Realtime',
      status: 'ONLINE',
      latencyMs: 65,
      details: 'Table: energy_readings (Row Level Security Active)',
      lastVerified: 'Just now',
    },
    {
      id: 'dashboard',
      name: 'DAGITAB Dashboard',
      tech: 'Next.js App Engine',
      status: 'ONLINE',
      latencyMs: 4,
      details: 'Live WebSocket subscription active & metrics rendered',
      lastVerified: 'Just now',
    },
  ]);

  // Device Info
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceId: 'GREENCHARGE-001',
    gateway: 'ESP8266 NodeMCU ESP-12E',
    sensorController: 'Arduino UNO (ATmega328P)',
    sensor: 'MAX471 High-Side Current & Voltage Sensor',
    communication: 'UART Serial @ 9600 Baud',
    network: 'Wi-Fi 802.11 b/g/n',
    cloudBackend: 'Supabase Database',
    ipAddress: '192.168.1.142',
    rssi: -52,
    firmwareVersion: 'v1.4.2-release',
    uptimeSeconds: 14820,
    lastSeen: new Date().toISOString(),
  });

  const addActivityLog = useCallback((type: ActivityEvent['type'], title: string, message: string) => {
    const newLog: ActivityEvent = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      message,
      deviceId,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, [deviceId]);

  // Process incoming reading
  const processIncomingReading = useCallback(
    (reading: EnergyReading, uartString?: string) => {
      const now = new Date();
      setLatestReading(reading);
      setLastUpdatedTime(now);
      setSecondsSinceLastUpdate(0);
      setConnectionState('ONLINE');

      if (uartString) {
        setRawUartMessage(uartString);
      } else {
        setRawUartMessage(`DATA,${reading.voltage.toFixed(3)},${reading.current.toFixed(3)},${reading.power.toFixed(3)}`);
      }

      setReadingsHistory((prev) => {
        const updated = [...prev, reading];
        // Keep max 200 items in memory
        return updated.slice(-200);
      });

      // Update pipeline stage verification
      setPipelineStages((prev) =>
        prev.map((stage) => ({
          ...stage,
          status: 'ONLINE',
          lastVerified: 'Just now',
        }))
      );

      setDeviceInfo((prev) => ({
        ...prev,
        lastSeen: now.toISOString(),
        uptimeSeconds: prev.uptimeSeconds + 3,
      }));
    },
    []
  );

  // Initialize with seed data only if no readings received yet
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const initialData = telemetrySimulator.generateInitialHistory(deviceId, 30);
      setReadingsHistory(initialData);
      if (initialData.length > 0) {
        const latest = initialData[initialData.length - 1];
        setLatestReading(latest);
        setLastUpdatedTime(new Date(latest.created_at));
        setConnectionState('ONLINE');
      }
    }
  }, [deviceId]);

  // Freshness & Heartbeat Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdatedTime) {
        const diffSec = Math.floor((Date.now() - lastUpdatedTime.getTime()) / 1000);
        setSecondsSinceLastUpdate(diffSec);

        // Check if offline threshold exceeded
        if (diffSec >= freshnessTimeoutSec && connectionState === 'ONLINE') {
          setConnectionState('OFFLINE');
          addActivityLog(
            'offline',
            'Device Offline Timeout',
            `No Telemetry received for >${freshnessTimeoutSec} seconds. Marking device DAGITAB-001 as OFFLINE.`
          );

          // Update pipeline stages to indicate error
          setPipelineStages((prev) =>
            prev.map((stage) =>
              stage.id === 'sensor' || stage.id === 'arduino' || stage.id === 'esp8266'
                ? { ...stage, status: 'ERROR', details: 'Telemetry stream interrupted' }
                : stage
            )
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdatedTime, freshnessTimeoutSec, connectionState, addActivityLog]);

  // Live Local UI Simulator Loop (Only updates UI when manually enabled in settings/navbar)
  useEffect(() => {
    if (!isSimulatorActive) return;

    const simInterval = setInterval(() => {
      const { reading, rawUart } = telemetrySimulator.generateReading(deviceId);
      processIncomingReading(reading, rawUart);
    }, 3000);

    return () => clearInterval(simInterval);
  }, [isSimulatorActive, deviceId, processIncomingReading]);

  // Supabase Realtime Listener
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSupabaseStatus('UNCONFIGURED');
      return;
    }

    setSupabaseStatus('CONNECTED');

    // Fetch initial historical records from Supabase
    fetchLatestReadings(deviceId, 50).then((data) => {
      if (data && data.length > 0) {
        setReadingsHistory(data);
        const newest = data[data.length - 1];
        if (newest.device_id) {
          setDeviceId(newest.device_id);
        }
        processIncomingReading(newest);
        addActivityLog('success', 'Supabase Synced', `Loaded ${data.length} historical readings from database (Device: ${newest.device_id || 'Node'}).`);
      }
    });

    // Subscribe to changes on energy_readings table
    const channel = supabase
      .channel('public:energy_readings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'energy_readings' },
        (payload) => {
          const newReading = payload.new as EnergyReading;
          if (newReading) {
            if (newReading.device_id && newReading.device_id !== deviceId) {
              setDeviceId(newReading.device_id);
            }
            processIncomingReading(newReading);
            addActivityLog(
              'info',
              'Realtime Data Received',
              `Live payload from ${newReading.device_id || 'Hardware Node'}: V=${newReading.voltage}V, I=${newReading.current}A, P=${newReading.power}W`
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSupabaseStatus('CONNECTED');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSupabaseStatus('DISCONNECTED');
          addActivityLog('warning', 'Supabase Disconnected', 'Realtime WebSocket stream encountered an error.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, processIncomingReading, addActivityLog]);

  const refreshData = async () => {
    const data = await fetchLatestReadings(deviceId, 50);
    if (data && data.length > 0) {
      setReadingsHistory(data);
      processIncomingReading(data[data.length - 1]);
    }
  };

  const simulateIncomingData = () => {
    const { reading, rawUart } = telemetrySimulator.generateReading(deviceId);
    processIncomingReading(reading, rawUart);
    addActivityLog('success', 'Manual Telemetry Triggered', `Sample telemetry injected: ${rawUart}`);
  };

  const triggerOfflineState = () => {
    setConnectionState('OFFLINE');
    setSecondsSinceLastUpdate(15);
    addActivityLog('warning', 'Simulated Disconnect', 'User manually triggered offline hardware state for testing.');
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
  };

  const systemHealth: SystemHealthState = {
    deviceStatus: connectionState,
    sensorStatus: connectionState === 'ONLINE' ? 'CONNECTED' : 'NO DATA',
    wifiStatus: connectionState === 'ONLINE' ? 'CONNECTED' : 'DISCONNECTED',
    cloudStatus:
      supabaseStatus === 'CONNECTED'
        ? 'SUPABASE CONNECTED'
        : isSimulatorActive
        ? 'STANDALONE SIMULATION'
        : 'ERROR',
    lastMeasurement: lastUpdatedTime ? lastUpdatedTime.toLocaleTimeString() : 'N/A',
    dataStreamStatus: connectionState === 'ONLINE' ? 'ACTIVE' : 'INACTIVE',
    deviceId,
  };

  const isSupabaseConfigured = supabaseStatus === 'CONNECTED';

  return (
    <EnergyDataContext.Provider
      value={{
        deviceId,
        setDeviceId,
        connectionState,
        freshnessTimeoutSec,
        setFreshnessTimeoutSec,
        lastUpdatedTime,
        secondsSinceLastUpdate,
        latestReading,
        readingsHistory,
        pipelineStages,
        systemHealth,
        activityLogs,
        deviceInfo,
        rawUartMessage,
        isSimulatorActive,
        setIsSimulatorActive,
        isSupabaseConfigured,
        supabaseStatus,
        refreshData,
        simulateIncomingData,
        triggerOfflineState,
        clearActivityLogs,
        addActivityLog,
      }}
    >
      {children}
    </EnergyDataContext.Provider>
  );
};

export const useEnergyData = () => {
  const context = useContext(EnergyDataContext);
  if (!context) {
    throw new Error('useEnergyData must be used within an EnergyDataProvider');
  }
  return context;
};
