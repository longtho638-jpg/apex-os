import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/lib/logger';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  logger.error('Missing Supabase keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createVerifiedUser() {
  const timestamp = Date.now();
  const email = `verified_tester_${timestamp}@apex.com`;
  const password = 'password123';

  logger.info(`Creating user: ${email}`);
  logger.info(`URL: ${supabaseUrl}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Verified Tester' },
  });

  if (error) {
    logger.error('Error creating user:', error);
  } else {
    logger.info('User created successfully:', data.user.id);
    logger.info('Credentials:', { email, password });
  }
}

createVerifiedUser();
