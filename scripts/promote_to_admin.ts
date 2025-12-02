
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function promoteUser(email: string) {
  console.log(`🔍 Looking up user: ${email}...`);

  // 1. Find User by Email
  // Note: listUsers is not efficient for checking one user but works for admin scripts
  // Better: admin.listUsers() filter isn't powerful, so we just fetch all (limit 100) or use createUser to find ID?
  // Actually, we can't easily "find by email" without listing.
  // But wait, we can't update by email, we need ID.
  
  // Alternative: Since we are admin, we can just list users and find.
  // Try to list with pagination to be safer
  const { data: { users }, error: findError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
  });

  if (findError) {
    console.error('❌ Error finding users:', findError.message);
    console.error('   Details:', findError);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error(`❌ User with email ${email} not found!`);
    console.log('👉 Please Sign Up this user first via the website login page.');
    return;
  }

  console.log(`✅ Found User ID: ${user.id}`);
  console.log(`   Current Role: ${user.app_metadata.role || 'user'}`);

  // 2. Update User Role (app_metadata)
  // This is what the Middleware checks
  const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: { 
          ...user.app_metadata,
          role: 'super_admin', // The Highest Power
          is_admin: true 
      } 
    }
  );

  if (updateError) {
    console.error('❌ Failed to update user role:', updateError.message);
    return;
  }

  console.log('✨ SUCCESS! User promoted to SUPER_ADMIN.');
  console.log('   Role: super_admin');
  console.log('   Permissions: ALL ACCESS');

  // 3. (Optional) Sync to public table if you use one
  // Some apps use 'public.profiles' or 'public.users'
  const { error: publicError } = await supabaseAdmin
    .from('users') // or profiles
    .update({ role: 'admin' }) // public table usually just has 'admin'
    .eq('id', user.id);
    
  if (publicError) {
      // Ignore if table doesn't exist, just a warning
      console.warn('⚠️  Could not update public.users table (might not exist or different name). This is usually fine as Auth checks JWT.');
  } else {
      console.log('✅ Public profile updated.');
  }
}

// Run the script
const targetEmail = process.argv[2] || 'billwill.mentor@gmail.com';
promoteUser(targetEmail);
