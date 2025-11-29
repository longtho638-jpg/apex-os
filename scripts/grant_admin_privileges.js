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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function grantAdmin() {
    const email = 'billlwill.mentor@gmail.com';
    console.log(`👑 Granting HIGHEST PRIVILEGES to: ${email}`);

    try {
        // 1. Find user in auth.users
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Error listing users:', error.message);
            return;
        }

        const users = data.users;
        const user = users.find(u => u.email === email);

        if (!user) {
            console.error('❌ User not found in auth.users. Please sign up first.');
            return;
        }

        console.log('✅ User found:', user.id);

        // 2. Update auth.users metadata
        const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            {
                user_metadata: {
                    ...user.user_metadata,
                    role: 'admin',
                    is_super_admin: true
                },
                app_metadata: {
                    ...user.app_metadata,
                    role: 'admin',
                    claims_admin: true
                }
            }
        );

        if (updateError) {
            console.error('❌ Error updating auth metadata:', updateError.message);
        } else {
            console.log('✅ Auth metadata updated (role: admin)');
        }

        // 3. Update public.users (is_admin = true)
        const { error: publicError } = await supabase
            .from('users')
            .update({ is_admin: true, tier: 'LIFETIME_ACCESS' })
            .eq('id', user.id);

        if (publicError) {
            console.error('❌ Error updating public.users:', publicError.message);
        } else {
            console.log('✅ public.users updated (is_admin: true)');
        }

        // 4. Create/Update public.admin_users
        const { error: adminTableError } = await supabase
            .from('admin_users')
            .upsert({
                id: user.id,
                email: email,
                password_hash: 'managed_by_auth',
                mfa_enabled: true,
                role: 'super_admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (adminTableError) {
            console.log('⚠️  Error updating admin_users (table might not exist):', adminTableError.message);
        } else {
            console.log('✅ public.admin_users updated (role: super_admin)');
        }

        console.log('');
        console.log('🎉 SUCCESS! User now has GOD MODE privileges.');

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

grantAdmin();
