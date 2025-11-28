// Reset admin password
// Run: node scripts/reset-admin-password.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function resetPassword() {
    const email = 'verified_tester_1763873096775@apex.com';
    const newPassword = 'Admin123!@#';

    console.log(`Resetting password for ${email}...`);
    console.log(`New password: ${newPassword}`);

    try {
        // Use Supabase Admin API to update user password
        const { data, error } = await supabase.auth.admin.updateUserById(
            '9c2000e4-c75a-4bdc-86b1-1c93bbda8872', // user ID from previous reset
            { password: newPassword }
        );

        if (error) {
            console.error('Error:', error);
            process.exit(1);
        }

        console.log('✅ Password reset successfully!');
        console.log('');
        console.log('Login credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('');
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

resetPassword();
