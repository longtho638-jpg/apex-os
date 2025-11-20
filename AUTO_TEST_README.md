# 🚀 AUTOMATED TIER TESTING - QUICK START

## TL;DR - 1 Command Test

```bash
python3 backend/scripts/test_tier_upgrade.py
```

**What it does:**
- ✅ Finds test user
- ✅ Upgrades to Founders automatically
- ✅ Claims Founders slot
- ✅ Verifies database changes
- ✅ Shows before/after comparison

**Time:** 5 seconds ⏱️

---

## Prerequisites

**1. Migration must be deployed first:**

```bash
# Copy migration SQL to clipboard
cat backend/database/tier_migration.sql | pbcopy

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql"

# Paste and run (CMD+V, then CMD+Enter)
```

**2. Install Python dependencies** (one-time):

```bash
pip3 install requests python-dotenv
```

---

## Usage

### Option 1: Auto Test (Recommended)

```bash
python3 backend/scripts/test_tier_upgrade.py
```

**Expected output:**
```
============================================================
🧪 APEX TIER SYSTEM - AUTOMATED TEST
============================================================

📊 Step 1: Checking Founders Circle status...
   Total Slots: 100
   Claimed: 87
   Available: 13

👤 Step 2: Finding test user...
   User ID: a1b2c3d4-...
   Email: test@apexos.dev
   Current Tier: free

⬆️ Step 3: Upgrading user to Founders...
   Claiming slot: #88
   ✅ User updated to Founders tier
   ✅ Founders slot #88 claimed

🔍 Step 4: Verifying upgrade...
   Subscription Tier: founders
   Payment Verified: True
   Payment TxID: test-tx-20241120082328
   Founders Slot: #88

📊 Step 5: Checking available slots after upgrade...
   Available slots: 12
   Change: 13 → 12 (decreased by 1)

📋 Test Summary
   ========================================================
   User Email:        test@apexos.dev
   User ID:           a1b2c3d4-...
   Old Tier:          free
   New Tier:          founders
   Founders Slot:     #88
   Available Slots:   12/100
   Payment Verified:  True
   ========================================================

✅ All tests passed! Tier upgrade successful!
```

### Option 2: Guided Deploy + Test

```bash
./backend/scripts/deploy_and_test.sh
```

**This will:**
1. Prompt you to run migration
2. Wait for confirmation
3. Run automated test
4. Show results

---

## What the Script Tests

### ✅ Database Operations:
- [x] Query `founders_circle` table
- [x] Query `users` table
- [x] Update user `subscription_tier`
- [x] Claim founders slot
- [x] Verify database state

### ✅ Business Logic:
- [x] Find available slot (lowest number)
- [x] Update user to founders tier
- [x] Mark payment as verified
- [x] Link user to slot
- [x] Decrease available slots count

### ✅ Data Integrity:
- [x] User tier changes from `free` to `founders`
- [x] Slot `user_id` populated
- [x] `payment_verified` set to `true`
- [x] Transaction ID recorded
- [x] Timestamp captured

---

## After Test Success

### Verify Frontend:

1. **Refresh Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

2. **Expected UI Changes:**
   - ✅ Crown badge: "Founders #88"
   - ✅ No upgrade banners
   - ✅ Locked metrics unlocked (Fees Saved, Referrals)
   - ✅ Wolf Pack status panel visible
   - ✅ All sidebar menus visible
   - ✅ User profile shows "Founders #88"

### Test API Endpoint:

```bash
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
  "features": {
    "wolf_pack_agents": true,
    "real_time_sync": true,
    "ai_auditor": true,
    ...
  }
}
```

---

## Troubleshooting

**Error: "Could not find table 'founders_circle'"**
- ❌ Migration not run yet
- ✅ Run migration SQL in Supabase first

**Error: "No users found"**
- ❌ Database is empty
- ✅ Create a test user first (via `/register` or Supabase UI)

**Error: "No available Founders slots"**
- ❌ All 100 slots claimed
- ✅ Clear some slots or test with existing Founders user

**Script succeeds but frontend doesn't change**
- ❌ Browser cache or localStorage stale
- ✅ Hard refresh (CMD+Shift+R) or clear localStorage

---

## Manual Cleanup (If Needed)

**Downgrade user back to free:**

```sql
-- In Supabase SQL Editor:

UPDATE users 
SET subscription_tier = 'free',
    payment_verified = false,
    payment_tx_id = null
WHERE email = 'test@apexos.dev';

UPDATE founders_circle
SET user_id = null,
    tx_id = null
WHERE slot_number = 88;
```

**Then re-run test:**
```bash
python3 backend/scripts/test_tier_upgrade.py
```

---

## Files Created

- `backend/scripts/test_tier_upgrade.py` - Auto test script
- `backend/scripts/deploy_and_test.sh` - Guided workflow
- `AUTO_TEST_README.md` - This file

---

**Ready to test? Run:**
```bash
python3 backend/scripts/test_tier_upgrade.py
```

**If migration not deployed yet, do this first:**
```bash
# 1. Copy SQL
cat backend/database/tier_migration.sql | pbcopy

# 2. Open Supabase
open "https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql"

# 3. Paste & run (CMD+V, CMD+Enter)

# 4. Run test
python3 backend/scripts/test_tier_upgrade.py
```

🎉 **That's it! 5-second automated testing!**
