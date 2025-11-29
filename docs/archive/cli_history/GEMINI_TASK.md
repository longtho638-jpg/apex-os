# 🎯 TASK FOR GEMINI: VIRAL ECONOMICS VERIFICATION

**Date**: 2025-11-27  
**Assigned by**: Claude (via User)  
**Priority**: HIGH  
**Quota Available**: 2000 requests/24h

---

## 📋 CONTEXT

### What's Been Done:
- ✅ SQL Migration executed: `supabase/migrations/20251127_viral_rebate_economics.sql`
- ✅ 5 tables created: `user_tiers`, `referral_network`, `commission_pool`, `commission_transactions`, `viral_metrics`
- ✅ 29 code files deployed (APIs, UI, business logic)
- ✅ Migration verified: "Success. No rows returned"

### What Needs Verification:
- Database structure & constraints
- Code integrity & business logic
- API endpoints functionality
- UI components rendering
- Integration testing
- Production readiness

---

## 🚀 YOUR MISSION

Execute ALL phases below in order. Report results for each phase.

---

## PHASE 1: DATABASE VERIFICATION 🗄️

### Task 1.1: Verify Tables Exist
**Action**: Run SQL query in Supabase
```sql
SELECT table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('user_tiers', 'referral_network', 'commission_pool', 'commission_transactions', 'viral_metrics')
ORDER BY table_name;
```

**Expected**: 5 rows returned

**Report**:
- [ ] user_tiers: __ columns
- [ ] referral_network: __ columns
- [ ] commission_pool: __ columns
- [ ] commission_transactions: __ columns
- [ ] viral_metrics: __ columns

---

### Task 1.2: Verify Indexes
**Action**: Run SQL query
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('user_tiers', 'referral_network', 'commission_transactions')
ORDER BY tablename, indexname;
```

**Expected**: At least 6 indexes

**Report**:
- [ ] idx_user_tiers_user_id: ✅/❌
- [ ] idx_user_tiers_tier: ✅/❌
- [ ] idx_referral_network_referrer: ✅/❌
- [ ] idx_referral_network_referee: ✅/❌
- [ ] idx_commission_transactions_user: ✅/❌
- [ ] idx_commission_transactions_month: ✅/❌

---

### Task 1.3: Check Foreign Keys
**Action**: Run SQL query
```sql
SELECT tc.table_name, kcu.column_name, 
       ccu.table_name AS foreign_table,
       ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_tiers', 'referral_network', 'commission_transactions');
