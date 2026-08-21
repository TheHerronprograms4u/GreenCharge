const { createClient } = require('@supabase/supabase-js');

const url = 'https://tveznhikduzkipfadyqx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZXpuaGlrZHV6a2lwZmFkeXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNjA4MDQsImV4cCI6MjEwMjgzNjgwNH0.8Ygj1kEljRljbV7iVYOzhYojfXjsPF_-JyilkYLs0bU';

const supabase = createClient(url, key);

async function testInsert() {
  console.log('Testing insert into energy_readings...');
  const { data, error } = await supabase.from('energy_readings').insert([
    {
      device_id: 'GREENCHARGE-001',
      voltage: 2.350,
      current: 0.120,
      power: 0.282,
    }
  ]).select();

  if (error) {
    console.error('Insert error:', error.message);
  } else {
    console.log('Insert SUCCESS:', data);
  }
}

testInsert();
