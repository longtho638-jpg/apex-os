# PROMPT FOR GEMINI CLI - Technical Debt Elimination

Copy and paste this ENTIRE message into Gemini CLI:

---

Execute the Technical Debt Resolution Plan to achieve **zero technical debt** and **100% production-ready** code.

## 📋 Task Overview

**Read**: `docs/TECHNICAL_DEBT_RESOLUTION.md` for complete plan

**Goal**: Fix 4 issues identified in code review
1. ❌ Missing component tests (PaymentMethodSelector, CheckoutModal)
2. ❌ Hardcoded sandbox mode in polar-client.ts
3. ❌ Missing JSDoc @throws clauses
4. ❌ Missing webhook error scenario tests

**Target**: 
- 0 technical debt issues
- 90%+ test coverage
- 110+ total tests
- Complete documentation

---

## 🚀 Execution Plan

### Phase 1: Component Tests (PRIORITY - 1 hour)

**Install dependencies**:
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Create**: `src/components/payments/__tests__/PaymentMethodSelector.test.tsx`

Test cases:
- ✅ Renders both payment options (Polar, Binance Pay)
- ✅ Shows "Save 15%" discount badge on crypto option
- ✅ Calls onChange when option clicked
- ✅ Highlights selected option with blue border
- ✅ Keyboard accessible (tab navigation)

**Create**: `src/components/payments/__tests__/CheckoutModal.test.tsx`

Test cases:
- ✅ Displays tier name and price correctly
- ✅ Shows crypto discount when crypto selected
- ✅ Calls /api/checkout on checkout button click
- ✅ Shows loading state during API call
- ✅ Handles API errors with error message
- ✅ Closes modal on cancel button

**Verify**: Run `npm test` - all tests should pass

**Commit**: 
```bash
git commit -m "test(payment): add component tests for PaymentMethodSelector and CheckoutModal

- Add 12+ tests for React components
- Test user interactions, state changes, API calls
- Improve coverage to ~85%+"
```

---

### Phase 2: Configuration Improvements (15 min)

**Modify**: `src/lib/payments/polar-client.ts` line 6

Change:
```typescript
// Before:
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || 'polar_sk_placeholder',
  server: 'sandbox', // ← Remove hardcoded value
});

// After:
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || 'polar_sk_placeholder',
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
});
```

**Modify**: `.env.example`

Add:
```bash
# Polar Server Mode (sandbox | production)
POLAR_SERVER=sandbox
```

**Verify**: TypeScript compiles without errors

**Commit**:
```bash
git commit -m "refactor(payment): use environment variable for Polar server mode

- Remove hardcoded 'sandbox' value
- Add POLAR_SERVER to .env.example
- Allow dynamic server selection"
```

---

### Phase 3: Documentation Enhancement (30 min)

**Modify**: `src/lib/payments/polar-client.ts`

Add `@throws` to JSDoc:
```typescript
/**
 * Creates a Polar.sh checkout session for a subscription
 * @param params - Checkout parameters including userId and tier
 * @returns Checkout session object
 * @throws {Error} If tier does not support Polar payments
 * @throws {Error} If Polar API request fails
 */
export async function createPolarCheckout({...})

/**
 * Retrieves a Polar.sh checkout session by ID
 * @param checkoutId - The ID of the checkout session
 * @returns Checkout session object
 * @throws {Error} If Polar API request fails
 */
export async function getPolarCheckout(checkoutId: string)
```

**Modify**: `src/lib/payments/binance-pay-client.ts`

Add `@throws` to JSDoc for all 3 functions:
- `createBinancePayOrder`
- `generateBinanceSignature` (internal, no need)
- `queryBinancePayOrder`

**Commit**:
```bash
git commit -m "docs(payment): add @throws clauses to all payment functions

- Document exceptions for polar-client.ts functions
- Document exceptions for binance-pay-client.ts functions
- Improve IDE intellisense and developer experience"
```

---

### Phase 4: Error Test Coverage (45 min)

**Modify**: `src/app/api/webhooks/__tests__/polar.test.ts`

Add error scenario tests:
```typescript
describe('Polar Webhook Error Scenarios', () => {
  it('should return 400 for missing webhook headers', async () => {
    // Test with null headers
  });

  it('should handle missing metadata gracefully', async () => {
    // Test event without userId in metadata
    // Should not crash, skip database insert
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    // Should return 500, not crash
  });

  it('should handle duplicate transaction idempotently', async () => {
    // Mock error code 23505
    // Should log and continue, not fail webhook
  });
});
```

**Modify**: `src/app/api/webhooks/__tests__/binance-pay.test.ts`

Add similar error tests:
- Missing signature header
- Invalid JSON body
- Missing required fields in event
- Database connection errors

**Verify**: Run `npm test` - all new tests pass

**Commit**:
```bash
git commit -m "test(payment): add webhook error scenario tests

- Add 8+ error handling tests
- Test missing headers, invalid JSON, DB errors
- Verify graceful error handling and idempotency
- Improve robustness of webhook handlers"
```

---

### Phase 5: Final Verification

**Run all checks**:
```bash
# TypeScript
npx tsc --noEmit

# Tests with coverage
npm test -- --coverage

# Lint
npm run lint
```

**Expected results**:
- ✅ TypeScript: 0 errors
- ✅ Tests: 110+ tests, 100% pass
- ✅ Coverage: >90%
- ✅ Lint: 0 errors

**Final commit**:
```bash
git commit -m "chore(payment): eliminate all technical debt - 100% production ready

BREAKING CHANGE: Payment system now fully tested and production-ready

- Component tests added (12+ tests)
- Configuration made flexible
- Complete documentation with @throws
- Error scenarios covered (8+ tests)
- Coverage increased to 90%+
- Zero technical debt remaining

Total: 110+ tests, all passing"
```

**Push**:
```bash
git push origin main
```

---

## ✅ Success Criteria

After completion, verify:
- [ ] Total tests: 110+ (currently 93)
- [ ] Test coverage: >90% (currently ~82%)
- [ ] Component tests passing for both components
- [ ] No hardcoded configuration values
- [ ] All functions have @throws documentation
- [ ] Error scenarios tested for both webhooks
- [ ] TypeScript compiles without errors
- [ ] All tests green
- [ ] Technical debt: **0 issues** ✅

---

## 🎯 Important Notes

1. **Test carefully**: After each phase, run `npm test` to ensure nothing breaks
2. **Commit frequently**: After each phase (5 commits total)
3. **Follow conventions**: All commits must use `type(scope): message` format
4. **Maintain quality**: Don't rush, ensure tests are comprehensive
5. **Ask if stuck**: If any errors, describe the issue clearly

---

**Estimated time**: 2-3 hours  
**Current time**: Check your clock  
**Priority**: High (eliminates all technical debt)

Ready to start? Confirm you understand and begin with Phase 1: Install @testing-library/react! 🚀