```

**Expected**: All foreign keys reference `auth.users(id)`

**Report**:
- [ ] user_tiers.user_id → auth.users.id: ✅/❌
- [ ] referral_network.referrer_id → auth.users.id: ✅/❌
- [ ] referral_network.referee_id → auth.users.id: ✅/❌
- [ ] commission_transactions.user_id → auth.users.id: ✅/❌

---

### Task 1.4: Test Data Queries
**Action**: Run test queries
```sql
SELECT COUNT(*) as user_tiers_count FROM user_tiers;
SELECT COUNT(*) as referral_network_count FROM referral_network;
SELECT COUNT(*) as commission_pool_count FROM commission_pool;
SELECT COUNT(*) as commission_transactions_count FROM commission_transactions;
SELECT COUNT(*) as viral_metrics_count FROM viral_metrics;
```

**Report**: All queries run without error? ✅/❌

---

## PHASE 2: CODE STRUCTURE VERIFICATION 💻

### Task 2.1: Verify Core Files Exist
**Action**: Check file existence
```bash
cd /Users/macbookprom1/apex-os
ls -la src/lib/viral-economics/tier-manager.ts
ls -la src/lib/viral-economics/commission-calculator.ts
ls -la src/lib/viral-economics/referral-manager.ts
ls -la src/lib/viral-economics/gamification.ts
ls -la src/lib/viral-economics/cron-jobs.ts
```

**Report**:
- [ ] tier-manager.ts: ✅/❌
- [ ] commission-calculator.ts: ✅/❌
- [ ] referral-manager.ts: ✅/❌
- [ ] gamification.ts: ✅/❌
- [ ] cron-jobs.ts: ✅/❌

---

### Task 2.2: Verify API Routes
**Action**: Check API route files
```bash
ls -la src/app/api/v1/referral/link/route.ts
ls -la src/app/api/v1/referral/stats/route.ts
ls -la src/app/api/v1/tier/current/route.ts  # If exists
```

**Report**:
- [ ] /api/v1/referral/link: ✅/❌
- [ ] /api/v1/referral/stats: ✅/❌
- [ ] Other referral APIs: List them

---

### Task 2.3: Verify UI Components
**Action**: Check component files
```bash
ls -la src/components/viral-economics/TierProgressCard.tsx
ls -la src/components/viral-economics/CommissionDashboard.tsx
ls -la src/app/[locale]/referral/page.tsx
ls -la src/app/[locale]/admin/viral-economics/page.tsx
```

**Report**:
- [ ] TierProgressCard.tsx: ✅/❌
- [ ] CommissionDashboard.tsx: ✅/❌
- [ ] /referral page: ✅/❌
- [ ] /admin/viral-economics page: ✅/❌

---

### Task 2.4: Check i18n Messages
**Action**: Grep for translation keys
```bash
grep -o '"referral[^"]*"' src/messages/en.json | head -10
grep -o '"tier[^"]*"' src/messages/en.json | head -10
grep -o '"commission[^"]*"' src/messages/en.json | head -10
```

**Report**: Translation keys exist? ✅/❌

---

## PHASE 3: BUSINESS LOGIC VALIDATION 🧮

### Task 3.1: Inspect TIERS Configuration
**Action**: Extract TIERS object from tier-manager.ts
```bash
grep -A 20 "export const TIERS" src/lib/viral-economics/tier-manager.ts
```

**Expected**: 6 tiers with correct commission rates

**Report**:
- [ ] FREE: commission 0.05, rebate 0.60
- [ ] BASIC: commission 0.10, rebate 0.60
- [ ] TRADER: commission 0.20, rebate 0.55
- [ ] PRO: commission 0.30, rebate 0.50
- [ ] ELITE: commission 0.40, rebate 0.45
- [ ] APEX: commission 0.50, rebate 0.40

---

### Task 3.2: Validate Commission Calculation Logic
**Action**: Read commission-calculator.ts
Find function: `calculateCommission` or similar

**Report**:
- [ ] Handles L1-L4 levels: ✅/❌
- [ ] Has 90% pool cap logic: ✅/❌
- [ ] Includes scaling factor: ✅/❌

---

### Task 3.3: Check Referral Manager
**Action**: Read referral-manager.ts
Find function: `createReferralLink`

**Report**:
- [ ] Generates unique codes: ✅/❌
- [ ] Stores in database: ✅/❌
- [ ] Tracks referrer/referee: ✅/❌

---

## PHASE 4: ENVIRONMENT & CONFIG ⚙️

### Task 4.1: Check Environment Variables
**Action**: Look for .env files (don't expose values!)
```bash
ls -la .env*
grep "SUPABASE" .env.local 2>/dev/null | sed 's/=.*/=***/'
```

**Report**:
- [ ] NEXT_PUBLIC_SUPABASE_URL configured: ✅/❌
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configured: ✅/❌

---

### Task 4.2: Check Supabase Client Setup
**Action**: Inspect src/lib/supabase.ts
```bash
grep -A 10 "createClient" src/lib/supabase.ts | head -15
```

**Report**: Supabase client properly initialized? ✅/❌

---

## PHASE 5: TESTING & CODE QUALITY 🧪

### Task 5.1: Run Existing Tests
**Action**: Execute test suite
```bash
cd /Users/macbookprom1/apex-os
npm test -- tier-manager --passWithNoTests
```

**Report**:
- Test results: PASS/FAIL/SKIP
- Coverage: __%

---

### Task 5.2: TypeScript Type Check
**Action**: Run TypeScript compiler
```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | head -50
```

**Report**:
- Type errors count: __
- Critical errors: List if any

---

### Task 5.3: Lint Check (Optional)
**Action**: Run ESLint
```bash
npm run lint 2>&1 | grep -E "(error|warning)" | head -20
```

**Report**: Major lint issues? ✅/❌

---

## PHASE 6: INTEGRATION READINESS 🔗

### Task 6.1: Verify Import Paths
**Action**: Check if all imports resolve
```bash
grep -r "from '@/lib/viral-economics" src/app/api/v1/referral/ --include="*.ts"
```

**Report**: All imports correct? ✅/❌

---

### Task 6.2: Check API Route Structure
**Action**: Inspect API route template
```bash
head -30 src/app/api/v1/referral/link/route.ts
```

**Expected**:
- Imports `authenticateRequest`
- Has GET/POST handler
- Returns proper JSON response

**Report**: Route structure valid? ✅/❌

---

## PHASE 7: DEPLOYMENT STATUS 🚀

### Task 7.1: Check Git Status
**Action**:
```bash
cd /Users/macbookprom1/apex-os
git status --short
```

**Report**: 
- Uncommitted changes: List them
- Branch: __

---

### Task 7.2: Check Recent Commits
**Action**:
```bash
git log --oneline -5
```

**Report**: Latest commits related to viral-economics? ✅/❌

---

### Task 7.3: Verify Deployment Files
**Action**:
```bash
ls -la vercel.json 2>/dev/null || echo "No vercel.json"
ls -la package.json | grep package.json
```

**Report**: Deployment config exists? ✅/❌

---

## PHASE 8: SEED TEST DATA (OPTIONAL) 🌱

### Task 8.1: Get a Real User ID
**Action**: Query Supabase for existing user
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;
```

