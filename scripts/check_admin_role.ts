const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key prefix:', supabaseServiceKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUser() {
    const email = 'billlwill.mentor@gmail.com';
    console.log(`Checking user: ${email}`);

    try {
        // Check auth.users
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Error listing users from auth:', error.message);
        } else {
            const users = data.users;
            const user = users.find(u => u.email === email);

            if (user) {
                console.log('--- User found in auth.users ---');
                console.log('ID:', user.id);
                console.log('Role (auth):', user.role);
                console.log('App Metadata:', user.app_metadata);
                console.log('User Metadata:', user.user_metadata);

                // Check public tables using ID
                await checkPublicTables(user.id);
                return;
            } else {
                console.log('User not found in auth.users list.');
            }
        }
    } catch (e) {
        console.error('Exception checking auth:', e);
    }

    // Fallback: Try to find by email in public tables (if email column exists)
    console.log('--- Attempting to query public tables by email (if supported) ---');
    // This is a guess, might fail if column doesn't exist
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (profile) {
            console.log('User found in public.profiles by email:', profile);
        } else {
            // Try users table
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (user) {
                console.log('User found in public.users by email:', user);
            } else {
                console.log('User not found in public tables by email.');
            }
        }
    } catch (e) {
        console.log('Error querying public tables by email:', e.message);
    }
}

async function checkPublicTables(userId) {
    console.log(`--- Checking public tables for ID: ${userId} ---`);

    // Check public.users
    const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (publicUser) {
        console.log('User found in public.users:', publicUser);
    } else {
        console.log('User not found in public.users:', publicError?.message);
    }

    // Check public.profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profile) {
        console.log('User found in public.profiles:', profile);
    } else {
        console.log('User not found in public.profiles:', profileError?.message);
    }
}

checkUser();
