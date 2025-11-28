
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
const API_BASE_URL = 'http://localhost:3000/api/v1/admin/ab-tests';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log('🚀 Starting A/B Testing API Tests...\n');

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

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 2. Get Prerequisites (Provider & Templates)
    const { data: providers } = await supabase.from('providers').select('id').limit(1);
    let { data: templates } = await supabase.from('referral_templates').select('id').limit(2);

    if (!providers?.length) {
        console.error('❌ Need at least 1 provider to test');
        process.exit(1);
    }

    // Seed templates if missing
    if (!templates || templates.length < 2) {
        console.log('   ⚠️ Seeding missing templates...');
        const newTemplates = [];
        for (let i = 0; i < 2 - (templates?.length || 0); i++) {
            newTemplates.push({
                name: `Seed Template ${Date.now()}-${i}`,
                html_content: '<div>Seed</div>',
                is_active: true
            });
        }
        const { data: created, error } = await supabase
            .from('referral_templates')
            .insert(newTemplates)
            .select('id');

        if (error) {
            console.error('❌ Failed to seed templates:', error);
            process.exit(1);
        }
        templates = [...(templates || []), ...created];
    }

    const providerId = providers[0].id;
    const t1 = templates[0].id;
    const t2 = templates[1].id;

    // 3. Test Create Campaign (POST)
    console.log('\n1️⃣  Test: Create Campaign (POST)...');
    const newCampaign = {
        provider_id: providerId,
        name: 'Test Campaign ' + Date.now(),
        start_date: new Date().toISOString(),
        variations: [
            { template_id: t1, traffic_weight: 50, url_slug: null },
            { template_id: t2, traffic_weight: 50, url_slug: null }
        ]
    };

    const createRes = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(newCampaign)
    });
    const createData = await createRes.json();

    if (!createRes.ok || !createData.success) {
        console.error('❌ Create failed:', createData);
        process.exit(1);
    }
    console.log('   ✅ Created campaign:', createData.campaign.id);
    const campaignId = createData.campaign.id;

    // 4. Test Get Campaigns (GET)
    console.log('\n2️⃣  Test: Get Campaigns (GET)...');
    const getRes = await fetch(API_BASE_URL, { headers });
    const getData = await getRes.json();

    if (!getRes.ok || !getData.success) {
        console.error('❌ Get failed:', getData);
        process.exit(1);
    }
    const found = getData.campaigns.find((c: any) => c.id === campaignId);
    if (!found) {
        console.error('❌ Created campaign not found in list');
        process.exit(1);
    }
    console.log('   ✅ Found campaign in list');

    // 5. Test Update Campaign (PUT)
    console.log('\n3️⃣  Test: Update Campaign (PUT)...');
    const updateRes = await fetch(`${API_BASE_URL}/${campaignId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'paused' })
    });
    const updateData = await updateRes.json();

    if (!updateRes.ok || !updateData.success) {
        console.error('❌ Update failed:', updateData);
        process.exit(1);
    }
    console.log('   ✅ Updated status:', updateData.campaign.status);

    // 6. Test Delete Campaign (DELETE)
    console.log('\n4️⃣  Test: Delete Campaign (DELETE)...');
    const deleteRes = await fetch(`${API_BASE_URL}/${campaignId}`, {
        method: 'DELETE',
        headers
    });
    const deleteData = await deleteRes.json();

    if (!deleteRes.ok || !deleteData.success) {
        console.error('❌ Delete failed:', deleteData);
        process.exit(1);
    }
    console.log('   ✅ Deleted campaign');

    console.log('\n🎉 A/B Testing API Tests Passed!');
}

main().catch(console.error);
