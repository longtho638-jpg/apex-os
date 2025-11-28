# 🚀 Viral Economics - Complete Verification Checklist

**Date**: 2025-11-27  
**Migration File**: `supabase/migrations/20251127_viral_rebate_economics.sql`

---

## ✅ PHASE 1: DATABASE MIGRATION

### Step 1: Run Migration ✅ COMPLETE
- [x] SQL file executed in Supabase SQL Editor
- [x] No errors returned
- [x] Tables created successfully

### Step 2: Verify Tables
Run: `scripts/verify-viral-economics.sql`

**Expected Results:**
- [ ] 5 tables exist: `user_tiers`, `referral_network`, `commission_pool`, `commission_transactions`, `viral_metrics`
- [ ] 6+ indexes created
- [ ] Foreign keys reference `auth.users` correctly
- [ ] `uuid-ossp` extension enabled

### Step 3: Seed Test Data (Optional)
Run: `scripts/seed-viral-economics.sql`

**Before running:**
1. [ ] Get real user IDs: `SELECT id, email FROM auth.users LIMIT 5;`
2. [ ] Replace placeholder UUIDs in seed script
3. [ ] Execute seed data queries
4. [ ] Verify: `SELECT * FROM user_tiers;`

---

## 🧪 PHASE 2: API TESTING

### Prerequisites
- [ ] Supabase configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Next.js dev server running: `npm run dev`
- [ ] User logged in to get auth token

### Get Auth Token
1. [ ] Visit: `http://localhost:3000/login`
2. [ ] Login with test account
3. [ ] Open DevTools → Application → Cookies
4. [ ] Copy `sb-access-token` value

### Test Endpoints

#### 1. Referral Link Generation
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/referral/link
```

**Expected:**
```json
{
  "link": "https://apexrebate.com/r/ABC123"
}
```

- [ ] Returns valid referral link
- [ ] Code is unique
- [ ] Link format correct

#### 2. Get User Tier
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/tier/current
```

**Expected:**
```json
{
  "tier": "FREE",
  "commission": 0.05,
  "rebate": 0.6,
  "requirements": {
    "referrals": 5,
    "volume": 10000
  }
}
```

- [ ] Returns current tier
- [ ] Commission rate correct
- [ ] Requirements shown

#### 3. Referral Stats
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/referral/stats
```

**Expected:**
```json
{
  "total_referrals": 0,
  "active_referrals": 0,
  "total_commission": 0,
  "monthly_volume": 0
}
```

- [ ] Returns user stats
- [ ] Numbers match database

### Error Cases
- [ ] **No token**: Returns 401 Unauthorized
- [ ] **Invalid token**: Returns 401 Unauthorized
- [ ] **Malformed request**: Returns 400 Bad Request

---

## 🎨 PHASE 3: UI COMPONENTS

### Check Components Exist
- [ ] `src/components/viral-economics/TierProgressCard.tsx`
- [ ] `src/components/viral-economics/CommissionDashboard.tsx`
- [ ] `src/app/[locale]/admin/viral-economics/page.tsx`
- [ ] `src/app/[locale]/referral/page.tsx`

### Test UI Pages

#### Referral Page
1. [ ] Visit: `http://localhost:3000/referral`
2. [ ] See referral link displayed
3. [ ] Can copy link to clipboard
4. [ ] Tier progress shown
5. [ ] Commission stats visible

#### Dashboard
1. [ ] Visit: `http://localhost:3000/dashboard`
2. [ ] Tier card shows current tier
3. [ ] Progress bar for next tier
4. [ ] Referral count displayed

#### Admin Panel
1. [ ] Visit: `http://localhost:3000/admin/viral-economics`
2. [ ] See viral metrics
3. [ ] Commission pool data
4. [ ] User tier distribution

---

## 📊 PHASE 4: BUSINESS LOGIC

### Tier Calculation
```typescript
// Test in browser console or via API
const testTierLogic = async () => {
  const response = await fetch('/api/v1/tier/calculate', {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  return response.json();
};
```

