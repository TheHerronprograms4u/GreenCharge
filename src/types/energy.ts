export interface EnergyReading {
  id?: string;
  device_id: string;
  voltage: number;   // In Volts (e.g. 0.785 V or 3.250 V)
  current: number;   // In mA or A (e.g. 18.450 mA)
  power: number;     // In mW or W (e.g. 14.480 mW)
  created_at: string;
}

export interface DeviceControl {
  id?: string;
  device_id: string;
  load_enabled: boolean;
  updated_at: string;
}

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'STALE' | 'INITIALIZING';

export type PipelineStageId =
  | 'mfc_source'
  | 'ina219_sensor'
  | 'bq25570_pmic'
  | 'esp32s3_mcu'
  | 'storage_buffer'
  | 'load_output'
  | 'supabase_cloud'
  | 'dashboard';

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  tech: string;
  status: 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE';
  latencyMs?: number;
  details: string;
  lastVerified: string;
}

export interface DeviceStatusMatrix {
  esp32: 'ONLINE' | 'OFFLINE';
  ina219: 'CONNECTED' | 'DISCONNECTED' | 'CALIBRATING';
  bq25570: 'ENABLED' | 'DISABLED' | 'MPPT_ACTIVE';
  load: 'ON' | 'OFF' | 'SWITCHING';
  supabase: 'CONNECTED' | 'ERROR' | 'UNCONFIGURED';
  lastTelemetry: string | null;
  lastControlSync: string | null;
}

export interface SystemHealthState {
  deviceStatus: ConnectionState;
  sensorStatus: 'CONNECTED' | 'NO DATA' | 'DISCONNECTED';
  pmicStatus: 'ENABLED' | 'STANDBY' | 'FAULT';
  loadStatus: 'LOAD ON' | 'LOAD OFF';
  wifiStatus: 'CONNECTED' | 'DISCONNECTED' | 'WEAK';
  cloudStatus: 'SUPABASE CONNECTED' | 'ERROR' | 'STANDALONE SIMULATION';
  lastMeasurement: string | null;
  dataStreamStatus: 'ACTIVE' | 'INACTIVE';
  deviceId: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'offline';
  title: string;
  message: string;
  deviceId: string;
}

export interface DeviceInfo {
  deviceId: string;
  mcu: string;
  sensor: string;
  pmic: string;
  energySource: string;
  storageType: string;
  communication: string;
  network: string;
  cloudBackend: string;
  ipAddress: string;
  rssi: number; // e.g. -58 dBm
  firmwareVersion: string;
  uptimeSeconds: number;
  lastSeen: string;
  mpptReference: string;
  coldStartVoltage: string;
}

export type TimeWindow = 'LIVE' | '1H' | '6H' | '24H' | '7D' | '30D';
export type MetricDisplayMode = 'power' | 'voltage' | 'current';
export type HistoricalWindow = 'today' | 'yesterday' | '7d' | '30d' | 'all';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}
