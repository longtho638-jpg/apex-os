
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

async function inspectSchema() {
    console.log('🔍 Inspecting transactions table schema...');

    // Use a raw query or just try to select * limit 1 to see keys
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error fetching transactions:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('✅ Found columns:', Object.keys(data[0]));
    } else {
        console.log('⚠️ Table is empty, cannot infer columns from data.');
    }
}

inspectSchema();
