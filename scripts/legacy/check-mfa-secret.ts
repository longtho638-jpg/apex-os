// scripts/check-mfa-secret.ts
require('dotenv').config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL = 'verified_tester_1763873096775@apex.com';

async function checkMFASecret() {
    console.log(`Checking MFA secret for: ${EMAIL}`);

    const { data: admin, error } = await supabase
        .from('admin_users')
        .select('mfa_secret')
        .eq('email', EMAIL)
        .single();

    if (error || !admin) {
        console.error('❌ Error fetching admin:', error);
        return;
    }

    const secret = admin.mfa_secret;
    console.log('--- Secret Analysis ---');

    if (!secret) {
        console.log('❌ No secret found (NULL)');
        return;
    }

    console.log(`Raw Value: ${secret}`);

    if (secret.includes(':')) {
        const parts = secret.split(':');
        if (parts.length === 4) {
            console.log('✅ FORMAT: Encrypted (AES-256-GCM)');
            console.log(`   - Salt: ${parts[0].substring(0, 10)}...`);
            console.log(`   - IV: ${parts[1].substring(0, 10)}...`);
            console.log(`   - Tag: ${parts[2].substring(0, 10)}...`);
            console.log(`   - Cipher: ${parts[3].substring(0, 10)}...`);
        } else {
            console.log('⚠️ FORMAT: Unknown (Contains colons but not 4 parts)');
        }
    } else {
        if (secret.length === 32) {
            console.log('❌ FORMAT: Plaintext (Base32, 32 chars)');
            console.log('⚠️ SECURITY RISK: Secret is NOT encrypted!');
        } else {
            console.log(`⚠️ FORMAT: Unknown (Length: ${secret.length})`);
        }
    }
}

checkMFASecret();
