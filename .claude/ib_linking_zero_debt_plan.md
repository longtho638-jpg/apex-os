# IB Linking System - Zero Technical Debt Implementation Plan
**Created:** 2025-11-23 13:33 UTC+7  
**Objective:** Fix all critical and high-priority issues before production deployment  
**Methodology:** Complete each task 100% before moving to next

---

## PHASE 1: SECURITY & ENCRYPTION (Critical)

### Task 1.1: Implement API Key Encryption/Decryption
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 45 minutes  
**Files to Create/Modify:**
- `src/lib/crypto/vault.ts` (NEW)
- `src/app/api/v1/user/verify-account/route.ts` (MODIFY)

**Subtasks:**
- [ ] Create encryption utility with AES-256-GCM
- [ ] Add decryption function for API keys
- [ ] Update verify-account route to decrypt before use
- [ ] Add error handling for corrupted keys
- [ ] Test encryption roundtrip

**Acceptance Criteria:**
- ✅ Can encrypt API key with VAULT_KEY_MASTER
- ✅ Can decrypt API key successfully
- ✅ Invalid keys throw proper errors
- ✅ No plaintext keys in logs

---

### Task 1.2: Add Input Sanitization
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 20 minutes  
**Files to Modify:**
- `src/components/settings/ExchangeLinkingManager.tsx`
- `src/components/dashboard/ConnectExchange.tsx`

**Subtasks:**
- [ ] Install `dompurify` and `@types/dompurify`
- [ ] Sanitize UID input before submission
- [ ] Sanitize exchange selection
- [ ] Add validation regex for UID format
- [ ] Test with XSS payloads

**Acceptance Criteria:**
- ✅ XSS attempts blocked
- ✅ Invalid characters rejected
- ✅ SQL injection patterns blocked

---

### Task 1.3: Add Rate Limiting
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes  
**Files to Create/Modify:**
- `src/middleware/rateLimit.ts` (NEW)
- `src/app/api/v1/user/verify-account/route.ts` (MODIFY)

**Subtasks:**
- [ ] Install `@upstash/ratelimit` and Redis client
- [ ] Create rate limit middleware (5 req/15min per IP)
- [ ] Apply to verify-account endpoint
- [ ] Add 429 Too Many Requests response
- [ ] Test with multiple requests

**Acceptance Criteria:**
- ✅ Limit enforced correctly
- ✅ Proper HTTP 429 response
- ✅ Redis connection handles failures gracefully

---

## PHASE 2: API & DATA LAYER FIXES (Critical)

### Task 2.1: Fix Webhook SQL Configuration
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 15 minutes  
**Files to Modify:**
- `src/database/setup_webhooks_cron.sql`

**Subtasks:**
- [ ] Replace `current_setting()` with proper env var approach
- [ ] Add instructions for setting Supabase secrets
- [ ] Update Edge Function URLs with placeholders
- [ ] Add validation query to test webhook setup

**Acceptance Criteria:**
- ✅ SQL runs without errors
- ✅ Webhook fires successfully
- ✅ Auth header correct

---

### Task 2.2: Fix API URL Configuration (SSR-safe)
**Priority:** 🟡 HIGH  
**Estimated Time:** 30 minutes  
**Files to Modify:**
- `src/contexts/AuthContext.tsx`
- `src/hooks/useApi.ts`
- `src/lib/api/client.ts`
- `src/hooks/useUserTier.ts`
- `.env.local.example` (NEW)

**Subtasks:**
- [ ] Create helper function `getApiUrl()` that works in SSR and CSR
- [ ] Update all API calls to use helper
- [ ] Add fallback logic for local development
- [ ] Document environment variables
- [ ] Test SSR rendering

**Acceptance Criteria:**
- ✅ Works in SSR (getServerSideProps)
- ✅ Works in CSR (useEffect)
- ✅ Works on localhost:3000 and 3001
- ✅ No hydration mismatches

---

## PHASE 3: UI ROBUSTNESS (High Priority)

### Task 3.1: Add Error Boundaries
**Priority:** 🟡 HIGH  
**Estimated Time:** 25 minutes  
**Files to Create/Modify:**
- `src/components/ErrorBoundary.tsx` (NEW)
- `src/app/[locale]/settings/page.tsx` (MODIFY)
- `src/app/[locale]/dashboard/page.tsx` (MODIFY)

**Subtasks:**
- [ ] Create reusable ErrorBoundary component
- [ ] Add fallback UI with error details
- [ ] Wrap ExchangeLinkingManager
- [ ] Wrap ConnectExchange
- [ ] Test with forced component error

