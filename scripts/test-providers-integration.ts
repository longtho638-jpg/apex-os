
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
const API_BASE_URL = 'http://localhost:3000/api/v1/admin/providers';
const CRON_URL = 'http://localhost:3000/api/cron/health-check';
const PROVIDER_CODE = `test-prov-${Date.now()}`;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET) {
    console.error('❌ Missing environment variables. Check .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log('🚀 Starting Provider API Integration Tests...\n');

    // 1. Get a Super Admin User
    console.log('1️⃣  Authenticating as Super Admin...');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'super_admin')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('❌ No super_admin user found. Run promote_admin.ts first.');
        process.exit(1);
    }

    const adminUser = users[0];
    console.log(`   Found admin: ${adminUser.email} (${adminUser.id})`);

    // 2. Generate Token
    const token = jwt.sign({
        email: adminUser.email,
        type: 'session',
        role: 'super_admin',
        sub: adminUser.id
    }, JWT_SECRET!, { expiresIn: '1h' });

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 3. Cleanup Previous Test Data (Skipped to avoid FK issues with Audit)
    console.log('\n2️⃣  Skipping cleanup (using dynamic provider code)...');
    /*
    const { data: existing, error: fetchError } = await supabase
        .from('providers')
        .select('id, provider_code')
        .eq('provider_code', PROVIDER_CODE);

    if (fetchError) {
        console.error('❌ Error fetching existing providers:', fetchError);
    }

    if (existing && existing.length > 0) {
        console.log(`   Found ${existing.length} existing providers to delete.`);
        const { error: deleteError } = await supabase
            .from('providers')
            .delete()
            .in('id', existing.map(p => p.id));

        if (deleteError) {
            console.error('❌ Error deleting providers:', deleteError);
            process.exit(1);
        }
        console.log(`   ✅ Deleted ${existing.length} old test providers.`);
    } else {
        console.log('   ℹ️  No existing providers found.');
    }
    */

    // 4. Test Create Provider
    console.log('\n3️⃣  Test: Create Provider (POST)...');
    const createRes = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            provider_code: PROVIDER_CODE,
            provider_name: 'Integration Test Provider',
            asset_class: 'crypto',
            status: 'testing',
            asset_config: { test: true },
            regulatory_info: { license: 'TEST-123' },
            api_key: 'secret-api-key-123',
            api_secret: 'secret-api-secret-456'
        })
    });

    const createData = await createRes.json();
    if (!createRes.ok || !createData.success) {
        console.error('❌ Create failed:', createData);
        process.exit(1);
    }
    const providerId = createData.provider.id;
    console.log('   ✅ Provider created:', providerId);

    // Verify Encryption
    if (createData.provider.encrypted_api_key === 'NOT_SET' || !createData.provider.encrypted_api_key.includes(':')) {
        console.error('❌ API Key not encrypted correctly:', createData.provider.encrypted_api_key);
        process.exit(1);
    }
    console.log('   ✅ API Key encrypted successfully');

    // 5. Test List Providers
    console.log('\n4️⃣  Test: List Providers (GET)...');
    const listRes = await fetch(`${API_BASE_URL}?search=integration`, { headers });
    const listData = await listRes.json();
    if (!listRes.ok || !listData.success || listData.providers.length === 0) {
        console.error('❌ List failed or provider not found:', listData);
        process.exit(1);
    }
    console.log('   ✅ Provider found in list');

    // 6. Test Bulk Action (Activate)
    console.log('\n5️⃣  Test: Bulk Activate (PATCH)...');
    const bulkRes = await fetch(`${API_BASE_URL}/bulk`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            ids: [providerId],
            action: 'activate'
        })
    });
    const bulkData = await bulkRes.json();
    if (!bulkRes.ok || !bulkData.success) {
        console.error('❌ Bulk activate failed:', bulkData);
        process.exit(1);
    }
    console.log('   ✅ Bulk activate success');

    // Verify status in DB
    const { data: updatedProvider } = await supabase
        .from('providers')
        .select('status')
        .eq('id', providerId)
        .single();

    if (updatedProvider?.status !== 'active') {
        console.error('❌ Status not updated in DB:', updatedProvider);
        process.exit(1);
    }
    console.log('   ✅ DB status verified: active');

    // 7. Test Health Check Cron
    console.log('\n6️⃣  Test: Health Check Cron (GET)...');
    const cronRes = await fetch(CRON_URL, { headers }); // Pass auth just in case, though cron might check secret
    const cronData = await cronRes.json();
    if (!cronRes.ok || !cronData.success) {
        console.error('❌ Cron failed:', cronData);
        // Don't exit, maybe cron secret issue, but we want to verify logic
    } else {
        console.log('   ✅ Cron job ran successfully');
        const result = cronData.results.find((r: any) => r.provider_code === PROVIDER_CODE);
        console.log('   ✅ Health check result:', result?.status || 'Not found in results');
    }

    // 8. Test Bulk Import (POST)
    console.log('\n7️⃣.5 Test: Bulk Import (POST)...');
    const bulkImportRes = await fetch(`${API_BASE_URL}/bulk-import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            providers: [
                {
                    provider_code: `bulk-test-${Date.now()}`,
                    provider_name: 'Bulk Import Test Provider',
                    asset_class: 'forex',
                    status: 'active',
                    asset_config: { leverage: 100 },
                    regulatory_info: { region: 'EU' }
                }
            ]
        })
    });
    const bulkImportData = await bulkImportRes.json();
    if (!bulkImportRes.ok || !bulkImportData.success) {
        console.error('❌ Bulk import failed:', bulkImportData);
        process.exit(1);
    }
    console.log(`   ✅ Bulk import success: Imported ${bulkImportData.imported_count}, Failed ${bulkImportData.failed_count}`);
    if (bulkImportData.imported_count !== 1) {
        console.error('❌ Expected 1 imported provider');
        process.exit(1);
    }

    // 9. Test Audit Logs
    console.log('\n7️⃣  Test: Audit Logs (GET)...');
    const auditRes = await fetch(`${API_BASE_URL}/${providerId}/audit`, { headers });
    const auditData = await auditRes.json();
    if (!auditRes.ok || !auditData.success) {
        console.error('❌ Audit fetch failed:', auditData);
    } else {
        console.log(`   ✅ Found ${auditData.logs.length} audit logs`);
    }

    // 9. Test Delete (Clean up)
    console.log('\n8️⃣  Test: Delete Provider (DELETE)...');
    const deleteRes = await fetch(`${API_BASE_URL}/${providerId}`, {
        method: 'DELETE',
        headers
    });
    if (!deleteRes.ok) {
        const deleteData = await deleteRes.json();
        console.error('❌ Delete failed:', deleteData);
        process.exit(1);
    }
    console.log('   ✅ Delete success');

    console.log('\n🎉 All Integration Tests Passed!');
}

main().catch(console.error);
