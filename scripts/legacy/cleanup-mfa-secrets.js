// Clean up invalid MFA secrets
// Run: node scripts/cleanup-mfa-secrets.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
    console.log('Cleaning up admin accounts with invalid MFA secrets...');

    const { data, error } = await supabase
        .from('admin_users')
        .update({
            mfa_enabled: false,
            mfa_secret: null
        })
        .not('mfa_secret', 'is', null)
        .select();

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log(`✅ Cleaned up ${data?.length || 0} admin account(s)`);
    console.log('All admins can now setup MFA fresh with correct encryption key');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /admin/security/mfa/setup');
    console.log('2. Generate new QR code');
    console.log('3. Scan with Google Authenticator');
    console.log('4. Verify with 6-digit code');
    console.log('');
    process.exit(0);
}

cleanup();
