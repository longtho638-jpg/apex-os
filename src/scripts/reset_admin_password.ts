import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase configuration. Check .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function resetAdminPassword() {
    const email = process.argv[2] || 'verified_tester_1763873096775@apex.com';
    const newPassword = process.argv[3] || 'Admin123!@#';

    console.log(`🔐 Starting password reset for: ${email}`);

    try {
        // Strategy 1: O(1) Lookup via public.users table
        // This is much faster than scanning auth.users
        console.log('🔍 Strategy 1: Checking public.users table...');
        const { data: publicUser } = await supabase
            .from('users')
            .select('user_id')
            .eq('email', email)
            .single();

        let userId = publicUser?.user_id;

        // Strategy 2: Fallback to Auth API Scan (if not in public.users)
        if (!userId) {
            console.log('⚠️ User not found in public.users. Falling back to Auth API scan...');
            userId = await findUserInAuth(email);
        }

        if (!userId) {
            console.error(`❌ User ${email} not found in system.`);
            return;
        }

        console.log(`✅ User found. ID: ${userId}`);

        // Update Password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (updateError) {
            throw new Error(`Failed to update password: ${updateError.message}`);
        }

        console.log('✅ Password updated successfully.');

        // Grant Admin Privileges
        await grantAdminPrivileges(userId, email);

        console.log('\n🎉 Success! Credentials:');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${newPassword}`);
        console.log(`   Login:    http://localhost:3000/login\n`);

    } catch (error) {
        console.error('❌ Operation failed:', error);
        process.exit(1);
    }
}

async function findUserInAuth(email: string): Promise<string | null> {
    let page = 1;
    const PER_PAGE = 50; // Increased batch size for performance
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: PER_PAGE
        });

        if (error) {
            console.error(`Error listing users (Page ${page}):`, error.message);
            return null;
        }

        const user = data.users.find(u => u.email === email);
        if (user) return user.id;

        if (data.users.length < PER_PAGE) {
            hasMore = false;
        } else {
            page++;
            console.log(`... scanned ${page * PER_PAGE} users ...`);
        }
    }
    return null;
}

async function grantAdminPrivileges(userId: string, email: string) {
    console.log('�️  Granting admin privileges...');

    // 1. Update public.users
    const { error: publicError } = await supabase
        .from('users')
        .upsert({
            user_id: userId,
            email: email,
            is_admin: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (publicError) console.warn('⚠️ Failed to update public.users:', publicError.message);
    else console.log('   - Updated public.users (is_admin=true)');

    // 2. Update admin_users (if table exists)
    const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
            id: userId,
            email: email,
            role: 'super_admin',
            created_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (adminError) {
        // Ignore error if table doesn't exist, but log it
        if (!adminError.message.includes('relation "admin_users" does not exist')) {
            console.warn('⚠️ Failed to update admin_users:', adminError.message);
        }
    } else {
        console.log('   - Updated admin_users (role=super_admin)');
    }
}

resetAdminPassword();
