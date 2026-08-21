export interface EnergyReading {
  id?: string;
  device_id: string;
  voltage: number;
  current: number;
  power: number;
  created_at: string;
}

export type ConnectionState = 'ONLINE' | 'OFFLINE' | 'STALE' | 'INITIALIZING';

export type PipelineStageId = 
  | 'sensor' 
  | 'arduino' 
  | 'esp8266' 
  | 'wifi' 
  | 'supabase' 
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

export interface SystemHealthState {
  deviceStatus: ConnectionState;
  sensorStatus: 'CONNECTED' | 'NO DATA' | 'DISCONNECTED';
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
  gateway: string;
  sensorController: string;
  sensor: string;
  communication: string;
  network: string;
  cloudBackend: string;
  ipAddress: string;
  rssi: number; // e.g. -52 dBm
  firmwareVersion: string;
  uptimeSeconds: number;
  lastSeen: string;
}

export type TimeWindow = '1m' | '5m' | '15m' | '1h' | '24h';
export type HistoricalWindow = 'today' | 'yesterday' | '7d' | '30d' | 'custom';
