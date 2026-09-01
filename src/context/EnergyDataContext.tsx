'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EnergyReading,
  DeviceControl,
  ConnectionState,
  PipelineStage,
  DeviceStatusMatrix,
  SystemHealthState,
  ActivityEvent,
  DeviceInfo,
  ToastMessage,
} from '@/types/energy';
import {
  getSupabaseClient,
  fetchLatestReadings,
  insertEnergyReading,
  fetchDeviceControl,
  updateDeviceControl,
} from '@/lib/supabase';
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
  previousReading: EnergyReading | null;
  readingsHistory: EnergyReading[];
  
  // Remote Load Control
  loadEnabled: boolean;
  isLoadUpdating: boolean;
  loadStatusMessage: string;
  lastControlSync: Date | null;
  toggleLoadControl: (targetState: boolean) => Promise<{ success: boolean; error?: string }>;
  
  // Diagnostics & Status
  pipelineStages: PipelineStage[];
  deviceStatusMatrix: DeviceStatusMatrix;
  systemHealth: SystemHealthState;
  activityLogs: ActivityEvent[];
  deviceInfo: DeviceInfo;
  rawUartMessage: string;
  
  // Simulation & Cloud State
  isSimulatorActive: boolean;
  setIsSimulatorActive: (active: boolean) => void;
  isSupabaseConfigured: boolean;
  supabaseStatus: 'CONNECTED' | 'DISCONNECTED' | 'UNCONFIGURED';
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  simulateIncomingData: () => void;
  triggerOfflineState: () => void;
  clearActivityLogs: () => void;
  addActivityLog: (type: ActivityEvent['type'], title: string, message: string) => void;
}

const EnergyDataContext = createContext<EnergyDataContextType | undefined>(undefined);