**Acceptance Criteria:**
- ✅ Errors caught and displayed gracefully
- ✅ Rest of page remains functional
- ✅ Error details logged to console/Sentry

---

### Task 3.2: Fix TypeScript Types
**Priority:** 🟡 HIGH  
**Estimated Time:** 20 minutes  
**Files to Modify:**
- `src/components/settings/ExchangeLinkingManager.tsx`
- `src/components/dashboard/ConnectExchange.tsx`
- `src/types/exchange.ts` (NEW)

**Subtasks:**
- [ ] Create shared types file
- [ ] Define VerificationResult interface
- [ ] Define ExchangeAccount interface
- [ ] Replace all `any` types
- [ ] Fix type errors

**Acceptance Criteria:**
- ✅ No `any` types in production code
- ✅ Full IntelliSense support
- ✅ TypeScript strict mode passes

---

### Task 3.3: Add Loading States & Optimistic Updates
**Priority:** 🟢 MEDIUM  
**Estimated Time:** 30 minutes  
**Files to Modify:**
- `src/components/settings/ExchangeLinkingManager.tsx`
- `src/components/dashboard/ConnectExchange.tsx`

**Subtasks:**
- [ ] Add skeleton loader for account list
- [ ] Implement optimistic UI for new accounts
- [ ] Add shimmer effect during verification
- [ ] Rollback on failure
- [ ] Add success animations

**Acceptance Criteria:**
- ✅ Instant UI feedback
- ✅ Smooth transitions
- ✅ Rollback on error

---

## PHASE 4: DEPLOYMENT PREPARATION

### Task 4.1: Deploy Edge Functions
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 20 minutes  
**Files to Check:**
- `supabase/functions/verify-exchange-mock/index.ts`
- `supabase/functions/reverify-scheduler/index.ts`

**Subtasks:**
- [ ] Install Supabase CLI if needed
- [ ] Deploy verify-exchange-mock
- [ ] Deploy reverify-scheduler
- [ ] Set environment variables
- [ ] Test webhook trigger manually

**Acceptance Criteria:**
- ✅ Functions deployed successfully
- ✅ Can invoke manually
- ✅ Logs appear in Supabase dashboard

---

### Task 4.2: Update Production SQL with Real URLs
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 10 minutes  
**Files to Create:**
- `src/database/setup_webhooks_cron_production.sql` (NEW)

**Subtasks:**
- [ ] Copy SQL template
- [ ] Replace Edge Function URLs with deployed URLs
- [ ] Add production-specific settings
- [ ] Document execution steps
- [ ] Create rollback script

**Acceptance Criteria:**
- ✅ SQL ready to run in production
- ✅ Rollback script tested
- ✅ Execution documented

---

### Task 4.3: Add Monitoring & Alerting
**Priority:** 🟡 HIGH  
**Estimated Time:** 30 minutes  
**Files to Create/Modify:**
- `src/lib/monitoring/sentry.ts` (NEW)
- `src/app/layout.tsx` (MODIFY)

**Subtasks:**
- [ ] Set up Sentry project
- [ ] Add Sentry initialization
- [ ] Configure error tracking
- [ ] Add custom event tracking
- [ ] Test error reporting

**Acceptance Criteria:**
- ✅ Errors sent to Sentry
- ✅ Custom events tracked
- ✅ Performance monitoring enabled

---

## EXECUTION ORDER

1. **Phase 1 (Security)** - MANDATORY before any deployment
2. **Phase 2 (API)** - MANDATORY before Phase 4
3. **Phase 3 (UI)** - Can be done in parallel with Phase 2
4. **Phase 4 (Deployment)** - Final step, requires Phase 1 & 2 complete

**Total Estimated Time:** 4.5 - 5.5 hours  
**Recommended: Break into 2 sessions if needed**

---

## TESTING CHECKPOINTS

After each phase:
- [ ] Run `npm run build` - must pass
- [ ] Run manual smoke test of affected features
- [ ] Check browser console for errors
- [ ] Verify no TypeScript errors
- [ ] Git commit with descriptive message

---

## COMPLETION CRITERIA

**Definition of Done:**
- ✅ All critical & high-priority tasks complete
- ✅ No TypeScript errors
- ✅ No console errors in production build
- ✅ Manual testing passed
- ✅ Edge Functions deployed and tested
- ✅ SQL scripts ready for production
- ✅ Monitoring configured
- ✅ Documentation updated
- ✅ Code committed to version control

**Sign-off Required Before:**
- [ ] Production database migration
- [ ] Production deployment
- [ ] Public announcement

---

**Plan Status:** 🟡 READY FOR EXECUTION  
**Next Action:** Begin Phase 1, Task 1.1
