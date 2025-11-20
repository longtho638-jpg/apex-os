# 🚀 Supabase Migration Deployment Guide

## Quick Deploy (Manual - RECOMMENDED)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql
2. Click **"New Query"**

### Step 2: Copy Migration SQL

```bash
# Copy the migration file content
cat backend/database/tier_migration.sql | pbcopy
```

Or open the file and copy manually:
`backend/database/tier_migration.sql`

### Step 3: Paste & Run

1. Paste the SQL into the editor
2. Click **"Run"** button (or CMD+Enter)
3. Wait for success message

### Step 4: Verify

Run this query to verify:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('founders_circle', 'payment_verifications', 'referrals', 'referral_earnings');

-- Check available slots
SELECT get_available_founders_slots();

-- Check if users table has new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_tier', 'subscription_expires_at', 'payment_tx_id');
```

Expected output:
- 4 tables listed
- Available slots: 13
- 3 columns listed

---

## Alternative: CLI Deploy (If you have Supabase CLI)

```bash
# Install Supabase CLI (if not installed)
brew install supabase/tap/supabase

# Login
supabase login

# Link project
supabase link --project-ref ryvpqbuftmlsynmajecx

# Deploy migration
supabase db push backend/database/tier_migration.sql

# Verify
supabase db execute "SELECT get_available_founders_slots();"
```

---

## After Deployment

### Test the endpoint:

```bash
# Test /user/tier endpoint
curl http://localhost:8000/api/v1/user/tier \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  | python3 -m json.tool

# Expected: tier should now come from database
```

### Test tier upgrade:

```sql
-- In Supabase SQL Editor, upgrade a test user:
SELECT upgrade_user_to_founders(
  'YOUR_USER_ID'::UUID,
  'test-tx-' || NOW(),
  99.00
);

-- Check result
SELECT 
  u.email,
  u.subscription_tier,
  fc.slot_number
FROM users u
LEFT JOIN founders_circle fc ON fc.user_id = u.id
WHERE u.subscription_tier = 'founders';
```

---

## Troubleshooting

**Error: "relation does not exist"**
- Make sure you're running the query in the correct database
- Check that you pasted the ENTIRE migration file

**Error: "column already exists"**
- Migration was already run partially
- Safe to re-run (uses `IF NOT EXISTS`)

**Error: "permission denied"**
- You might need to use the service role key
- Check RLS policies in Supabase dashboard

---

## Quick Verification Checklist

After running migration, verify:

- [ ] `founders_circle` table exists with 100 rows
- [ ] `payment_verifications` table exists
- [ ] `referrals` table exists
- [ ] `referral_earnings` table exists
- [ ] `users` table has `subscription_tier` column
- [ ] Function `get_available_founders_slots()` returns 13
- [ ] Function `upgrade_user_to_founders()` exists

---

**Ready? Follow Step 1-4 above to deploy!** ✅
