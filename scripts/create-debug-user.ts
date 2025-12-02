
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createTestUser() {
    const email = 'debug_agent@apex.com';
    const password = 'Password123!';

    console.log(`Creating test user: ${email}`);

    // 1. Delete if exists (cleanup)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
        console.log('Found existing user, deleting...');
        await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // 2. Create new user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Debug Agent' }
    });

    if (error) {
        console.error('❌ Failed to create user:', error.message);
        process.exit(1);
    }

    console.log('✅ User created successfully');
    console.log(`   ID: ${data.user.id}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
}

createTestUser();
