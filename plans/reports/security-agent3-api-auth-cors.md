# Security Audit Report: API Route Authentication & CORS Analysis

**Project:** apex-os (ApexRebate Trading Platform)
**Agent:** debugger (Agent 3)
**Date:** 2026-02-11
**Scope:** API route auth coverage, webhook signature verification, CORS, rate limiting, CSRF, input validation
**Classification:** READ-ONLY audit

---

## Executive Summary

Audited 120+ API route files across 12 route groups. Found **5 CRITICAL**, **6 HIGH**, **4 MEDIUM**, and **3 LOW** severity findings. The most dangerous issues are: hardcoded secrets in production routes, complete authentication bypass on financial endpoints (launchpad buy, checkout), and CSRF middleware that likely blocks all external webhook callbacks.

---

## 1. API Route Auth Coverage

### Middleware Auth Architecture

The middleware at `src/middleware.ts` implements a layered security model:

1. **Rate limiting** (all `/api/*`) -- line 58-61
2. **Enterprise API key auth** (`/api/v1/signals`) -- line 64-87
3. **CSRF protection** (POST/PUT/DELETE) -- line 89-91
4. **Admin role check** (`/admin/*`) -- line 94-154
5. **Protected page auth** (dashboard, trade, settings, etc.) -- line 156-209
6. **API token check** (all non-whitelisted API routes) -- line 249-296

### Public API Whitelist (line 252-266)

```
/api/v1/auth/login, /api/v1/auth/signup, /api/v1/auth/callback,
/api/v1/auth/me, /api/auth, /api/debug, /api/v1/public,
/api/webhooks, /api/v1/market/analyze, /api/v1/user/verify-account,
/api/marketplace, /api/v1/referral/stats
```

Plus: `/api/v1/trading/copy-trading` (GET only, line 271).

### Routes Correctly Protected (by default via middleware token check)

All routes NOT in the whitelist above require a valid JWT token. This includes:
- All `/api/v1/admin/*` routes (double-protected: admin role + token)
- All `/api/v1/user/*` routes
- All `/api/v1/trading/*` routes
- All `/api/v1/wallet/*` routes
- All `/api/v1/trade/*` routes
- All `/api/ai/*` routes
- All `/api/v1/guardian/*` routes
- `/api/v1/billing/subscription`

### Routes with Problematic Public Access

| Route | Status | Severity | Issue |
|-------|--------|----------|-------|
| `/api/debug/*` | PUBLIC | **CRITICAL** | Entire debug namespace is whitelisted. `/api/debug/simulate-payout` exposes payout simulation to unauthenticated users |
| `/api/v1/auth/me` | PUBLIC | **HIGH** | Returns authenticated user data but is whitelisted as public. If it returns user info without checking token internally, it leaks user data |
| `/api/v1/market/analyze` | PUBLIC | MEDIUM | Free AI-powered market analysis. Could be abused for resource exhaustion |
| `/api/health/*` | PUBLIC* | LOW | Health endpoints not in whitelist but also have no internal auth. `/api/health` returns basic status. `/api/health/diagnosis` and `/api/health/readiness` not explicitly checked |

*Note: `/api/health` is not explicitly whitelisted but the middleware `startsWith` check at line 268 would not match it. It does pass through the token check at line 273-294, meaning it DOES require auth. This may be unintentional for a health check endpoint.

---

## 2. Webhook Signature Verification

### FINDING [CRITICAL-1]: CSRF Middleware Blocks External Webhooks

**Severity:** CRITICAL
**File:** `src/middleware/csrf.ts` + `src/middleware.ts` line 89-91

The CSRF middleware runs BEFORE the public API whitelist check (line 89 vs line 249). For POST requests, it checks:

```typescript
if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
}
```

External webhook callers (Polar, NOWPayments, Telegram) never send CSRF cookies/headers. The CSRF skip list only exempts:
- `/api/v1/auth/*`
- `/api/auth/*`
- `/api/debug/*`
- `/api/v1/market/analyze`
- `/api/v1/user/verify-account`

**Webhook routes (`/api/webhooks/*`) are NOT exempted from CSRF.** This means all external webhook POST requests are rejected with 403 before reaching the route handler.

