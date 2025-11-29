# Technical Debt Registry

**Last Updated:** 2025-11-28  
**Strategy:** MVP Speed (Blitzkrieg) - Document now, implement later

---

## Priority 1: Production Services (Week 5-6)

### Analytics & Monitoring
- **Location:** `src/lib/analytics-mock.ts`
- **Issue:** Mock analytics using console.log
- **Impact:** No user behavior tracking in production
- **Solution:** Integrate PostHog or Mixpanel
- **Effort:** 4-6 hours
- **Status:** Documented, using centralized mock

### Observability
- **Location:** `src/lib/db.ts:57`
- **Issue:** Slow query detection logs to console, not sent to monitoring
- **Impact:** No production alerting for performance issues
- **Solution:** Integrate Sentry for error/performance tracking
- **Effort:** 2-3 hours
- **Status:** TODO in code

### Email Service
- **Location:** `src/lib/email-service.ts`
- **Issue:** Partial mock implementations
- **Impact:** Some emails may not send in production
- **Solution:** Complete Resend integration, add tests
- **Effort:** 3-4 hours
- **Status:** Needs verification

---

## Priority 2: Feature Completion (Week 6-7)

### Exchange Verification
- **Location:** `src/lib/services/exchange-verification.ts`
- **Issue:** Production verification code commented out, using mocks
- **Impact:** Cannot verify real exchange accounts
- **Solution:** Uncomment and test production API calls
- **Effort:** 1 day (includes exchange API integration testing)
- **Status:** Commented code exists, needs activation

### Rate Limiting
- **Location:** `src/lib/rateLimit.ts`
- **Issue:** TODO for Redis connection
- **Impact:** In-memory rate limiting doesn't scale across instances
- **Solution:** Implement Redis-backed rate limiter or document single-instance strategy
- **Effort:** 3-4 hours
- **Status:** TODO in code

### Notifications
- **Location:** `src/lib/notifications.ts`
- **Issue:** TODO comments for push notification channels
- **Impact:** Limited notification delivery options
- **Solution:** Complete push notification integration (Web Push, Firebase)
- **Effort:** 6-8 hours
- **Status:** TODO in code

---

## Priority 3: Code Quality (Ongoing)

### Type Safety
- **Status:** ✅ Good - No critical @ts-ignore usage outside tests
- **Action:** Continue maintaining strict TypeScript

### Test Coverage
- **Status:** Partial - Some tests exist, many mocks
- **Action:** Increase coverage as features stabilize

### Dead Code
- **Status:** ✅ Cleaned - Removed `TradingChart_old.tsx`, `LockedFeature.tsx`
- **Action:** Continue removing unused code as discovered

---

## Decision Log

### 2025-11-28: Chose MVP Speed (Option A)
- **Rationale:** Align with Blitzkrieg strategy (兵貴神速 - Speed is Essence)
- **Tradeoff:** Accept technical debt for faster time-to-market
- **Mitigation:** Document all debt, centralize mock patterns
- **Next Review:** After Phase 7 completion (Week 4)

---

## Usage

When adding new technical debt:
1. Add entry to appropriate priority section
2. Update "Last Updated" date
3. Link to specific file:line when possible
4. Estimate effort for future planning
