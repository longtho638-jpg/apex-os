# 🚀 COMPLETE DATABASE MIGRATION GUIDE

## Overview

ApexOS has 3 migration files to run in order:

1. **master_migration.sql** - Core tables (users, exchanges, trades, etc.)
2. **tier_migration.sql** - Tier system (founders_circle, payments, referrals)
3. **rls_policies.sql** - Row Level Security policies

---

## Quick Deploy (Recommended)

### Step 1: Copy All Migrations

```bash
# Copy all 3 files concatenated
cat backend/database/master_migration.sql \
    backend/database/tier_migration.sql \
    backend/database/rls_policies.sql \
    | pbcopy
```

### Step 2: Paste & Run in Supabase

1. Open: https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql
2. Paste the SQL (CMD+V)
3. Run (CMD+Enter)
4. Wait for "Success" message

**Time:** 1-2 minutes total

---

## Detailed Deploy (Step-by-Step)

### Migration 1: Core Schema

**File:** `backend/database/master_migration.sql`

**Creates:**
- `users` table
- `exchange_connections` table
- `portfolio_snapshots` table
- `guardian_alerts` table
- `agent_logs` table
- `trade_history` table
- `sync_jobs` table

**Run:**
```bash
cat backend/database/master_migration.sql | pbcopy
# Paste in Supabase SQL Editor → Run
```

---

### Migration 2: Tier System

**File:** `backend/database/tier_migration.sql`

**Creates:**
- `founders_circle` table (100 slots)
- `payment_verifications` table
- `referrals` table
- `referral_earnings` table
- Adds columns to `users` table:
  - `subscription_tier`
  - `subscription_expires_at`
  - `payment_tx_id`
  - `payment_verified`
  - `joined_at`

**Functions:**
- `get_available_founders_slots()` → Returns remaining slots
- `upgrade_user_to_founders(user_id, tx_id, amount)` → Upgrades user

**Seed Data:**
- 87 demo Founders slots (13 real slots available)

**Run:**
```bash
cat backend/database/tier_migration.sql | pbcopy
# Paste in Supabase SQL Editor → Run
```

---

### Migration 3: RLS Policies

**File:** `backend/database/rls_policies.sql`

**Applies to:**
- users
- exchange_connections
- portfolio_snapshots
- guardian_alerts
- agent_logs
- trade_history
- sync_jobs

**Policies:** Each table gets 4 policies (SELECT, INSERT, UPDATE, DELETE)
**Restriction:** Users can only access their own data (`auth.uid() = user_id`)

**Run:**
```bash
cat backend/database/rls_policies.sql | pbcopy
# Paste in Supabase SQL Editor → Run
```

---

## Verification

### After Running All Migrations:

**Check tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output:** (11 tables)
```
agent_logs
exchange_connections
founders_circle
guardian_alerts
payment_verifications
portfolio_snapshots
referral_earnings
referrals
sync_jobs
trade_history
users
```

**Check tier system:**
```sql
-- Should return: 13
SELECT get_available_founders_slots();

-- Should return: 5 columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_tier', 'subscription_expires_at', 'payment_tx_id', 'payment_verified', 'joined_at');
```

**Check RLS enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'exchange_connections', 'portfolio_snapshots', 'guardian_alerts', 'agent_logs', 'trade_history', 'sync_jobs');
```

**Expected:** All should show `rowsecurity = true`

---

## Automated Testing

### After migrations are deployed:

**Run auto test:**
```bash
python3 backend/scripts/test_tier_upgrade.py
```

**Expected output:**
```
✅ User updated to Founders tier
✅ Founders slot #88 claimed
✅ All tests passed!
```

**Verify frontend:**
```bash
# Open dashboard
open http://localhost:3000/dashboard

# Expected: Founders UI if user was upgraded
```

---

## Rollback (If Needed)

### Drop all tier tables:
```sql
DROP TABLE IF EXISTS referral_earnings CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS payment_verifications CASCADE;
DROP TABLE IF EXISTS founders_circle CASCADE;

-- Remove tier columns from users
ALTER TABLE users 
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS subscription_expires_at,
  DROP COLUMN IF EXISTS payment_tx_id,
  DROP COLUMN IF EXISTS payment_verified,
  DROP COLUMN IF EXISTS joined_at;
```

### Drop all policies:
```sql
-- Get all policy names
SELECT 'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';'
FROM pg_policies
WHERE schemaname = 'public';

-- Copy output and run
```

### Disable RLS:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs DISABLE ROW LEVEL SECURITY;
```

---

## Migration Order Summary

```
1. master_migration.sql       (Core schema)
         ↓
2. tier_migration.sql         (Monetization)
         ↓
3. rls_policies.sql           (Security)
         ↓
4. test_tier_upgrade.py       (Verification)
         ↓
5. Frontend works! 🎉
```

---

## Quick Commands

**All-in-one deploy:**
```bash
cat backend/database/master_migration.sql \
    backend/database/tier_migration.sql \
    backend/database/rls_policies.sql \
    | pbcopy

open "https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql"
# Paste & Run
```

**Verify:**
```sql
SELECT get_available_founders_slots();
```

**Test:**
```bash
python3 backend/scripts/test_tier_upgrade.py
```

---

## Files Reference

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `master_migration.sql` | Core tables | ~80 | ✅ Ready |
| `tier_migration.sql` | Tier system | 257 | ✅ Ready |
| `rls_policies.sql` | Security | 240 | ✅ Ready |
| `test_tier_upgrade.py` | Auto test | 200 | ✅ Ready |

**Total:** ~780 lines of production SQL

---

**Ready to deploy? Just run the Quick Commands above!** 🚀
