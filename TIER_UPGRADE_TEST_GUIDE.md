# 🧪 TIER UPGRADE TEST GUIDE

## Step 1: Get Test User ID

**Run in Supabase SQL Editor:**

```sql
-- Find your test user
SELECT 
  id,
  email,
  subscription_tier,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

**Copy the `id` of user you want to upgrade.**

Example output:
```
id                                   | email              | subscription_tier | created_at
-------------------------------------|--------------------|--------------------|------------------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | test@example.com   | free               | 2024-11-20 08:00
```

**Copy this ID** → You'll need it for next step

---

## Step 2: Upgrade User to Founders

**Run in Supabase SQL Editor:**

```sql
-- Replace USER_ID with the ID you copied above
SELECT upgrade_user_to_founders(
  'USER_ID_HERE'::UUID,
  'test-tx-' || NOW()::text,
  99.00
);
```

**Example:**
```sql
SELECT upgrade_user_to_founders(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
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

✅ **If you see this → Upgrade successful!**
❌ **If error → Check user ID is correct**

---

## Step 3: Verify Upgrade

**Run in Supabase:**

```sql
-- Verify user is now founders
SELECT 
  u.email,
  u.subscription_tier,
  u.payment_tx_id,
  u.payment_verified,
  fc.slot_number,
  fc.claimed_at
FROM users u
LEFT JOIN founders_circle fc ON fc.user_id = u.id
WHERE u.subscription_tier = 'founders'
ORDER BY fc.slot_number DESC
LIMIT 5;
```

**Expected output:**
```
email            | subscription_tier | slot_number | claimed_at
-----------------|-------------------|-------------|--------------------
test@example.com | founders          | 88          | 2024-11-20 08:20
```

✅ **Confirms upgrade worked!**

---

## Step 4: Check Available Slots

```sql
SELECT get_available_founders_slots();
```

**Before upgrade:** 13
**After upgrade:** 12 ← Should decrease by 1

---

## Step 5: Test Frontend Dashboard

### Method 1: Login as upgraded user

1. Go to: http://localhost:3000/login
2. Login with upgraded user credentials
3. Dashboard should show:
   - ✅ Crown badge "Founders #88"
   - ✅ No upgrade banners
   - ✅ All metrics unlocked
   - ✅ Wolf Pack status panel
   - ✅ All sidebar menus visible

### Method 2: Mock tier in browser (Quick test)

```javascript
// Open browser console on dashboard:
localStorage.setItem('user', JSON.stringify({
  ...JSON.parse(localStorage.getItem('user')),
  tier: 'founders',
  slot: 88
}));
location.reload();
```

**Expected UI changes:**
- Upgrade banners disappear
- Crown badge appears
- Locked cards unlock
- Wolf Pack menu appears in sidebar

---

## Step 6: Test API Endpoint

```bash
# In terminal:
curl http://localhost:8000/api/v1/user/tier \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  | python3 -m json.tool
```

**Expected response:**
```json
{
  "tier": "founders",
  "is_founders": true,
  "slot_number": 88,
  "joined_at": "2024-11-20T08:20:00Z",
  "features": {
    "wolf_pack_agents": true,
    "real_time_sync": true,
    "ai_auditor": true,
    "risk_guardian": true,
    "unlimited_exchanges": true,
    "lifetime_data": true,
    "referral_commission": 20,
    "api_rate_limit": 1000,
    "export_formats": ["csv", "pdf", "excel", "tax"],
    "support_sla": "2h",
    "max_trade_history_days": -1
  }
}
```

---

## ✅ SUCCESS CHECKLIST

**Upgrade successful if:**

- ✅ Step 2 returns: `"success": true`
- ✅ Step 3 shows: `subscription_tier = 'founders'`
- ✅ Step 4 shows: 12 (decreased by 1)
- ✅ Step 5: Dashboard shows Founders UI
- ✅ Step 6: API returns `"tier": "founders"`

---

## 🔄 To Revert (If Needed)

```sql
-- Downgrade back to free
UPDATE users 
SET subscription_tier = 'free',
    payment_tx_id = NULL,
    payment_verified = FALSE
WHERE id = 'USER_ID_HERE';

-- Free up the slot
UPDATE founders_circle
SET user_id = NULL,
    tx_id = NULL,
    claimed_at = NOW()
WHERE user_id = 'USER_ID_HERE';
```

---

## 🎯 Quick Copy-Paste Commands

**1. Get user ID:**
```sql
SELECT id, email FROM users ORDER BY created_at DESC LIMIT 5;
```

**2. Upgrade (replace YOUR_USER_ID):**
```sql
SELECT upgrade_user_to_founders('YOUR_USER_ID'::UUID, 'test-tx-' || NOW()::text, 99.00);
```

**3. Verify:**
```sql
SELECT u.email, u.subscription_tier, fc.slot_number FROM users u LEFT JOIN founders_circle fc ON fc.user_id = u.id WHERE u.subscription_tier = 'founders';
```

**4. Check slots:**
```sql
SELECT get_available_founders_slots();
```

---

**Run these in order and report results!** 🧪
