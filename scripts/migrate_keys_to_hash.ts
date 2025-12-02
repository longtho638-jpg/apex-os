import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { hash } from 'bcrypt'; // Ensure you have @types/bcrypt and bcrypt installed, or use bcryptjs
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') }); 
// Fallback to .env if .env.local doesn't exist
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateApiKeys() {
  console.log('🔐 Starting API Key Migration (Hashing Secrets)...');

  // 1. Fetch keys that haven't been hashed yet
  // We look for records where hashed_secret is NULL but secret_key is NOT NULL
  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, secret_key')
    .is('hashed_secret', null)
    .not('secret_key', 'is', null);

  if (error) {
    console.error('Error fetching api_keys:', error);
    return;
  }

  if (!keys || keys.length === 0) {
    console.log('✅ No unhashed keys found. Migration complete or not needed.');
    return;
  }

  console.log(`Found ${keys.length} keys to migrate.`);

  let successCount = 0;
  let failCount = 0;

  // 2. Iterate and Hash
  for (const key of keys) {
    try {
      // Hash the plain text secret
      // Salt rounds = 10 is standard
      const hashed = await hash(key.secret_key, 10);

      // Update the record
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ hashed_secret: hashed })
        .eq('id', key.id);

      if (updateError) {
        console.error(`Failed to update key ${key.id}:`, updateError.message);
        failCount++;
      } else {
        console.log(`Migrated key ${key.id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`Exception processing key ${key.id}:`, err);
      failCount++;
    }
  }

  console.log('------------------------------------------------');
  console.log(`Migration Finished.`);
  console.log(`✅ Successfully hashed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('------------------------------------------------');
  console.log('NOTE: After verifying functionality, you should create a migration to DROP the "secret_key" column.');
}

migrateApiKeys().catch(console.error);
