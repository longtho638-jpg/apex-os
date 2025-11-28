
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
const API_BASE_URL = 'http://localhost:3000/api/v1/admin/providers';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log('🚀 Starting Analytics API Tests...\n');

    // 1. Authenticate
    const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'super_admin')
        .limit(1);

    if (!users || users.length === 0) {
        console.error('❌ No super_admin found');
        process.exit(1);
    }

    const adminUser = users[0];
    const token = jwt.sign({
        email: adminUser.email,
        type: 'session',
        role: 'super_admin',
        sub: adminUser.id
    }, JWT_SECRET!, { expiresIn: '1h' });

    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Get a provider ID
    const { data: providers } = await supabase
        .from('providers')
        .select('id')
        .limit(1);

    if (!providers || providers.length === 0) {
        console.error('❌ No providers found');
        process.exit(1);
    }
    const providerId = providers[0].id;
    console.log(`   Testing with provider: ${providerId}`);

    // 3. Test Metrics API
    console.log('\n1️⃣  Test: Get Metrics (GET)...');
    const res = await fetch(`${API_BASE_URL}/${providerId}/metrics?days=30`, { headers });
    const data = await res.json();

    if (!res.ok || !data.success) {
        console.error('❌ Metrics fetch failed:', data);
        process.exit(1);
    }

    console.log(`   ✅ Success! Retrieved ${data.metrics.length} metric records.`);

    if (data.metrics.length > 0) {
        const first = data.metrics[0];
        console.log('   Sample data:', {
            date: first.date,
            volume: first.total_volume,
            revenue: first.total_revenue
        });
    }

    console.log('\n🎉 Analytics Tests Passed!');
}

main().catch(console.error);
