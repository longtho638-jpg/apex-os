
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createVerifiedUser() {
    const timestamp = Date.now();
    const email = `verified_tester_${timestamp}@apex.com`;
    const password = 'password123';

    console.log(`Creating user: ${email}`);
    console.log(`URL: ${supabaseUrl}`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Verified Tester' }
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data.user.id);
        console.log('Credentials:', { email, password });
    }
}

createVerifiedUser();
