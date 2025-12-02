# Code Audit Report - Debug Logs & Mock Data

## Summary
- **Total Pages Found:** 99
- **Console.log Instances:** 20+
- **Status:** Audit in progress

## Debug Logs by Category

### 🚨 MUST REMOVE (Debug Noise)
These are pure debug logs with no production value:

1. **Trading Orders API** (3 instances)
   - File: `/Users/macbookprom1/apex-os/src/app/api/v1/trading/orders/route.ts`
   - Lines: 37, 68, 91
   - `console.log('[Trading Orders API] GET request received')`
   - `console.log('[Trading Orders API] Fetching orders...')`
   - **Action:** Remove all 3

2. **Auth Recovery** (3 instances)
   - File: `/Users/macbookprom1/apex-os/src/app/api/auth/recover/route.ts`
   - Lines: 39, 40, 69
   - `console.log('[Auth] Generating recovery link...')`
   - **Action:** Remove all 3

3. **Layout Debug** (2 instances)
   - File: `/Users/macbookprom1/apex-os/src/app/[locale]/layout.tsx`
   - Line: 37
   - `console.log('[ApexLayout] Loading locale:', locale)`
   - **Action:** Remove

4. **Admin Layout** (3 instances)
   - File: `/Users/macbookprom1/apex-os/src/app/[locale]/admin/layout.tsx`
   - Lines: 19, 30, 33
   - **Action:** Remove (but keep auth checks)

5. **Placeholder onClick** (2 instances)
   - Files: `dashboard/payment/page.tsx`, `trade/page.tsx`
   - `onClick={() => console.log(...)}`
   - **Action:** Replace with toast or actual handlers

### ✅ KEEP (Production Monitoring)
These logs provide value for debugging production issues:

1. **User Verification**
   - File: `/Users/macbookprom1/apex-os/src/app/api/v1/user/verify-account/route.ts`
   - **Reason:** Critical auth flow, helps debug verification issues

2. **MFA Development Bypass**
   - File: `/Users/macbookprom1/apex-os/src/app/api/v1/admin/mfa/verify/route.ts`
   - Line: 71
   - `console.log('🔓 DEV BYPASS: Using development MFA bypass code')`
   - **Reason:** Security warning for dev mode

3. **Unhandled Webhook Events**
   - File: `/Users/macbookprom1/apex-os/src/app/api/webhooks/polar/route.ts`
   - `console.log(\`Unhandled event type: \${event.type}\`)`
   - **Reason:** Helps identify missing webhook handlers

4. **AB Test Tracking**
   - File: `/Users/macbookprom1/apex-os/src/app/r/[code]/route.ts`
   - **Reason:** Analytics tracking

5. **DeepSeek AI Analysis**
   - File: `/Users/macbookprom1/apex-os/src/app/api/ai/deepseek/analyze/route.ts`
   - **Reason:** AI operation monitoring

6. **Checkout Idempotency**
   - File: `/Users/macbookprom1/apex-os/src/app/api/checkout/route.ts`
   - **Reason:** Payment debugging

### 🔍 REVIEW NEEDED (Case-by-Case)

1. **Public Check Link**
   - File: `/Users/macbookprom1/apex-os/src/app/api/v1/public/check-link/route.ts`
   - `console.log(\`[PUBLIC CHECK] Mock mode - checking...\`)`
   - **Decision:** Keep for mock mode indicator

## Next Steps

### Phase 1: Quick Wins (High Priority)
1. ✅ Remove all layout debug logs (5 logs)
2. ✅ Remove trading orders debug logs (3 logs)
3. ✅ Remove auth recovery debug logs (3 logs)
4. ✅ Fix placeholder onClick handlers (2 instances)

### Phase 2: Mock Data Audit (Medium Priority)
1. Check all pages for fake IDs like `'leader-1'`
2. Verify UUID formats match database schema
3. Ensure field names match exactly

### Phase 3: Systematic Page Review (Lower Priority)
1. Go through each of 99 pages alphabetically
2. Check for:
   - Debug console.logs
   - Mock data with fake IDs
   - Missing error handling
   - TODO comments

## Coding Standards Applied

Following [`.agent/CODING_RULES.md`](file:///Users/macbookprom1/apex-os/.agent/CODING_RULES.md):
- ✅ Mock data uses real UUIDs
- ✅ Field names match database schema
- ✅ Remove debug logs, keep error/monitoring logs
- ✅ Specific error messages to frontend

## Progress Tracker

- [x] Copy Trading (Complete)
- [ ] Trading Orders API
- [ ] Auth Recovery
- [ ] Layout Components
- [ ] Admin Pages
- [ ] Payment Pages
- [ ] 94 more pages...

---

**Created:** 2025-12-02  
**Status:** In Progress
