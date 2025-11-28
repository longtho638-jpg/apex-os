# ✅ MIGRATION VERIFICATION CHECKLIST

## 🎯 Run These Queries in Supabase SQL Editor

**Open:** https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql

---

### Query 1: Check Available Founders Slots ⭐ MOST IMPORTANT

```sql
SELECT get_available_founders_slots();
```

**Expected Result:**
```
available_slots
---------------
13
```

✅ If you see **13** → Migration SUCCESS!
❌ If error → Migration might have failed

---

### Query 2: Verify All Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('founders_circle', 'payment_verifications', 'referrals', 'referral_earnings')
ORDER BY table_name;
```

**Expected Result:** (4 rows)
```
table_name
---------------------
founders_circle
payment_verifications
referral_earnings
referrals
```

---

### Query 3: Check Users Table New Columns

```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_tier', 'subscription_expires_at', 'payment_tx_id', 'payment_verified', 'joined_at')
ORDER BY column_name;
```

**Expected Result:** (5 rows)
```
column_name              | data_type
-------------------------|------------------
joined_at                | timestamp with timezone
payment_tx_id            | character varying
payment_verified         | boolean
subscription_expires_at  | timestamp with timezone
subscription_tier        | character varying
```

---

### Query 4: Verify Founders Slots Distribution

```sql
SELECT 
  COUNT(*) as total_slots,
  COUNT(user_id) as claimed_slots,
  COUNT(*) - COUNT(user_id) as available_slots
FROM founders_circle;
```

**Expected Result:**
```
total_slots | claimed_slots | available_slots
------------|---------------|----------------
100         | 87            | 13
```

---

### Query 5: Test Upgrade Function (Dry Run)

```sql
-- This will show the function exists and works
SELECT proname, proargnames, prosrc 
FROM pg_proc 
WHERE proname = 'upgrade_user_to_founders';
```

**Expected:** Should return 1 row showing the function details

---

## 🧪 OPTIONAL: Test Tier Upgrade (If You Have a Test User)

```sql
-- Replace with your actual test user ID
SELECT upgrade_user_to_founders(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test-tx-' || NOW()::text,
  99.00
);
```

**Expected Success Response:**
```json
{
  "success": true,
  "slot_number": 88,
  "message": "Welcome to Founders Circle!"
}
```

**To verify the upgrade worked:**
```sql
SELECT 
  u.email,
  u.subscription_tier,
  fc.slot_number,
  fc.claimed_at
FROM users u
LEFT JOIN founders_circle fc ON fc.user_id = u.id
WHERE u.id = '00000000-0000-0000-0000-000000000000'::UUID;
```

---

## ✅ SUCCESS CRITERIA

**Migration is successful if:**
- ✅ Query 1 returns: **13**
- ✅ Query 2 returns: **4 tables**
- ✅ Query 3 returns: **5 columns**
- ✅ Query 4 returns: **100/87/13**

**If ALL pass → Migration 100% successful!** 🎉

**If ANY fail → Let me know which query failed**

---

## 🔄 After Verification Success

**Test the backend API:**
```bash
# In terminal:
curl http://localhost:8000/api/v1/user/tier \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  | python3 -m json.tool
```

**Expected:** API now queries Supabase (might still show 'free' if user not upgraded)

**Refresh frontend:**
```
http://localhost:3000/dashboard
```

**Expected:** No changes for free users (already working), but backend now uses real database

---

**Run these queries now and let me know the results!** 📊