**Impact:** Payment confirmations from Polar and NOWPayments, Telegram bot webhooks, and trade execution webhooks are all blocked. Subscriptions are never activated, payouts never confirmed.

### Polar Webhook (`/api/webhooks/polar/route.ts`)

**Status:** GOOD (if CSRF issue is fixed)
- HMAC-SHA256 signature verification using `POLAR_WEBHOOK_SECRET`
- Timing-safe comparison via `crypto.timingSafeEqual`
- Handles `whsec_` prefix stripping
- Idempotent duplicate handling via DB unique constraint (`23505` error code)

### NOWPayments Webhook (`/api/webhooks/nowpayments/route.ts`)

**Severity:** HIGH
**Issue:** Incorrect JSON key sorting for signature verification.

```typescript
const sortedKeys = Object.keys(body).sort();
hmac.update(JSON.stringify(body, sortedKeys));
```

`JSON.stringify(body, sortedKeys)` uses the array as a property **filter**, not an ordering mechanism. Output property order follows the object's enumeration order (insertion order), NOT the sorted array order. If NOWPayments generates HMAC over sorted-key JSON, signatures will mismatch when property order differs.

Additionally: uses `!==` string comparison instead of `crypto.timingSafeEqual`, vulnerable to timing attacks.

### NOWPayments Payout Webhook (`/api/webhooks/nowpayments-payout/route.ts`)

Same JSON sorting issue as above. Same timing attack vulnerability.

### Trade Executed Webhook (`/api/webhooks/trade-executed/route.ts`)

**Severity:** HIGH
Uses plain string comparison against env var:

```typescript
if (signature !== process.env.WEBHOOK_SECRET) {
```

Vulnerable to timing attacks. Should use `crypto.timingSafeEqual`.

### Telegram Webhook (`/api/telegram/webhook/route.ts`)

**Status:** GOOD
- Validates `x-telegram-bot-api-secret-token` header against `TELEGRAM_WEBHOOK_SECRET` env var
- Note: also uses `!==` (timing attack possible but lower risk since Telegram is the only caller)

### Trading Signals Webhook (`/api/v1/trading/signals/webhook/route.ts`)

**Severity:** CRITICAL

