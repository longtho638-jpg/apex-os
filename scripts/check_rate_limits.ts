
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRateLimits() {
    console.log('🔍 Checking rate_limits table...');

    const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error fetching rate_limits:', error.message);
    } else {
        console.log('✅ rate_limits table exists.');
    }
}

checkRateLimits();