- [ ] FREE tier: 0 referrals, 0 volume
- [ ] BASIC tier: 5 referrals, $10k volume
- [ ] TRADER tier: 20 referrals, $50k volume
- [ ] AUTO promotion works

### Commission Calculation
Test file: `src/__tests__/viral-economics/tier-manager.test.ts`

```bash
npm test tier-manager
```

- [ ] Tests pass
- [ ] L1-L4 commission split correct
- [ ] 90% pool cap enforced
- [ ] Scaling factor applied

---

## 🔐 PHASE 5: SECURITY & RLS

### RLS Policies (Recommended)
Create these policies in Supabase:

```sql
-- Users can only see their own tier data
CREATE POLICY "Users view own tier"
  ON user_tiers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own referral network
CREATE POLICY "Users view own referrals"
  ON referral_network FOR SELECT
  USING (auth.uid() = referrer_id);

-- Users can only see their own commission transactions
CREATE POLICY "Users view own commissions"
  ON commission_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

- [ ] RLS enabled on all tables
- [ ] Users can't see other users' data
- [ ] Admin can see all data

---

## 🚀 PHASE 6: PRODUCTION DEPLOYMENT

### Pre-Deploy Checklist
- [ ] All tests passing
- [ ] No console errors in dev
- [ ] API endpoints working
- [ ] UI components rendering
- [ ] Database migration successful
- [ ] RLS policies applied

### Deploy Steps
1. [ ] Push to GitHub: `git push origin main`
2. [ ] Wait for Vercel build (~5 min)
3. [ ] Check Vercel dashboard: Build successful
4. [ ] Visit production: `https://apexrebate.com`
5. [ ] Test APIs in production
6. [ ] Monitor Sentry for errors

### Production Verification
- [ ] Site loads without errors
- [ ] Login works
- [ ] Referral link generation works
- [ ] Tier data displays correctly
- [ ] No 500 errors in logs

---

## 📈 PHASE 7: MONITORING

### Metrics to Track
- [ ] New user signups with referral codes
- [ ] Tier promotions per day
- [ ] Commission calculations accuracy
- [ ] Viral coefficient trends
- [ ] API response times

### Tools
- [ ] **Supabase Dashboard**: Table data, query logs
- [ ] **Vercel Analytics**: Page views, performance
- [ ] **Sentry**: Error tracking
- [ ] **Custom Admin Panel**: `/admin/viral-economics`

---

## 🎯 SUCCESS CRITERIA

**Deployment is COMPLETE when:**
- ✅ All 5 database tables exist and queryable
- ✅ All API endpoints return correct responses
- ✅ UI components display tier & commission data
- ✅ Tests passing (tier-manager)
- ✅ RLS policies protecting user data
- ✅ Production site working without errors
- ✅ First referral link successfully generated
- ✅ Commission calculation working for test users

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Issue: 401 Unauthorized on API calls**
- Check auth token is valid
- Verify Supabase credentials in `.env.local`
- Check cookie domain settings

**Issue: Tables not found**
- Verify migration ran successfully
- Check table names (lowercase)
- Confirm schema is `public`

**Issue: Foreign key constraint fails**
- Ensure user exists in `auth.users`
- Check UUID format is valid
- Verify user_id references are correct

**Issue: Commission calculation wrong**
- Check tier data in `user_tiers`
- Verify referral network levels
- Review commission pool scaling factor

---

## 📞 HELP & SUPPORT

**Resources:**
- 📄 Migration File: `supabase/migrations/20251127_viral_rebate_economics.sql`
- 📄 Verification Script: `scripts/verify-viral-economics.sql`
- 📄 Seed Data: `scripts/seed-viral-economics.sql`
- 📄 Walkthrough: `.gemini/antigravity-backup/.../walkthrough.md`
- 📄 Report: `VIRAL_ECONOMICS_REPORT.md`

**Next Steps:**
1. Complete this checklist top to bottom
2. Document any issues in Sentry
3. Share results with team
4. Plan next iteration features

---

**LET'S SHIP IT! 🚀💎⚔️**
