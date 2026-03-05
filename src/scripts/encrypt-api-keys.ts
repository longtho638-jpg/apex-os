import path from 'node:path';
import dotenv from 'dotenv';
import { logger } from '@/lib/logger';
import { encrypt, isEncrypted } from '@/lib/security/encryption';
import { getSupabaseClient } from '@/lib/supabase';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateApiKeys() {
  logger.info('🔒 Starting API Key Encryption Migration...');

  if (!process.env.SUPABASE_JWT_SECRET) {
    logger.error('❌ SUPABASE_JWT_SECRET is missing. Cannot encrypt.');
    process.exit(1);
  }

  const supabase = getSupabaseClient();

  // 1. Fetch all keys
  const { data: keys, error } = await supabase.from('api_keys').select('id, secret_key, access_key');

  if (error) {
    logger.error('❌ Error fetching keys:', error);
    return;
  }

  if (!keys || keys.length === 0) {
    logger.info('ℹ️ No API keys found to migrate.');
    return;
  }

  logger.info(`ℹ️ Found ${keys.length} keys. Checking encryption status...`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const key of keys) {
    // Check if already encrypted
    if (isEncrypted(key.secret_key)) {
      logger.info(`⏩ Key ${key.access_key.slice(0, 8)}... is already encrypted. Skipping.`);
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
        logger.error(`❌ Failed to update key ${key.id}:`, updateError);
        errorCount++;
      } else {
        logger.info(`✅ Encrypted key ${key.access_key.slice(0, 8)}...`);
        updatedCount++;
      }
    } catch (e) {
      logger.error(`❌ Exception encrypting key ${key.id}:`, e);
      errorCount++;
    }
  }

  logger.info('\n📊 Migration Summary:');
  logger.info(`   ✅ Updated: ${updatedCount}`);
  logger.info(`   ⏩ Skipped: ${skippedCount}`);
  logger.info(`   ❌ Errors:  ${errorCount}`);
}

migrateApiKeys().catch(console.error);
