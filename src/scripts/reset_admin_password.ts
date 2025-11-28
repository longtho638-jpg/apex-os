import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetAdminPassword() {
    const email = process.argv[2] || 'verified_tester_1763873096775@apex.com';
    const newPassword = process.argv[3] || 'Admin123!@#';

    console.log('🔐 Resetting password for:', email);
    console.log('🔑 New password:', newPassword);

    try {
        // Get user by email
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('❌ Error listing users:', listError);
            return;
        }

        const user = users.users.find(u => u.email === email);

        if (!user) {
            console.error('❌ User not found:', email);
            console.log('📋 Available users:');
            users.users.slice(0, 5).forEach(u => {
                console.log(`   - ${u.email}`);
            });
            return;
        }

        console.log('✅ User found:', user.id);

        // Update password
        const { data, error } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (error) {
            console.error('❌ Error updating password:', error);
        } else {
            console.log('✅ Password updated successfully!');
            console.log('');
            console.log('📝 Login Credentials:');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${newPassword}`);
            console.log('');
            console.log('🌐 Login at: http://localhost:3000/login');
        }

        // Also update users table (set is_admin flag)
        const { error: updateError } = await supabase
            .from('users')
            .upsert({
                user_id: user.id,
                email,
                is_admin: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (!updateError) {
            console.log('✅ Admin flag set in users table');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

resetAdminPassword();