**Report**: Found user ID? ✅/❌

---

### Task 8.2: Insert Test Tier Data
**Action**: Run seed query (use real user_id from 8.1)
```sql
INSERT INTO user_tiers (user_id, tier, total_referrals, active_referrals, monthly_volume, current_commission_rate)
VALUES ('[REAL_USER_ID]', 'FREE', 0, 0, 0, 0.05)
ON CONFLICT (user_id) DO NOTHING;
```

**Report**: Insert successful? ✅/❌

---

### Task 8.3: Query Test Data
**Action**:
```sql
SELECT * FROM user_tiers LIMIT 5;
```

**Report**: Data returned? ✅/❌

---

## PHASE 9: FINAL REPORT 📊

### Generate Report File
**Action**: Create comprehensive report

**File**: `VERIFICATION_REPORT_2025-11-27.md`

**Include**:
1. Executive Summary (PASS/FAIL + overall score)
2. Phase-by-phase results (✅/❌ for each task)
3. Detailed findings
4. Issues found (if any)
5. Recommendations
6. Next steps

---

## SUCCESS CRITERIA ✨

System is **PRODUCTION READY** if:
- ✅ All 5 tables exist with correct structure
- ✅ All 6+ indexes created
- ✅ Foreign keys valid
- ✅ All code files exist
- ✅ API routes have authentication
- ✅ UI components complete
- ✅ i18n messages available
- ✅ Business logic correct (tiers, commission)
- ✅ No critical TypeScript errors
- ✅ Supabase connection configured
- ✅ Tests pass (or test plan exists)

---

## EXECUTION PROTOCOL 🎯

1. **Work sequentially**: Complete Phase 1 before Phase 2, etc.
2. **Document everything**: Report each task result
3. **Auto-fix if possible**: If you find minor issues, fix them
4. **Use quota freely**: You have 2000 requests
5. **Be thorough**: Check every detail
6. **No permission needed**: Just do it

---

## DELIVERABLE FORMAT 📝

When complete, respond with:

```
=====================================
VERIFICATION COMPLETE
Date: 2025-11-27
Executor: Gemini
=====================================

OVERALL STATUS: [PASS / FAIL / PARTIAL]
SCORE: __/100

PHASE RESULTS:
✅ Phase 1: Database Verification
✅ Phase 2: Code Structure
❌ Phase 3: Business Logic (2 issues found)
... etc

CRITICAL ISSUES:
1. [Issue description]
2. [Issue description]

RECOMMENDATIONS:
1. [Recommendation]
2. [Recommendation]

DETAILED REPORT: /path/to/VERIFICATION_REPORT_2025-11-27.md

=====================================
```

---

**START EXECUTION NOW! 🚀💎⚔️**

No need to ask for permission. Just execute all phases and report back.