```typescript
if (secret !== 'apex-admin-secret') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Hardcoded secret `'apex-admin-secret'` in source code.** Anyone reading the codebase (or the git history) can trigger arbitrary copy trading signals, manipulating user positions and balances.

---

## 3. CORS Configuration

**No explicit CORS headers found** in any API route file. `grep -r "Access-Control" src/app/api/` returned zero matches.

CORS is implicitly handled by Next.js defaults:
- Same-origin requests: allowed
- Cross-origin requests: blocked by default (no `Access-Control-Allow-Origin` header)

**Assessment:** GOOD. No overly permissive CORS. However, the `/api/claude/route.ts` streaming response sets:
```typescript
headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
}
```
No CORS headers, so SSE streaming only works same-origin. This is correct behavior.

---

## 4. Rate Limiting Coverage

### Architecture

- **Global:** `applyRateLimit()` in middleware applies to ALL `/api/*` routes (line 58-61)
- **Standard limit:** 60 requests/minute per IP
- **Institutional limit:** 50 requests/second for `/api/v1/institutional`
- **Auth-sensitive:** 5 attempts per 15 minutes (applied at route level in login handler)

### Per-Route Rate Limiting

| Route | Rate Limit | Assessment |
|-------|------------|------------|
| `/api/v1/auth/login` | `AUTH_SENSITIVE` (5/15min) + global | GOOD -- explicitly rate-limited |
| `/api/v1/auth/signup` | Global only (60/min) | MEDIUM -- should have tighter limit |
| `/api/v1/wallet/withdraw` | Global only (60/min) | HIGH -- financial route needs tighter limit |
| `/api/v1/trade/execute` | Global only (60/min) | MEDIUM -- trading route, global may suffice |
| `/api/v1/payments/withdraw` | Global only (60/min) | HIGH -- financial route needs tighter limit |
| `/api/checkout` | Global only (60/min) | MEDIUM -- checkout abuse possible |
| `/api/v1/launchpad/buy` | Global only (60/min) | **see CRITICAL-3** |
| Cron routes | Global only | LOW -- cron secret protects these |

### FINDING [HIGH-1]: Rate Limiter Fails Open

**File:** `src/lib/rateLimit.ts` lines 55-56, 109-115, 137-138

On any DB error (Supabase down, network issue), the rate limiter returns `success: true`:

```typescript
// Fail open (allow request) if DB is down
return { success: true, limit: config.limit, remaining: 1, reset: now };
```

This means if an attacker can induce DB errors (e.g., through connection exhaustion), rate limiting is completely bypassed. Three separate fail-open paths exist in the code.

### FINDING [MEDIUM-1]: Rate Limit Race Condition

Lines 47-51 read the record, then lines 100-105 call `increment_rate_limit` RPC. Between the read and the RPC call, the count check at line 91 (`record.count >= config.limit`) could be bypassed by concurrent requests. The atomic RPC call handles this, but the early-return at line 91-98 creates a window where the limit is enforced non-atomically.

---

## 5. CSRF Protection

### Architecture

Double Submit Cookie pattern:
1. `injectCsrfToken()` sets `csrf_token` cookie (httpOnly: false, sameSite: strict)
2. `handleCsrf()` validates `x-csrf-token` header matches cookie on POST/PUT/DELETE

### FINDING [HIGH-2]: CSRF Exempts Debug Routes

**File:** `src/middleware/csrf.ts` line 25

```typescript
if (path.startsWith('/api/debug/')) {
    return null; // CSRF skip
}
```

Combined with `/api/debug` being in the public API whitelist (middleware.ts line 258), debug routes like `/api/debug/simulate-payout` are:
1. Publicly accessible (no auth required)
2. CSRF-exempt

An attacker can trigger payout simulation from any cross-origin page.

### FINDING [MEDIUM-2]: Webhook Routes Not CSRF-Exempt

As detailed in CRITICAL-1, `/api/webhooks/*` POST requests fail CSRF validation. The CSRF skip list needs to include `/api/webhooks/`.

### CSRF Coverage for Authenticated Routes

For routes that pass CSRF (non-skipped POST routes with valid tokens), the protection is sound:
- Cookie `sameSite: strict` prevents CSRF from subdomains
- Header+cookie comparison prevents forged requests
- Token is UUID v4 (high entropy)

---

## 6. Input Validation on Critical Routes

### FINDING [CRITICAL-2]: Launchpad Buy -- Complete Auth Bypass

**File:** `src/app/api/v1/launchpad/buy/route.ts`
**Severity:** CRITICAL

```typescript
const userId = body.userId || 'user_123'; // Fallback

// If no wallet found by ID, try to find ANY wallet with enough balance (Demo Mode)
let targetWallet = wallet;
if (!targetWallet) {
    const { data: anyWallet } = await supabase
        .from('wallets')
        .select('*')
        .gte('balance', amount)
        .limit(1)
        .single();
    targetWallet = anyWallet;
}
```

Issues:
1. **userId trusted from request body** -- attacker can spend from ANY user's wallet
2. **Fallback to any wallet with sufficient balance** -- if userId wallet not found, deducts from a random user's wallet
3. **No input validation** -- `amount` is not validated (could be negative, zero, or extremely large)
4. **Uses service_role key** -- bypasses all RLS protections
5. **Non-atomic balance update** -- `wallet.balance - amount` is a read-then-write race condition

### FINDING [CRITICAL-3]: Checkout -- User ID from Header

**File:** `src/app/api/checkout/route.ts` line 42

```typescript
const userId = request.headers.get('x-user-id') || 'user_123';
```

User identity derived from a client-settable header. Any user can:
1. Set `x-user-id` to another user's ID to charge their wallet
2. Omit the header and use the hardcoded `user_123` fallback
3. Combined with the `wallet` payment gateway, deduct funds from any user

**Positive:** This route does have zod validation for the checkout schema, idempotency key requirement, and proper Polar/NOWPayments integration.

### `/api/v1/wallet/withdraw/route.ts` -- GOOD

- Uses Bearer token + `supabase.auth.getUser()` to derive user_id from token (not from body)
- Zod validation for amount (positive, min $10) and crypto_address (TRC20 regex)
- KYC status check before allowing withdrawal
- Checksum-based fraud prevention with server-side secret
- Atomic balance reservation via RPC
- AI agent check for risk scoring
- Audit logging

**Assessment:** This is the most secure financial route in the codebase. Gold standard.

### `/api/v1/payments/withdraw/route.ts` -- GOOD

- Uses `createClient()` server helper with cookie-based auth
- `supabase.auth.getUser()` for identity
- Validates amount > 0, method in ['bank', 'crypto'], destination non-empty
- Wallet balance check against authenticated user's wallet
- Audit logging

**Minor issue:** No zod schema validation (uses manual checks). Less robust but functional.

### `/api/v1/trade/execute/route.ts` -- GOOD

- `authenticateRequest()` helper for auth
- Returns 401 if not authenticated
- Balance check before position creation
- Manual rollback on failure

**Issues:** Non-atomic balance deduction (read-then-write), no input validation on `symbol`, `side`, `amount`, `leverage`, `entryPrice`.

### `/api/v1/auth/login/route.ts` -- GOOD

- Per-IP rate limiting (`AUTH_SENSITIVE`: 5/15min)
- Supabase Auth password verification
- HttpOnly + Secure + SameSite:strict cookie
- MFA support with temporary token
- Audit logging
- No password in response

### `/api/v1/institutional/trade/route.ts` -- GOOD

- `verifyApiKey()` for enterprise auth
- Zod schema validation (`CreateOrderSchema`)
- Proper error handling
- Event bus integration

### `/api/claude/route.ts` -- MEDIUM

- No explicit auth in route (relies on middleware token check)
- No input validation on `prompt` content
- Direct proxy to Claude API -- could be used for prompt injection
- No rate limiting beyond global 60/min

---

## 7. Cron Route Authentication

All 9 cron routes verified for CRON_SECRET check:

| Route | Auth Check | Status |
|-------|------------|--------|
| `/api/cron/auto-content` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/drip-campaign` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/ghost-profit` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/health-check` | `Bearer ${CRON_SECRET}` + null check | GOOD |
| `/api/cron/hive-mind` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/market-analysis` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/referral-reminder` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/upsell-tenure` | `Bearer ${CRON_SECRET}` | GOOD |
| `/api/cron/winback-campaign` | `Bearer ${CRON_SECRET}` | GOOD |

All cron routes also require a valid JWT token via the middleware (they are not in the public whitelist). Double-protected.

---

## 8. Findings Summary

### CRITICAL (5)

| ID | Finding | File | Impact |
|----|---------|------|--------|
| C-1 | CSRF middleware blocks all external webhooks | `middleware/csrf.ts` | Payment webhooks from Polar/NOWPayments rejected. Subscriptions never activate. |
| C-2 | Launchpad buy trusts client userId, finds any wallet as fallback | `api/v1/launchpad/buy/route.ts` | Attacker can drain any user's wallet. Complete auth bypass on financial operation. |
| C-3 | Checkout uses `x-user-id` header for identity | `api/checkout/route.ts` | Attacker can charge another user's wallet by setting header. |
| C-4 | Hardcoded secret `'apex-admin-secret'` in signals webhook | `api/v1/trading/signals/webhook/route.ts` | Anyone with codebase access can trigger copy trading signals, manipulating user positions. |
| C-5 | `/api/debug` namespace publicly accessible | `middleware.ts` line 258 | Payout simulation and potentially other debug endpoints exposed without auth. |

### HIGH (6)

| ID | Finding | File | Impact |
|----|---------|------|--------|
| H-1 | Rate limiter fails open on DB errors (3 paths) | `lib/rateLimit.ts` | Under DB pressure, all rate limits bypassed. |
| H-2 | CSRF exempts `/api/debug/*` | `middleware/csrf.ts` | Debug routes exploitable cross-origin. |
| H-3 | NOWPayments signature uses incorrect JSON sorting | `api/webhooks/nowpayments/route.ts` | Signature verification unreliable. May reject legitimate or accept forged webhooks. |
| H-4 | NOWPayments uses `!==` instead of timing-safe comparison | `api/webhooks/nowpayments/route.ts` | Timing attack to forge webhook signatures. |
| H-5 | Trade webhook uses `!==` for secret comparison | `api/webhooks/trade-executed/route.ts` | Timing attack vulnerability. |
| H-6 | No per-route rate limiting on withdrawal routes | `middleware/rateLimit.ts` | Financial routes use global 60/min limit, should be tighter (e.g., 5/hour). |

### MEDIUM (4)

| ID | Finding | File | Impact |
|----|---------|------|--------|
| M-1 | Analytics track endpoint has no user validation | `api/analytics/track/route.ts` | Anyone can insert arbitrary analytics events. Data pollution. |
| M-2 | Non-atomic balance updates in trade/launchpad | Multiple routes | Race condition allows double-spending under concurrent requests. |
| M-3 | `/api/claude` proxies to AI with no prompt sanitization | `api/claude/route.ts` | Potential for prompt injection, resource abuse. |
| M-4 | `/api/v1/auth/me` whitelisted as public | `middleware.ts` line 256 | May leak user session data if route doesn't internally verify token. |

### LOW (3)

| ID | Finding | File | Impact |
|----|---------|------|--------|
| L-1 | JWT_SECRET fallback chain could result in empty string | `middleware.ts` line 16 | If both env vars missing, JWT verification accepts any token. |
| L-2 | Telegram webhook uses `!==` for secret comparison | `api/telegram/webhook/route.ts` | Minor timing attack risk (single caller). |
| L-3 | `admin/simulate-payout` is a duplicate of debug route | `api/admin/simulate-payout/route.ts` | Protected by admin auth, but functionally identical to unprotected debug version. |

---

## 9. Recommended Fixes (Priority Order)

### Immediate (Block Production Vulnerabilities)

1. **Add `/api/webhooks` to CSRF skip list** in `src/middleware/csrf.ts` line 25:
   ```typescript
   if (path.startsWith('/api/webhooks/')) return null;
   ```

2. **Remove `/api/debug` from public API whitelist** in `src/middleware.ts` line 258. Debug routes should NEVER be publicly accessible.

3. **Fix launchpad buy auth** -- replace client userId with token-derived identity:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   const userId = user.id;
   ```

4. **Fix checkout auth** -- replace `x-user-id` header with proper session/token auth.

5. **Replace hardcoded secret** in signals webhook with `process.env.TRADING_SIGNAL_SECRET`.

### Short-Term (This Sprint)

6. **Fix NOWPayments signature verification** -- use proper sorted JSON stringification or match NOWPayments official SDK approach.

7. **Replace all `!==` secret comparisons with `crypto.timingSafeEqual`** in trade-executed and NOWPayments webhooks.

8. **Add per-route rate limiting** for withdrawal/payment routes (e.g., 5 withdrawals per hour).

9. **Make rate limiter fail closed** (or at minimum, log alerts when failing open).

### Medium-Term

10. Add atomic balance operations via PostgreSQL `FOR UPDATE` locks or RPC functions.
11. Add prompt sanitization/length limits on Claude proxy route.
12. Verify `/api/v1/auth/me` route internally checks token before returning user data.
13. Add input validation (zod) to `trade/execute` route for all parameters.

---

## 10. Architecture Assessment

**Strengths:**
- Layered middleware security (rate limit -> CSRF -> admin auth -> page auth -> API auth)
- Admin routes double-protected (middleware + JWT role check)
- Cron routes all verify CRON_SECRET
- Polar webhook uses timing-safe HMAC verification
- Wallet withdraw route is exemplary (KYC, zod, checksum, atomic RPC, AI agent, audit)
- Enterprise API key auth is well-implemented (hashed keys, per-key rate limits)
- No explicit CORS headers (secure by default)

**Weaknesses:**
- Inconsistent auth patterns across routes (some use `supabase.auth.getUser()`, some trust headers/body)
- CSRF middleware ordering conflict with webhook routes
- Debug routes in production
- Multiple "demo mode" fallbacks still present in financial routes
- Non-atomic balance operations in several routes

---

## Unresolved Questions

1. Is the CSRF middleware actually active in production? If webhooks are working, something may be overriding it (e.g., Vercel middleware config, different deployment setup).
2. Does `/api/v1/auth/me` route handler internally verify the token, or does it return data for any caller since it's whitelisted?
3. Is the launchpad buy route actually used in production, or is it a demo artifact? The code comments suggest "demo" but it may be live.
4. What is the actual NOWPayments signature format? The current implementation may work by coincidence if property order is consistent.
5. Are the health/diagnosis and health/readiness routes intended to be public? They require auth via middleware currently.
