// scripts/verify-ip-whitelist.ts
// Run with: npx tsx scripts/verify-ip-whitelist.ts

// Load env vars BEFORE importing anything that uses them
require('dotenv').config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Dynamic import to ensure env vars are loaded first
const { checkIPWhitelist, isIPInCIDR, addIPToWhitelist, removeIPFromWhitelist } = require('../src/lib/auth/ip-whitelist');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_EMAIL = 'verified_tester_1763873096775@apex.com';
const TEST_IP_1 = '192.168.1.100';
const TEST_IP_2 = '10.0.0.5';
const TEST_CIDR = '192.168.1.0/24';

async function runTest() {
    console.log('🚀 Starting IP Whitelist Verification...');

    // 1. Get Admin ID
    const { data: admin } = await supabase
        .from('admin_users')
        .select('id, ip_whitelist_enabled, allowed_ips')
        .eq('email', TEST_EMAIL)
        .single();

    if (!admin) {
        console.error('❌ Admin not found:', TEST_EMAIL);
        return;
    }

    const adminId = admin.id;
    console.log(`✅ Found Admin ID: ${adminId}`);
    console.log(`   Current State: Enabled=${admin.ip_whitelist_enabled}, IPs=${JSON.stringify(admin.allowed_ips)}`);

    // 2. Test CIDR Logic
    console.log('\n🧪 Testing CIDR Logic...');
    const cidrTests = [
        { ip: '192.168.1.50', cidr: '192.168.1.0/24', expected: true },
        { ip: '192.168.2.50', cidr: '192.168.1.0/24', expected: false },
        { ip: '10.0.0.1', cidr: '10.0.0.1', expected: true }, // Exact match
    ];

    let cidrPass = true;
    for (const t of cidrTests) {
        const result = isIPInCIDR(t.ip, t.cidr);
        if (result !== t.expected) {
            console.error(`❌ CIDR Fail: ${t.ip} in ${t.cidr} -> Got ${result}, Expected ${t.expected}`);
            cidrPass = false;
        }
    }
    if (cidrPass) console.log('✅ CIDR Logic Passed');

    // 3. Test Whitelist Logic (Simulation)
    console.log('\n🧪 Testing Whitelist Logic (Simulation)...');

    // Ensure clean state (disable whitelist first)
    await supabase.from('admin_users').update({ ip_whitelist_enabled: false, allowed_ips: [] }).eq('id', adminId);

    // Case A: Whitelist Disabled -> Should Allow All
    const accessDisabled = await checkIPWhitelist(adminId, '1.2.3.4');
    console.log(`   Case A (Disabled): Access ${accessDisabled ? 'Allowed' : 'Denied'} -> ${accessDisabled === true ? '✅' : '❌'}`);

    // Case B: Enable Whitelist + Add IP
    await supabase.from('admin_users').update({ ip_whitelist_enabled: true }).eq('id', adminId);
    await addIPToWhitelist(adminId, TEST_IP_1);

    const accessAllowed = await checkIPWhitelist(adminId, TEST_IP_1);
    console.log(`   Case B (Enabled + Whitelisted IP): Access ${accessAllowed ? 'Allowed' : 'Denied'} -> ${accessAllowed === true ? '✅' : '❌'}`);

    const accessDenied = await checkIPWhitelist(adminId, TEST_IP_2);
    console.log(`   Case C (Enabled + Blocked IP): Access ${accessDenied ? 'Allowed' : 'Denied'} -> ${accessDenied === false ? '✅' : '❌'}`);

    // Case D: CIDR Support
    await addIPToWhitelist(adminId, TEST_CIDR);
    const accessCIDR = await checkIPWhitelist(adminId, '192.168.1.200'); // Inside CIDR
    console.log(`   Case D (CIDR Range): Access ${accessCIDR ? 'Allowed' : 'Denied'} -> ${accessCIDR === true ? '✅' : '❌'}`);

    // 4. Cleanup
    console.log('\n🧹 Cleaning up...');
    // Reset to disabled and clear IPs to not affect user
    await supabase.from('admin_users').update({ ip_whitelist_enabled: false, allowed_ips: [] }).eq('id', adminId);
    console.log('✅ Cleanup Complete');

}

runTest().catch(console.error);
