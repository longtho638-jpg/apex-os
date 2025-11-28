// scripts/unlock-admin.ts
// Run with: npx tsx scripts/unlock-admin.ts

require('dotenv').config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL = 'verified_tester_1763873096775@apex.com';

async function unlockAdmin() {
    console.log(`🔓 Unlocking admin account for: ${EMAIL}...`);

    const { data, error } = await supabase
        .from('admin_users')
        .update({ ip_whitelist_enabled: false })
        .eq('email', EMAIL)
        .select();

    if (error) {
        console.error('❌ Error unlocking account:', error);
    } else {
        console.log('✅ Account unlocked! IP Whitelisting has been DISABLED.');
        console.log('👉 You can now access the Admin Panel again.');
    }
}

unlockAdmin();
