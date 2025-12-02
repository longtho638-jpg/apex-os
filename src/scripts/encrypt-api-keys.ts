import { getSupabaseClient } from '@/lib/supabase';
import { encrypt, isEncrypted } from '@/lib/security/encryption';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateApiKeys() {
    console.log('🔒 Starting API Key Encryption Migration...');

    if (!process.env.SUPABASE_JWT_SECRET) {
        console.error('❌ SUPABASE_JWT_SECRET is missing. Cannot encrypt.');
        process.exit(1);
    }

    const supabase = getSupabaseClient();

    // 1. Fetch all keys
    const { data: keys, error } = await supabase
        .from('api_keys')
        .select('id, secret_key, access_key');

    if (error) {
        console.error('❌ Error fetching keys:', error);
        return;
    }

    if (!keys || keys.length === 0) {
        console.log('ℹ️ No API keys found to migrate.');
        return;
    }

    console.log(`ℹ️ Found ${keys.length} keys. Checking encryption status...`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const key of keys) {
        // Check if already encrypted
        if (isEncrypted(key.secret_key)) {
            console.log(`⏩ Key ${key.access_key.slice(0, 8)}... is already encrypted. Skipping.`);
            skippedCount++;
            continue;
        }

        try {
            // Encrypt
            const encryptedSecret = encrypt(key.secret_key);

            // Update DB
            const { error: updateError } = await supabase
                .from('api_keys')
                .update({ secret_key: encryptedSecret })
                .eq('id', key.id);

            if (updateError) {
                console.error(`❌ Failed to update key ${key.id}:`, updateError);
                errorCount++;
            } else {
                console.log(`✅ Encrypted key ${key.access_key.slice(0, 8)}...`);
                updatedCount++;
            }
        } catch (e) {
            console.error(`❌ Exception encrypting key ${key.id}:`, e);
            errorCount++;
        }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏩ Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors:  ${errorCount}`);
}

migrateApiKeys().catch(console.error);
