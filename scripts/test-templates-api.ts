
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
const API_BASE_URL = 'http://localhost:3000/api/v1/admin/templates';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !JWT_SECRET) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log('🚀 Starting Templates API Tests...\n');

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

    // 2. Test Create Template (POST)
    console.log('\n1️⃣  Test: Create Template (POST)...');
    const newTemplate = {
        name: 'Test Template ' + Date.now(),
        description: 'Automated test template',
        html_content: '<h1>Hello {{provider_name}}</h1>',
        is_active: true
    };

    const createRes = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(newTemplate)
    });
    const createData = await createRes.json();

    if (!createRes.ok || !createData.success) {
        console.error('❌ Create failed:', createData);
        process.exit(1);
    }
    console.log('   ✅ Created template:', createData.template.id);
    const templateId = createData.template.id;

    // 3. Test Get Template (GET)
    console.log('\n2️⃣  Test: Get Template (GET)...');
    const getRes = await fetch(`${API_BASE_URL}/${templateId}`, { headers });
    const getData = await getRes.json();

    if (!getRes.ok || !getData.success) {
        console.error('❌ Get failed:', getData);
        process.exit(1);
    }
    console.log('   ✅ Retrieved template:', getData.template.name);

    // 4. Test Update Template (PUT)
    console.log('\n3️⃣  Test: Update Template (PUT)...');
    const updateRes = await fetch(`${API_BASE_URL}/${templateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: 'Updated Name' })
    });
    const updateData = await updateRes.json();

    if (!updateRes.ok || !updateData.success) {
        console.error('❌ Update failed:', updateData);
        process.exit(1);
    }
    console.log('   ✅ Updated name:', updateData.template.name);

    // 5. Test Delete Template (DELETE)
    console.log('\n4️⃣  Test: Delete Template (DELETE)...');
    const deleteRes = await fetch(`${API_BASE_URL}/${templateId}`, {
        method: 'DELETE',
        headers
    });
    const deleteData = await deleteRes.json();

    if (!deleteRes.ok || !deleteData.success) {
        console.error('❌ Delete failed:', deleteData);
        process.exit(1);
    }
    console.log('   ✅ Deleted template');

    console.log('\n🎉 Templates API Tests Passed!');
}

main().catch(console.error);
