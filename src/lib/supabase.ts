import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnergyReading, DeviceControl } from '@/types/energy';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; key: string } {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('GREENCHARGE_SUPABASE_URL') || localStorage.getItem('DAGITAB_SUPABASE_URL');
    const customKey = localStorage.getItem('GREENCHARGE_SUPABASE_ANON_KEY') || localStorage.getItem('DAGITAB_SUPABASE_ANON_KEY');
    if (customUrl && customKey) {
      return { url: customUrl, key: customKey };
    }
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

export function resetSupabaseClient(): void {
  cachedClient = null;
}

/**
 * Fetch latest telemetry records from energy_readings table
 */
export async function fetchLatestReadings(
  deviceId: string = 'GREENCHARGE-001',
  limit: number = 100
): Promise<EnergyReading[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('energy_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // If filtering by device_id yields no rows, try without filter in case table has different device names
      const fallbackQuery = await client
        .from('energy_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fallbackQuery.error) {
        console.warn('Supabase query error:', error.message);
        return [];
      }
      return (fallbackQuery.data || []).reverse() as EnergyReading[];
    }

    // Return chronological order (oldest first for charts)
    return (data || []).reverse() as EnergyReading[];
  } catch (err) {
    console.error('Error fetching energy readings:', err);
    return [];
  }
}

/**
 * Insert a telemetry reading into energy_readings
 */
export async function insertEnergyReading(
  reading: Omit<EnergyReading, 'id' | 'created_at'> & { created_at?: string }
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('energy_readings').insert([
      {
        device_id: reading.device_id || 'GREENCHARGE-001',
        voltage: reading.voltage,
        current: reading.current,
        power: reading.power,
        created_at: reading.created_at || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Failed to insert energy reading:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inserting reading into Supabase:', err);
    return false;
  }
}

/**
 * Fetch remote device control state from device_control table
 */
export async function fetchDeviceControl(
  deviceId: string = 'GREENCHARGE-001'
): Promise<DeviceControl | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('device_control')
      .select('*')
      .eq('device_id', deviceId)
      .limit(1)
      .maybeSingle();

    if (error) {
      // Fallback in case device_id filter failed or column mismatch
      const fallback = await client
        .from('device_control')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fallback.error || !fallback.data) {
        console.warn('Error fetching device_control:', error.message);
        return null;
      }
      return {
        id: fallback.data.id,
        device_id: fallback.data.device_id || deviceId,
        load_enabled: Boolean(fallback.data.load_enabled),
        updated_at: fallback.data.updated_at || new Date().toISOString(),
      };
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      device_id: data.device_id,
      load_enabled: Boolean(data.load_enabled),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error in fetchDeviceControl:', err);
    return null;
  }
}

/**
 * Update remote physical load state in device_control table
 * Handles schemas with or without 'id' column and prevents duplicate key conflicts
 */
