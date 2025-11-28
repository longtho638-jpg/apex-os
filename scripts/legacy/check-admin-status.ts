// scripts/check-admin-status.ts
require('dotenv').config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL = 'verified_tester_1763873096775@apex.com';

async function listAdmins() {
    console.log('Listing all admin_users...');

    const { data: admins, error } = await supabase
        .from('admin_users')
        .select('*');

    if (error) {
        console.error('❌ Error fetching admin_users:', error);
        return;
    }

    console.log(`✅ Found ${admins.length} admin(s):`);
    admins.forEach(admin => {
        console.log(`   - ${admin.email}:`);
        console.log(`     Role: ${admin.role}`);
        console.log(`     MFA: ${admin.mfa_enabled}`);
        console.log(`     IP Whitelist Enabled: ${admin.ip_whitelist_enabled}`);
        console.log(`     Allowed IPs: ${JSON.stringify(admin.allowed_ips)}`);
    });
}

listAdmins();
