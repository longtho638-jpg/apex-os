# Phase 1: Fix Polar Webhook Tests

**Priority:** Critical
**Status:** Pending

## Context
The tests in `src/app/api/webhooks/__tests__/polar.test.ts` are failing due to two main reasons:
1.  **Signature Mismatch:** The mock signature ('valid') length differs from the mock digest ('valid_digest') length, causing the length check in `verifyPolarWebhook` to fail and return 401 instead of proceeding.
2.  **ReferenceError:** `validateEvent` is used in tests but is not defined/imported, and likely not needed as logic is inside `route.ts`.

## Changes

### 1. Fix Mock Data in `src/app/api/webhooks/__tests__/polar.test.ts`
- **Goal:** Ensure mock signature and mock digest have identical length to pass `verifyPolarWebhook` length check.
- **Action:**
    - Change mock digest to `'valid'` (or change mock signature to `'valid_digest'`).
    - Verify `crypto.timingSafeEqual` mock is reachable.

### 2. Remove `validateEvent` Usage
- **Goal:** Fix `ReferenceError: validateEvent is not defined`.
- **Action:**
    - Remove calls to `validateEvent` in "should handle duplicate transaction idempotently" and "should process checkout.completed event".
    - The validation logic seems to be internal or assumed; since we are testing the `POST` handler which calls `verifyPolarWebhook` (which we mock/control) and then processes logic, we don't need to mock a non-existent validation function unless it was supposed to be imported from `route.ts`. Looking at `route.ts`, there is NO `validateEvent` export or usage. It strictly checks signature then parses JSON.

### 3. Verify Database Error Handling
- **Goal:** Ensure "should return 500 on database error" passes.
- **Action:**
    - With signature fix, this should proceed to logic.
    - Note: `route.ts` catches errors and returns 500. `mockInsert` failing should trigger this CATCH block?
    - `handleCheckoutCompleted` calls `supabase.insert`. If it returns `{ error: ... }`, it logs error but DOES NOT THROW.
    - `POST` handler only returns 500 if the `try/catch` block catches an exception.
    - `supabase.from().insert()` does NOT throw by default, it returns `{ error }`.
    - **Correction needed:** The `route.ts` logic logs error on DB failure but continues to return `NextResponse.json({ received: true })` (Status 200).
    - **Decision:** Either update `route.ts` to throw on DB error (if we want 500), or update Test expectation to 200 (if partial failure is acceptable).
    - **Current Code:**
      ```typescript
      if (txError) logger.error('Error inserting transaction:', txError);
      // ...
      return NextResponse.json({ received: true });
      ```
    - **Observation:** The current code swallows DB errors and returns 200. The test expects 500.
    - **Fix:** Update test expectation to 200 OR update code to throw. Given "Security Audit" context, usually we want to know if webhook failed so Polar retries. Swallowing error implies "we handled it, don't retry". If DB is down, we probably WANT retry.
    - **Recommendation:** Update `route.ts` to throw error if critical DB ops fail, so it returns 500 and provider retries.
    - **Plan:** Modify `route.ts` to throw error if `txError` or `subError` occurs, so the main catch block returns 500.

## Implementation Steps
1.  Modify `src/app/api/webhooks/__tests__/polar.test.ts`:
    - Fix mock signature/digest length mismatch.
    - Remove `validateEvent`.
    - Update "should return 500 on database error" test case or `route.ts`.
2.  Modify `src/app/api/webhooks/polar/route.ts` (Optional but recommended):
    - Throw error on critical DB failure to ensure 500 response (allowing webhook retry).

## Verification
- Run `npm test src/app/api/webhooks/__tests__/polar.test.ts`
- Expect all tests to pass.
