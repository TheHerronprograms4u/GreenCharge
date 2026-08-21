import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnergyReading } from '@/types/energy';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; key: string } {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('GREENCHARGE_SUPABASE_URL');
    const customKey = localStorage.getItem('GREENCHARGE_SUPABASE_ANON_KEY');
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
      cachedClient = createClient(url, key);
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
      console.warn('Supabase query error:', error.message);
      return [];
    }

    // Return chronological order (oldest first for charts)
    return (data || []).reverse() as EnergyReading[];
  } catch (err) {
    console.error('Error fetching energy readings:', err);
    return [];
  }
}

export async function insertEnergyReading(
  reading: Omit<EnergyReading, 'id' | 'created_at'> & { created_at?: string }
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('energy_readings').insert([
      {
        device_id: reading.device_id,
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

export const SUPABASE_SQL_SETUP = `-- GREENCHARGE Database Setup Script for Supabase
-- Run this in your Supabase SQL Editor to create the table and enable Realtime

-- 1. Create energy_readings table
CREATE TABLE IF NOT EXISTS public.energy_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL DEFAULT 'GREENCHARGE-001',
    voltage NUMERIC(8, 3) NOT NULL,
    current NUMERIC(8, 3) NOT NULL,
    power NUMERIC(8, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index on device_id and timestamp for ultra-fast queries
CREATE INDEX IF NOT EXISTS idx_energy_readings_device_time 
ON public.energy_readings (device_id, created_at DESC);

-- 3. Enable Row Level Security (RLS) and allow public inserts/reads
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON public.energy_readings FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.energy_readings FOR INSERT 
WITH CHECK (true);

-- 4. Enable Supabase Realtime for live dashboard streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_readings;
`;
