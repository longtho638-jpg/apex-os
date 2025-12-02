
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeUser() {
    const email = 'billwill.mentor@gmail.com';
    console.log(`🔍 Attempting to upgrade user: ${email}...`);

    const candidates = ['founders', 'FOUNDERS', 'whale', 'WHALE', 'elite', 'ELITE', 'pro', 'PRO'];

    for (const tier of candidates) {
        console.log(`👉 Trying tier value: '${tier}'...`);

        // Try updating by email
        const { data, error } = await supabase
            .from('users')
            .update({ subscription_tier: tier })
            .eq('email', email)
            .select();

        if (!error && data && data.length > 0) {
            console.log(`🎉 SUCCESS! Upgraded to '${tier}' (mapped to WHALE in UI).`);
            return;
        }

        if (error) {
            console.log(`   ❌ Failed with error: ${error.message}`);
        } else {
            console.log(`   ⚠️ No rows matched.`);
        }
    }

    console.error('❌ All attempts failed.');
}

upgradeUser();