export const EnergyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string>('GREENCHARGE-001');
  const [freshnessTimeoutSec, setFreshnessTimeoutSec] = useState<number>(8);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('INITIALIZING');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState<number>(0);
  
  const [latestReading, setLatestReading] = useState<EnergyReading | null>(null);
  const [previousReading, setPreviousReading] = useState<EnergyReading | null>(null);
  const [readingsHistory, setReadingsHistory] = useState<EnergyReading[]>([]);
  
  // Remote Load Control State
  const [loadEnabled, setLoadEnabled] = useState<boolean>(false);
  const [isLoadUpdating, setIsLoadUpdating] = useState<boolean>(false);
  const [loadStatusMessage, setLoadStatusMessage] = useState<string>('Load OFF');
  const [lastControlSync, setLastControlSync] = useState<Date | null>(null);

  const [rawUartMessage, setRawUartMessage] = useState<string>('GC-DATA,V=0.785V,I=18.450mA,P=14.48mW,LOAD=0');
  const [supabaseStatus, setSupabaseStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'UNCONFIGURED'>('UNCONFIGURED');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast: ToastMessage = { id, title, message, type, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      type: 'info',
      title: 'GreenCharge Core Online',
      message: 'Microbial Fuel Cell (MFC) Energy Monitoring Architecture initialized.',
      deviceId: 'GREENCHARGE-001',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 25000).toISOString(),
      type: 'success',
      title: 'Telemetry Stream Initialized',
      message: 'ESP32-S3 + INA219 sensor interface synchronized with TI BQ25570 PMIC.',
      deviceId: 'GREENCHARGE-001',
    },
  ]);

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

  // Hardware Pipeline Stages
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    {
      id: 'mfc_source',
      name: 'Microbial Fuel Cell (MFC)',
      tech: 'Bioelectrochemical Reactor',
      status: 'ONLINE',
      latencyMs: 1,
      details: 'Organic sediment anode + biocathode redox harvesting ~780mV',
      lastVerified: 'Just now',
    },
    {
      id: 'ina219_sensor',
      name: 'INA219 Power Monitor',
      tech: 'I2C High-Side Current Sensor',
      status: 'ONLINE',
      latencyMs: 3,
      details: 'Measuring shunt current (mA), bus voltage (V) & harvest power (mW)',
      lastVerified: 'Just now',
    },
    {
      id: 'bq25570_pmic',
      name: 'TI BQ25570 PMIC',
      tech: 'Ultra-Low-Power Harvester',
      status: 'ONLINE',
      latencyMs: 4,
      details: 'MPPT tracking active @ 80% VOC with integrated buck regulator',
      lastVerified: 'Just now',
    },
    {
      id: 'esp32s3_mcu',
      name: 'ESP32-S3 Microcontroller',
      tech: 'Dual-Core Xtensa LX7 @ 240MHz',
      status: 'ONLINE',
      latencyMs: 12,
      details: 'Processing telemetry & dispatching payloads via Wi-Fi TLS',
      lastVerified: 'Just now',
    },
    {
      id: 'storage_buffer',
      name: 'Energy Storage Buffer',
      tech: '5.5V Supercapacitor / LiFePO4',
      status: 'ONLINE',
      latencyMs: 2,
      details: 'Energy buffer rail holding ~3.3V regulated potential',
      lastVerified: 'Just now',
    },
    {
      id: 'load_output',
      name: 'Physical System Load',
      tech: 'BQ25570 Switched Buck Output',
      status: 'ONLINE',
      latencyMs: 8,
      details: 'Remote gated load switch (Status: OFF / Standby)',
      lastVerified: 'Just now',
    },
    {
      id: 'supabase_cloud',
      name: 'Supabase IoT Backend',
      tech: 'PostgreSQL + Realtime WSS',
      status: 'ONLINE',
      latencyMs: 42,
      details: 'Tables: energy_readings & device_control',
      lastVerified: 'Just now',
    },
    {
      id: 'dashboard',
      name: 'GreenCharge Command Center',
      tech: 'Next.js Turbopack',
      status: 'ONLINE',
      latencyMs: 2,
      details: 'Sub-second real-time telemetry rendering & control dispatch',
      lastVerified: 'Just now',
    },
  ]);

  // Technical Device Specifications
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceId: 'GREENCHARGE-001',
    mcu: 'ESP32-S3-WROOM-1 (Xtensa LX7 @ 240MHz)',
    sensor: 'Texas Instruments INA219 I2C (0.1Ω Shunt, 12-bit ADC)',
    pmic: 'Texas Instruments BQ25570 Ultra-Low-Power Boost & Nanopower Buck',
    energySource: 'Microbial Fuel Cell (MFC) Bio-Electrochemical Reactor',
    storageType: '5.5V / 1.5F High-Density Supercapacitor Bank',
    communication: 'I2C @ 400kHz Fast Mode + Wi-Fi WPA3',
    network: 'Wi-Fi 802.11 b/g/n (2.4GHz)',
    cloudBackend: 'Supabase Realtime PostgreSQL',
    ipAddress: '192.168.1.188',
    rssi: -58,
    firmwareVersion: 'v2.4.0-esp32s3-mfc',
    uptimeSeconds: 18450,
    lastSeen: new Date().toISOString(),
    mpptReference: '80% VOC Sample Interval (16 sec)',
    coldStartVoltage: '330 mV VIN_CS',
  });

  // Process incoming reading
  const processIncomingReading = useCallback(
    (reading: EnergyReading, uartString?: string) => {
      const now = new Date();
      
      setLatestReading((prev) => {
        if (prev) {
          setPreviousReading(prev);
        }
        return reading;
      });

      setLastUpdatedTime(now);
      setSecondsSinceLastUpdate(0);
      setConnectionState('ONLINE');

      if (uartString) {
        setRawUartMessage(uartString);
      } else {
        setRawUartMessage(
          `GC-DATA,V=${reading.voltage.toFixed(3)}V,I=${reading.current.toFixed(3)}mA,P=${reading.power.toFixed(2)}mW,LOAD=${loadEnabled ? '1' : '0'}`
        );
      }

      setReadingsHistory((prev) => {
        const updated = [...prev, reading];
        return updated.slice(-250);
      });

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
    [loadEnabled]
  );

  // Initialize with seed data if Supabase has no data
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      const initialData = telemetrySimulator.generateInitialHistory(deviceId, 35, loadEnabled);
      setReadingsHistory(initialData);
      if (initialData.length > 0) {
        const latest = initialData[initialData.length - 1];
        setLatestReading(latest);
        setPreviousReading(initialData[initialData.length - 2] || null);
        setLastUpdatedTime(new Date(latest.created_at));
        setConnectionState('ONLINE');
      }
    }
  }, [deviceId, loadEnabled]);

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
            'Telemetry Stream Timeout',
            `No telemetry packet received for >${freshnessTimeoutSec} seconds. Device ${deviceId} marked OFFLINE.`
          );

          setPipelineStages((prev) =>
            prev.map((stage) =>
              stage.id === 'mfc_source' || stage.id === 'ina219_sensor' || stage.id === 'esp32s3_mcu'
                ? { ...stage, status: 'ERROR', details: 'Telemetry stream interrupted — awaiting packet' }
                : stage
            )
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdatedTime, freshnessTimeoutSec, connectionState, deviceId, addActivityLog]);

  // Live Local UI Simulator Loop (when enabled by user)
  useEffect(() => {
    if (!isSimulatorActive) return;

    const simInterval = setInterval(() => {
      const { reading, rawUart } = telemetrySimulator.generateReading(deviceId, loadEnabled);
      processIncomingReading(reading, rawUart);
    }, 3000);

    return () => clearInterval(simInterval);
  }, [isSimulatorActive, deviceId, loadEnabled, processIncomingReading]);

  // Supabase Initial Sync & Realtime Subscriptions (both telemetry and device_control)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSupabaseStatus('UNCONFIGURED');
      return;
    }

    setSupabaseStatus('CONNECTED');

    // 1. Fetch initial telemetry history
    fetchLatestReadings(deviceId, 60).then((data) => {
      if (data && data.length > 0) {
        setReadingsHistory(data);
        const newest = data[data.length - 1];
        const prev = data.length > 1 ? data[data.length - 2] : null;
        if (newest.device_id) {
          setDeviceId(newest.device_id);
        }
        setPreviousReading(prev);
        processIncomingReading(newest);
        addActivityLog(
          'success',
          'Telemetry History Synced',
          `Loaded ${data.length} telemetry readings from Supabase (Device: ${newest.device_id || deviceId}).`
        );
      }
    });

    // 2. Fetch initial device_control state
    fetchDeviceControl(deviceId).then((control) => {
      if (control) {
        setLoadEnabled(control.load_enabled);
        setLoadStatusMessage(control.load_enabled ? 'Load ON' : 'Load OFF');
        setLastControlSync(new Date(control.updated_at));
        addActivityLog(
          'info',
          'Hardware Control State Synced',
          `Initial BQ25570 load state: ${control.load_enabled ? 'ON' : 'OFF'} (Device: ${deviceId})`
        );
      }
    });

    // 3. Realtime subscription to energy_readings table
    const telemetryChannel = supabase
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
              'Realtime Telemetry Ingested',
              `Live reading from ${newReading.device_id}: ${newReading.voltage}V, ${newReading.current}mA, ${newReading.power}mW`
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSupabaseStatus('CONNECTED');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSupabaseStatus('DISCONNECTED');
          addActivityLog('warning', 'Supabase Realtime Stream Warning', 'Realtime subscription interrupted.');
        }
      });

    // 4. Realtime subscription to device_control table
    const controlChannel = supabase
      .channel('public:device_control')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'device_control' },
        (payload) => {
          const updated = payload.new as DeviceControl;
          if (updated && (!updated.device_id || updated.device_id === deviceId)) {
            setLoadEnabled(updated.load_enabled);
            setLoadStatusMessage(updated.load_enabled ? 'Load ON' : 'Load OFF');
            setLastControlSync(new Date(updated.updated_at));
            addToast(
              'Hardware Control Synchronized',
              `Remote load state is now ${updated.load_enabled ? 'ON' : 'OFF'}.`,
              'info'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(telemetryChannel);
      supabase.removeChannel(controlChannel);
    };
  }, [deviceId, processIncomingReading, addActivityLog, addToast]);

  // Manual refresh function
  const refreshData = async () => {
    const data = await fetchLatestReadings(deviceId, 60);
    if (data && data.length > 0) {
      setReadingsHistory(data);
      processIncomingReading(data[data.length - 1]);
    }

    const control = await fetchDeviceControl(deviceId);
    if (control) {
      setLoadEnabled(control.load_enabled);
      setLoadStatusMessage(control.load_enabled ? 'Load ON' : 'Load OFF');
      setLastControlSync(new Date(control.updated_at));
    }
  };

  /**
   * Remote Load Control Toggle Logic
   * 1. Show immediate visual transition ("Load activation requested" or "Load shutdown requested")
   * 2. Disable repeated clicks during synchronization (isLoadUpdating)
   * 3. Write requested state to Supabase table device_control
   * 4. Wait for confirmation
   * 5. Reflect confirmed state ("Load ON" or "Load OFF")
   * 6. If failed: revert toggle, show error ("Control unavailable"), never falsely display hardware as switched!
   */
  const toggleLoadControl = async (targetState: boolean): Promise<{ success: boolean; error?: string }> => {
    if (isLoadUpdating) {
      return { success: false, error: 'Synchronization already in progress' };
    }

    const previousState = loadEnabled;
    setIsLoadUpdating(true);
    setLoadStatusMessage(targetState ? 'Load activation requested' : 'Load shutdown requested');

    addToast(
      'Control Command Dispatched',
      targetState ? 'Load activation requested. Writing to Supabase...' : 'Load shutdown requested. Writing to Supabase...',
      'info'
    );

    const supabase = getSupabaseClient();
    if (!supabase) {
      // In standalone demo/simulation mode without Supabase credentials
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoadEnabled(targetState);
      setLoadStatusMessage(targetState ? 'Load ON' : 'Load OFF');
      setLastControlSync(new Date());
      setIsLoadUpdating(false);

      addToast(
        'Local Simulation State Updated',
        `BQ25570 load toggled to ${targetState ? 'ON' : 'OFF'} (Standalone mode).`,
        'success'
      );
      addActivityLog(
        'success',
        `Load ${targetState ? 'Enabled' : 'Disabled'}`,
        `Local simulation updated device ${deviceId} load state to ${targetState ? 'ON' : 'OFF'}.`
      );
      return { success: true };
    }

    try {
      const result = await updateDeviceControl(deviceId, targetState);

      if (result.success) {
        setLoadEnabled(targetState);
        setLoadStatusMessage(targetState ? 'Load ON' : 'Load OFF');
        setLastControlSync(new Date());
        setIsLoadUpdating(false);

        addToast(
          targetState ? 'Load Enabled' : 'Load Disabled',
          `Successfully synchronized ${targetState ? 'Load ON' : 'Load OFF'} with device_control.`,
          'success'
        );
        addActivityLog(
          'success',
          `Load ${targetState ? 'Enabled' : 'Disabled'} (Confirmed)`,
          `Supabase device_control updated: device_id=${deviceId}, load_enabled=${targetState}.`
        );
        return { success: true };
      } else {
        // REVERT STATE on error
        setLoadEnabled(previousState);
        setLoadStatusMessage('Control unavailable');
        setIsLoadUpdating(false);

        addToast(
          'Control Unavailable',
          result.error || 'Failed to update device_control in Supabase. Reverting switch.',
          'error'
        );
        addActivityLog(
          'error',
          'Load Switching Failed',
          `Failed to update device_control: ${result.error || 'Unknown error'}. Preserving previous state.`
        );
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      // REVERT STATE on exception
      setLoadEnabled(previousState);
      setLoadStatusMessage('Control unavailable');
      setIsLoadUpdating(false);

      addToast(
        'Control Unavailable',
        err?.message || 'Network exception during load control update.',
        'error'
      );
      addActivityLog(
        'error',
        'Load Control Error',
        `Network exception writing to device_control: ${err?.message || 'Timeout'}`
      );
      return { success: false, error: err?.message };
    }
  };

  const simulateIncomingData = () => {
    const { reading, rawUart } = telemetrySimulator.generateReading(deviceId, loadEnabled);
    processIncomingReading(reading, rawUart);
    addActivityLog('success', 'Manual Telemetry Injected', `Injected sample payload: ${rawUart}`);
    addToast('Test Telemetry Injected', `Payload: ${rawUart}`, 'info');
  };

  const triggerOfflineState = () => {
    setConnectionState('OFFLINE');
    setSecondsSinceLastUpdate(15);
    addActivityLog('warning', 'Simulated Hardware Offline', 'User triggered offline state for testing.');
    addToast('Device Disconnected', 'Hardware offline threshold triggered.', 'warning');
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
  };

  // Device Status Matrix
  const deviceStatusMatrix: DeviceStatusMatrix = {
    esp32: connectionState === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
    ina219: connectionState === 'ONLINE' ? 'CONNECTED' : 'DISCONNECTED',
    bq25570: connectionState === 'ONLINE' ? 'MPPT_ACTIVE' : 'DISABLED',
    load: isLoadUpdating ? 'SWITCHING' : loadEnabled ? 'ON' : 'OFF',
    supabase:
      supabaseStatus === 'CONNECTED'
        ? 'CONNECTED'
        : supabaseStatus === 'UNCONFIGURED'
        ? 'UNCONFIGURED'
        : 'ERROR',
    lastTelemetry: lastUpdatedTime ? lastUpdatedTime.toLocaleTimeString() : null,
    lastControlSync: lastControlSync ? lastControlSync.toLocaleTimeString() : null,
  };

  // System Health
  const systemHealth: SystemHealthState = {
    deviceStatus: connectionState,
    sensorStatus: connectionState === 'ONLINE' ? 'CONNECTED' : 'NO DATA',
    pmicStatus: connectionState === 'ONLINE' ? 'ENABLED' : 'STANDBY',
    loadStatus: loadEnabled ? 'LOAD ON' : 'LOAD OFF',
    wifiStatus: connectionState === 'ONLINE' ? 'CONNECTED' : 'DISCONNECTED',
    cloudStatus:
      supabaseStatus === 'CONNECTED'
        ? 'SUPABASE CONNECTED'
        : isSimulatorActive
        ? 'STANDALONE SIMULATION'
        : 'ERROR',
    lastMeasurement: lastUpdatedTime ? lastUpdatedTime.toLocaleTimeString() : null,
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
        previousReading,
        readingsHistory,
        loadEnabled,
        isLoadUpdating,
        loadStatusMessage,
        lastControlSync,
        toggleLoadControl,
        pipelineStages,
        deviceStatusMatrix,
        systemHealth,
        activityLogs,
        deviceInfo,
        rawUartMessage,
        isSimulatorActive,
        setIsSimulatorActive,
        isSupabaseConfigured,
        supabaseStatus,
        toasts,
        addToast,
        removeToast,
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
