import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logger } from '@/lib/logger';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  logger.error('❌ Missing Supabase keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function disableMFA() {
  const email = process.argv[2] || 'verified_tester_1763873096775@apex.com';

  logger.info('🔓 Disabling MFA for:', email);

  try {
    // Check if admin_users table exists and disable MFA there
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (adminUser) {
      logger.info('✅ Found in admin_users table');

      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          mfa_enabled: false,
          mfa_secret: null,
          mfa_recovery_codes: null,
        })
        .eq('email', email);

      if (updateError) {
        logger.error('❌ Error updating admin_users:', updateError);
      } else {
        logger.info('✅ MFA disabled in admin_users table');
      }
    } else if (adminError && !adminError.message.includes('does not exist')) {
      logger.error('❌ Error checking admin_users:', adminError);
    }

    // Also check users table
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      logger.error('❌ Error listing users:', listError);
      return;
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      logger.error('❌ User not found in auth:', email);
      return;
    }

    logger.info('✅ User found in auth:', user.id);

    // Update users table to disable MFA
    const { error: usersUpdateError } = await supabase
      .from('users')
      .update({
        mfa_enabled: false,
      })
      .eq('user_id', user.id);

    if (!usersUpdateError) {
      logger.info('✅ MFA disabled in users table');
    }

    logger.info('');
    logger.info('✅ MFA COMPLETELY DISABLED!');
    logger.info('');
    logger.info('📝 You can now login with:');
    logger.info(`   Email: ${email}`);
    logger.info('   Password: password123');
    logger.info('');
    logger.info('🌐 Go to: http://localhost:3000/login');
    logger.info('');
    logger.info('⚠️  You should be redirected directly to dashboard (no MFA screen)');
  } catch (error) {
    logger.error('❌ Unexpected error:', error);
  }
}

disableMFA();
