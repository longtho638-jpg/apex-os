
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to list users

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);

    try {
        // Try querying a table instead of Auth Admin
        const { data, error } = await supabase.from('copy_leaders').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Error querying copy_leaders:', error);
        } else {
            console.log('Successfully connected to Database!');
            console.log(`Table copy_leaders is accessible.`);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
