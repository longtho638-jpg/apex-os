
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTypes() {
    console.log('🔍 Checking transaction types...');

    const { data, error } = await supabase
        .from('transactions')
        .select('type');

    if (error) {
        console.error('❌ Error fetching transactions:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️ No transactions found in the table.');
        return;
    }

    const types = [...new Set(data.map(t => t.type))];
    console.log('✅ Found Transaction Types:', types);
}

checkTypes();
