# Copy Trading Schema Fix - Critical Issue

## Problem Discovered
Schema has 2 foreign key constraints causing seeding to fail:

1. **`copy_leaders.user_id` → `auth.users(id)`**
   - Mock UUIDs don't exist in auth.users
   - MUST use real user IDs

2. **`copy_settings.leader_id` → `copy_leaders(id)`** ⚠️ WRONG!
   - Should reference `copy_leaders.user_id`
   - Current schema creates duplicate ID confusion

## Solution Options

### Option A: Use Real Users (Recommended)
**Step 1:** Get existing user IDs
```sql
SELECT id, email FROM auth.users LIMIT 10;
```

**Step 2:** Use those IDs for leaders
```sql
-- Replace with YOUR real user IDs
INSERT INTO copy_leaders (user_id, display_name, description, total_pnl, win_rate, total_trades, active_followers)
VALUES 
  ('<YOUR_USER_ID_1>', 'Whale Hunter', 'Large-cap specialist', 45230.50, 78.3, 152, 847),
  ('<YOUR_USER_ID_2>', 'Altcoin King', 'Bottom fishing expert', 28900.25, 65.1, 89, 523),
  ('<YOUR_USER_ID_3>', 'Bot Master', 'Algorithmic strategies', 19450.00, 85.4, 890, 312);
```

### Option B: Create Dummy Auth Users (Quickest)
```sql
-- WARNING: May not work if auth.users is managed by Supabase Auth
-- Only works if you have direct access to auth schema

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'whale@demo.apex-os.com',
    '$2a$10$DEMO_HASH_NOT_REAL',
    NOW(),
    NOW(),
    NOW()
  ),
  -- Repeat for user 2 and 3
  ...
ON CONFLICT (id) DO NOTHING;
```

### Option C: Fix Schema (Best Long-term)

**Change 1:** Remove user_id FK from copy_leaders
```sql
-- Make copy_leaders independent (no FK to auth.users)
ALTER TABLE copy_leaders DROP CONSTRAINT IF EXISTS copy_leaders_user_id_fkey;

-- Now user_id is just a UUID field, not a foreign key
```

**Change 2:** Fix copy_settings FK
```sql
-- Change leader_id to reference user_id instead of id
ALTER TABLE copy_settings DROP CONSTRAINT copy_settings_leader_id_fkey;
ALTER TABLE copy_settings 
  ADD CONSTRAINT copy_settings_leader_id_fkey 
  FOREIGN KEY (leader_id) REFERENCES copy_leaders(user_id);
```

**Change 3:** Use mock UUIDs freely
```sql
INSERT INTO copy_leaders (user_id, display_name, ...)
VALUES ('00000000-0000-0000-0000-000000000001', ...);
```

## Recommended Approach

**For Demo/Development:**
- Use Option C (remove FK constraints)
- Allows mock data without real users

**For Production:**
- Use Option A (real users)
- Maintain data integrity

## Quick Fix Commands

### If choosing Option C (Remove FK):
```sql
-- 1. Drop the FK constraint
ALTER TABLE copy_leaders DROP CONSTRAINT IF EXISTS copy_leaders_user_id_fkey;

-- 2. Insert mock leaders (now works!)
INSERT INTO copy_leaders (user_id, display_name, description, total_pnl, win_rate, total_trades, active_followers)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Whale Hunter', 'Large-cap specialist', 45230.50, 78.3, 152, 847),
  ('00000000-0000-0000-0000-000000000002', 'Altcoin King', 'Bottom fishing', 28900.25, 65.1, 89, 523),
  ('00000000-0000-0000-0000-000000000003', 'Bot Master', 'Algorithmic', 19450.00, 85.4, 890, 312);

-- 3. Test copy trading!
```

---

**Choose your option and run the SQL!**
