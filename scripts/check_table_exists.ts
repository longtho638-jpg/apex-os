
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTable() {
  console.log('Checking for trading_signals table...');
  
  // Try to select 1 row
  const { data, error } = await supabase
    .from('trading_signals')
    .select('count')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error accessing table:', error);
    if (error.code === '42P01') {
        console.error('Table does NOT exist (42P01)');
    }
  } else {
    console.log('Table exists! Data:', data);
  }
}

checkTable();
