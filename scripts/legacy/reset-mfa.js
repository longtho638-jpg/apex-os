// Quick script to reset MFA for testing
// Run: node scripts/reset-mfa.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetMFA() {
    const email = 'verified_tester_1763873096775@apex.com';

    console.log(`Resetting MFA for ${email}...`);

    const { data, error } = await supabase
        .from('admin_users')
        .update({
            mfa_enabled: false,
            mfa_secret: null
        })
        .eq('email', email)
        .select();

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log('✅ MFA reset successfully!');
    console.log('Updated rows:', data);
    process.exit(0);
}

resetMFA();