export async function updateDeviceControl(
  deviceId: string = 'GREENCHARGE-001',
  loadEnabled: boolean
): Promise<{ success: boolean; data?: DeviceControl; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured' };
  }

  try {
    const nowIso = new Date().toISOString();

    // 1. First attempt: direct UPDATE targeting device_id
    const updateRes = await client
      .from('device_control')
      .update({
        load_enabled: loadEnabled,
        updated_at: nowIso,
      })
      .eq('device_id', deviceId)
      .select();

    if (!updateRes.error && updateRes.data && updateRes.data.length > 0) {
      const row = updateRes.data[0];
      return {
        success: true,
        data: {
          id: row.id,
          device_id: row.device_id || deviceId,
          load_enabled: Boolean(row.load_enabled),
          updated_at: row.updated_at || nowIso,
        },
      };
    }

    // If update failed due to 'updated_at' column missing in table schema
    if (updateRes.error && updateRes.error.message?.includes('updated_at')) {
      const retryUpdate = await client
        .from('device_control')
        .update({
          load_enabled: loadEnabled,
        })
        .eq('device_id', deviceId)
        .select();

      if (!retryUpdate.error && retryUpdate.data && retryUpdate.data.length > 0) {
        const row = retryUpdate.data[0];
        return {
          success: true,
          data: {
            id: row.id,
            device_id: row.device_id || deviceId,
            load_enabled: Boolean(row.load_enabled),
            updated_at: nowIso,
          },
        };
      }
    }

    // 2. Second attempt: UPSERT if row doesn't exist yet
    const upsertRes = await client
      .from('device_control')
      .upsert(
        {
          device_id: deviceId,
          load_enabled: loadEnabled,
          updated_at: nowIso,
        },
        { onConflict: 'device_id' }
      )
      .select();

    if (!upsertRes.error && upsertRes.data && upsertRes.data.length > 0) {
      const row = upsertRes.data[0];
      return {
        success: true,
        data: {
          id: row.id,
          device_id: row.device_id || deviceId,
          load_enabled: Boolean(row.load_enabled),
          updated_at: row.updated_at || nowIso,
        },
      };
    }

    // If upsert failed due to schema variations, try minimal upsert
    if (upsertRes.error) {
      const minimalUpsert = await client
        .from('device_control')
        .upsert(
          {
            device_id: deviceId,
            load_enabled: loadEnabled,
          },
          { onConflict: 'device_id' }
        )
        .select();

      if (!minimalUpsert.error && minimalUpsert.data && minimalUpsert.data.length > 0) {
        const row = minimalUpsert.data[0];
        return {
          success: true,
          data: {
            id: row.id,
            device_id: row.device_id || deviceId,
            load_enabled: Boolean(row.load_enabled),
            updated_at: nowIso,
          },
        };
      }

      console.error('Supabase device_control update error:', upsertRes.error.message || minimalUpsert.error?.message);
      return {
        success: false,
        error: upsertRes.error.message || minimalUpsert.error?.message || 'Failed to update device_control',
      };
    }

    return {
      success: true,
      data: {
        device_id: deviceId,
        load_enabled: loadEnabled,
        updated_at: nowIso,
      },
    };
  } catch (err: any) {
    console.error('Error updating device control in Supabase:', err);
    return { success: false, error: err?.message || 'Network error updating device control' };
  }
}

export const SUPABASE_SQL_SETUP = `-- ==============================================================================
-- GREENCHARGE IoT Energy-Harvesting System — Supabase SQL Setup Script
-- Compatible with ESP32-S3 + INA219 + TI BQ25570 Microbial Fuel Cell Harvester
-- ==============================================================================

-- 1. Create energy_readings table for real-time harvested telemetry
CREATE TABLE IF NOT EXISTS public.energy_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL DEFAULT 'GREENCHARGE-001',
    voltage NUMERIC(10, 4) NOT NULL, -- Voltage in Volts (e.g. 0.7850 V or 3.2500 V)
    current NUMERIC(10, 4) NOT NULL, -- Current in mA (e.g. 18.4500 mA)
    power NUMERIC(10, 4) NOT NULL,   -- Power in mW (e.g. 14.4832 mW)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for high-performance time-series telemetry querying
CREATE INDEX IF NOT EXISTS idx_energy_readings_device_created 
ON public.energy_readings (device_id, created_at DESC);

-- Enable RLS & create permissive policies for telemetry stream
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read energy_readings" ON public.energy_readings;
CREATE POLICY "Allow public read energy_readings" 
ON public.energy_readings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert energy_readings" ON public.energy_readings;
CREATE POLICY "Allow public insert energy_readings" 
ON public.energy_readings FOR INSERT 
WITH CHECK (true);


-- 2. Create device_control table for BQ25570 Remote Physical Load Switching
CREATE TABLE IF NOT EXISTS public.device_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL UNIQUE DEFAULT 'GREENCHARGE-001',
    load_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial control row for primary hardware node
INSERT INTO public.device_control (device_id, load_enabled, updated_at)
VALUES ('GREENCHARGE-001', false, timezone('utc'::text, now()))
ON CONFLICT (device_id) DO NOTHING;

-- Enable RLS for device_control
ALTER TABLE public.device_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read device_control" ON public.device_control;
CREATE POLICY "Allow public read device_control" 
ON public.device_control FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert device_control" ON public.device_control;
CREATE POLICY "Allow public insert device_control" 
ON public.device_control FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update device_control" ON public.device_control;
CREATE POLICY "Allow public update device_control" 
ON public.device_control FOR UPDATE 
USING (true)
WITH CHECK (true);


-- 3. Enable Supabase Realtime for instant WebSocket updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'energy_readings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_readings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'device_control'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.device_control;
  END IF;
END $$;
`;
