const { createClient } = require('@supabase/supabase-js');

const url = 'https://tveznhikduzkipfadyqx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZXpuaGlrZHV6a2lwZmFkeXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNjA4MDQsImV4cCI6MjEwMjgzNjgwNH0.8Ygj1kEljRljbV7iVYOzhYojfXjsPF_-JyilkYLs0bU';

const supabase = createClient(url, key);

async function inspectRows() {
  const { data, error } = await supabase
    .from('energy_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Query error:', error.message);
  } else {
    console.log('Latest 10 rows in Supabase:');
    data.forEach((row) => {
      console.log(`ID: ${row.id} | device_id: "${row.device_id}" | V: ${row.voltage} | I: ${row.current} | P: ${row.power} | Time: ${row.created_at}`);
    });
  }
}

inspectRows();
