import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    logger.error('❌ Missing Supabase keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
    const email = 'admin@apex.com';
    const password = 'Admin123!@#';

    logger.info('🔐 Creating admin user...');
    logger.info('Email:', email);
    logger.info('Password:', password);
    logger.info('');

    try {
        // Delete existing user if exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users.find(u => u.email === email);

        if (existing) {
            logger.info('🗑️  Deleting existing user:', existing.id);
            await supabase.auth.admin.deleteUser(existing.id);
        }

        // Create new admin user
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: 'Admin User',
                role: 'admin'
            }
        });

        if (error) {
            logger.error('❌ Error creating user:', error);
            return;
        }

        logger.info('✅ User created in Supabase Auth!');
        logger.info('User ID:', data.user.id);

        // Create entry in users table
        const { error: usersError } = await supabase
            .from('users')
            .upsert({
                user_id: data.user.id,
                email,
                is_admin: true,
                tier: 'FREE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (usersError) {
            logger.info('⚠️  Users table error (might not exist yet):', usersError.message);
        } else {
            logger.info('✅ Admin flag set in users table!');
        }

        // Try to create in admin_users table (if exists)
        const { error: adminError } = await supabase
            .from('admin_users')
            .upsert({
                id: data.user.id,
                email,
                password_hash: 'managed_by_auth', // Placeholder
                mfa_enabled: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'email'
            });

        if (adminError) {
            logger.info('⚠️  Admin users table error (might not exist yet):', adminError.message);
        } else {
            logger.info('✅ Entry created in admin_users table!');
        }

        logger.info('');
        logger.info('🎉 SUCCESS! You can now login with:');
        logger.info('');
        logger.info('📧 Email:', email);
        logger.info('🔑 Password:', password);
        logger.info('');
        logger.info('🌐 Login at: http://localhost:3000/login');
        logger.info('');
        logger.info('⚠️  If MFA screen appears, use code: 999999');

    } catch (error: any) {
        logger.error('❌ Unexpected error:', error);
        logger.error('Message:', error.message);
    }
}

createAdminUser();
