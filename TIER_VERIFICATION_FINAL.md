# 🎯 TIER MIGRATION - FINAL VERIFICATION (5 MINUTES)

## Status: Ready to Verify

**Migration deployed:** ✅ "Success. No rows returned"
**Next step:** Verify tables created correctly

---

## 🚀 STEP 1: RUN DIAGNOSTIC QUERY

### What to Do:

1. **Supabase SQL Editor is opening** (or already open)
2. **SQL is ALREADY in your clipboard**
3. Just paste (CMD+V) and run (CMD+Enter)

### Expected Output:

```
check                      | result                                        | expected
---------------------------|-----------------------------------------------|----------
Total Tables               | 11                                            | 11
Table Names                | agent_logs, exchange_connections, founders... | Should include: founders_circle...
Tier Columns               | 5                                             | 5
RLS Enabled                | 7                                             | 7+
Available Founders Slots   | 13                                            | 13
```

---

## 📊 RESULT INTERPRETATION:

### ✅ SCENARIO A: All Perfect (Expected)

**You see:**
- Total Tables = **11** ✅
- Available Founders Slots = **13** ✅
- Tier Columns = **5** ✅

**Meaning:** Migration 100% successful!

**Next action:** Go to Step 2 (Auto Test)

---

### ⚠️ SCENARIO B: Missing Tier Tables

**You see:**
- Total Tables = **7** (not 11) ❌
- Available Founders Slots = **ERROR: Table not found** ❌

**Meaning:** Only master_migration ran, tier_migration didn't run

**Fix:**
```bash
# Copy tier migration only
cat backend/database/tier_migration.sql | pbcopy

# Paste in Supabase → Run
```

Then re-run diagnostic query.

---

### ⚠️ SCENARIO C: Partial Success

**You see:**
- Total Tables = **9-10** (between 7-11)

**Meaning:** Some tier tables created, some failed

**Fix:**
1. Check Supabase logs for error messages
2. Re-run full migration
3. Report error to me

---

## 🚀 STEP 2: RUN AUTO TEST (After Step 1 passes)

```bash
cd /Users/macbookprom1/apex-os/apex-os
python3 backend/scripts/test_tier_upgrade.py
```

### Expected Output:

```
============================================================
🧪 APEX TIER SYSTEM - AUTOMATED TEST
============================================================

📊 Step 1: Checking Founders Circle status...
   Total Slots: 100
   Claimed: 87
   Available: 13                           ← Key metric!

👤 Step 2: Finding test user...
   User ID: 00000000-0000-0000-0000-000000000000
   Email: test@apexos.dev
   Current Tier: free

⬆️ Step 3: Upgrading user to Founders...
   Claiming slot: #88
   ✅ User updated to Founders tier          ← Success!
   ✅ Founders slot #88 claimed

🔍 Step 4: Verifying upgrade...
   Subscription Tier: founders
   Payment Verified: True
   Founders Slot: #88

📊 Step 5: Checking available slots after upgrade...
   Available slots: 12
   Change: 13 → 12 (decreased by 1)        ← Correct!

✅ All tests passed! Tier upgrade successful!
```

---

## 🚀 STEP 3: TEST FRONTEND (After Step 2 passes)

### Open Dashboard:
```
http://localhost:3000/dashboard
```

### Expected Changes:

**Before upgrade:**
```
Header: "Welcome, User"
Sidebar: "Upgrade to Founders" button visible
Dashboard: Upgrade banner at top
Metrics: "Fees Saved" LOCKED
Metrics: "Referral Earnings" LOCKED
Menus: Wolf Pack HIDDEN
```

**After upgrade:**
```
Header: "Welcome, User 👑 Founders #88"    ← Crown badge!
Sidebar: Crown badge + "Founders #88"
Sidebar: "Upgrade" button GONE
Dashboard: Upgrade banner GONE
Metrics: "Fees Saved" UNLOCKED             ← Shows data
Metrics: "Referral Earnings" UNLOCKED
Menus: Wolf Pack VISIBLE                   ← New panel
```

---

## ✅ SUCCESS CHECKLIST

```
□ Step 1: Diagnostic query shows 11 tables
□ Step 1: Available founders slots = 13
□ Step 2: Auto test passes ("All tests passed!")
□ Step 2: User upgraded to Founders #88
□ Step 2: Available slots decreased to 12
□ Step 3: Dashboard shows crown badge
□ Step 3: Upgrade banners disappeared
□ Step 3: Locked features unlocked
□ Step 3: Wolf Pack menu visible
```

**If ALL checkboxes ✅ → TIER MIGRATION COMPLETE!**

---

## 🆘 TROUBLESHOOTING

### Issue: "Could not find table 'founders_circle'"

**In Auto Test:**
```
Error: 404 - Could not find the table 'public.founders_circle'
```

**Cause:** Schema cache not refreshed OR table not created

**Fix:**

**Option 1:** Wait 1-2 minutes, re-run test
```bash
sleep 120 && python3 backend/scripts/test_tier_upgrade.py
```

**Option 2:** Reload schema cache in Supabase
1. Settings → API → PostgREST
2. Click "Reload schema cache"
3. Re-run test

**Option 3:** Verify table exists in Supabase UI
1. Supabase → Table Editor
2. Look for `founders_circle` table
3. If missing → Re-run tier_migration.sql

---

### Issue: Frontend doesn't change

**Cause:** Browser cache

**Fix:**
1. Hard refresh: CMD+Shift+R
2. Clear localStorage:
   ```javascript
   // Browser console:
   localStorage.clear();
   location.reload();
   ```

---

### Issue: Auto test says "No users found"

**Cause:** Database empty

**Fix:** Create test user in Supabase:
```sql
INSERT INTO users (id, email, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@apexos.dev',
  'free'
);
```

---

## 🎯 QUICK COMMAND SUMMARY

```bash
# If diagnostic passes → Run auto test:
python3 backend/scripts/test_tier_upgrade.py

# If test passes → Open dashboard:
open http://localhost:3000/dashboard

# If all green → You're DONE! ✅
```

---

## ⏱️ ESTIMATED TIME

- **Step 1:** 30 seconds (paste query, check result)
- **Step 2:** 5 seconds (run script, read output)
- **Step 3:** 30 seconds (refresh browser, verify UI)

**Total:** ~70 seconds if all goes well!

---

**Ready? Paste query in Supabase → Report back! 😊**
