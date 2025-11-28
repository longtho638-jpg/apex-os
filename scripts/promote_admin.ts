
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promoteToSuperAdmin(email: string) {
    console.log(`Searching for user with email: ${email}...`);

    // 1. Find user by email
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();

    if (searchError) {
        console.error('Error listing users:', searchError);
        return;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
        console.error(`User not found: ${email}`);
        console.log('Available users:', users.users.map(u => u.email).join(', '));
        return;
    }

    console.log(`Found user: ${user.id} (${user.email})`);

    // 2. Update public.users table
    const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'super_admin', tier: 'founder' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating public.users:', updateError);
    } else {
        console.log(`✅ Successfully promoted ${email} to super_admin in public.users`);
    }

    // 3. Update auth.users metadata (optional but good for sync)
    const { error: metaError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { role: 'super_admin' } }
    );

    if (metaError) {
        console.error('Error updating auth metadata:', metaError);
    } else {
        console.log(`✅ Successfully updated auth metadata for ${email}`);
    }
}

// Get email from command line arg
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.log('Usage: npx ts-node scripts/promote_admin.ts <email>');
    console.log('Listing all users to help you find the target...');

    supabase.auth.admin.listUsers().then(({ data, error }) => {
        if (error) console.error(error);
        else {
            console.log('\n--- Registered Users ---');
            data.users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
            console.log('------------------------\n');
        }
    });
} else {
    promoteToSuperAdmin(targetEmail);
}
