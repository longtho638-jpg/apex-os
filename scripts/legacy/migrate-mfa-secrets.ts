// scripts/migrate-mfa-secrets.ts
require('dotenv').config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '../src/lib/crypto/vault';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateSecrets() {
    console.log('🛡️ Starting MFA Secret Migration...');

    // 1. Fetch all admins with MFA enabled
    const { data: admins, error } = await supabase
        .from('admin_users')
        .select('id, email, mfa_secret')
        .not('mfa_secret', 'is', null);

    if (error) {
        console.error('❌ Error fetching admins:', error);
        return;
    }

    console.log(`Found ${admins.length} admin(s) with MFA secrets.`);

    let migratedCount = 0;

    for (const admin of admins) {
        const secret = admin.mfa_secret;

        // Check if already encrypted (contains colons)
        if (secret.includes(':')) {
            console.log(`✅ [${admin.email}] Already encrypted. Skipping.`);
            continue;
        }

        // Check if it looks like a plaintext secret (Base32, 32 chars)
        if (secret.length === 32) {
            console.log(`⚠️ [${admin.email}] Plaintext secret found! Encrypting...`);

            try {
                const encrypted = encrypt(secret);

                // Update DB
                const { error: updateError } = await supabase
                    .from('admin_users')
                    .update({ mfa_secret: encrypted })
                    .eq('id', admin.id);

                if (updateError) {
                    console.error(`❌ [${admin.email}] Failed to update DB:`, updateError);
                } else {
                    console.log(`✅ [${admin.email}] Successfully encrypted and saved.`);
                    migratedCount++;
                }
            } catch (err) {
                console.error(`❌ [${admin.email}] Encryption failed:`, err);
            }
        } else {
            console.warn(`❓ [${admin.email}] Unknown format (Length: ${secret.length}). Skipping.`);
        }
    }

    console.log('--- Migration Complete ---');
    console.log(`Total Migrated: ${migratedCount}`);
}

migrateSecrets();
