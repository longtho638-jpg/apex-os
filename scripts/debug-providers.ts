
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugProviders() {
    console.log('🚀 Starting Providers Debug Script...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Checking Environment Variables:');
    console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing environment variables. Cannot proceed.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('\n1️⃣  Testing Connection & Query...');
    try {
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .limit(5);

        if (error) {
            console.error('❌ Query Error:', error);
        } else {
            console.log(`✅ Query Successful! Found ${data.length} providers.`);
            if (data.length > 0) {
                console.log('Sample Provider:', JSON.stringify(data[0], null, 2));
            }
        }
    } catch (err) {
        console.error('❌ Unexpected Error during query:', err);
    }

    console.log('\n2️⃣  Testing "is_active" column...');
    try {
        const { data, error } = await supabase
            .from('providers')
            .select('id, is_active')
            .eq('is_active', true)
            .limit(1);

        if (error) {
            console.error('❌ "is_active" Query Error:', error);
        } else {
            console.log('✅ "is_active" Query Successful!');
        }
    } catch (err) {
        console.error('❌ Unexpected Error during "is_active" query:', err);
    }
}

debugProviders();
