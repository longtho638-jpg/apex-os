# 🚀 MIGRATION QUICK REFERENCE

## TL;DR - 60 Seconds Deploy

```bash
# 1. Copy migration (ALREADY DONE)
cat backend/database/master_migration.sql \
    backend/database/tier_migration.sql | pbcopy

# 2. Open Supabase
open "https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql"

# 3. Paste (CMD+V) → Run (CMD+Enter)

# 4. Verify
# Paste in new query:
SELECT get_available_founders_slots();
# Expected: 13

# 5. Test
python3 backend/scripts/test_tier_upgrade.py
# Expected: "All tests passed!"

# 6. Done! ✅
```

---

## 📋 Checklist (Print & Check)

```
□ Opened Supabase SQL Editor
□ Pasted ~650 lines of SQL
□ Clicked "Run" (or CMD+Enter)
□ Saw "Success" message (20-40 seconds)
□ Verified 11 tables created
□ Verified founders slots = 13
□ Ran auto test successfully
□ Refreshed dashboard
□ Saw Founders UI changes
```

---

## ✅ Success Indicators

**In Supabase:**
- ✅ "Success" message (green)
- ✅ 11 tables in schema
- ✅ `get_available_founders_slots()` = 13

**In Terminal:**
- ✅ Auto test shows "All tests passed!"
- ✅ User upgraded to Founders #88
- ✅ Available slots: 12 (decreased by 1)

**In Browser:**
- ✅ Crown badge "Founders #88"
- ✅ No upgrade banners
- ✅ All metrics unlocked
- ✅ Wolf Pack menu visible

---

## ❌ Common Errors & Quick Fixes

| Error | Fix |
|-------|-----|
| "syntax error" | Re-copy migration, paste again |
| "relation already exists" | Normal! Ignore, verify tables |
| "permission denied" | Check you're project owner |
| "table not found" (in test) | Migration failed, re-run |
| Frontend unchanged | Hard refresh (CMD+Shift+R) |

---

## 🆘 Emergency Rollback

```sql
DROP TABLE IF EXISTS referral_earnings CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS payment_verifications CASCADE;
DROP TABLE IF EXISTS founders_circle CASCADE;
DROP TABLE IF EXISTS sync_jobs CASCADE;
DROP TABLE IF EXISTS trade_history CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS guardian_alerts CASCADE;
DROP TABLE IF EXISTS portfolio_snapshots CASCADE;
DROP TABLE IF EXISTS exchange_connections CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then re-run migration.

---

## 📖 Full Guide

**If stuck, read:**
`MIGRATION_DEPLOYMENT_DETAILED_GUIDE.md`

**Quick links:**
- Database schema: `backend/database/master_migration.sql`
- Tier system: `backend/database/tier_migration.sql`
- Auto test: `backend/scripts/test_tier_upgrade.py`

---

**Clipboard ready → Paste in Supabase → 60 seconds!** 🚀
