# Security Audit Report: Dependencies & Secrets

**Project:** apex-os
**Date:** 2026-02-11
**Scope:** Dependency audit, hardcoded secrets scan, .gitignore verification, env var security, test suite execution

---

## 1. Dependency Audit (pnpm audit)

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Low | 1 |
| **Total** | **2** |

### HIGH: Fastify Content-Type Header Bypass

- **Package:** fastify < 5.7.2
- **Path:** apps__engine > fastify (workspace dependency, not direct apex-os dep)
- **Advisory:** GHSA-jx2c-rxcm-jvmq — Tab character in Content-Type header allows body validation bypass
- **Fix:** Upgrade fastify to >= 5.7.2
- **Impact on apex-os:** LOW — vulnerability is in `apps/engine`, not in apex-os directly

**NOTE:** npm audit could not run (ENOLOCK error despite package-lock.json existing). Project uses pnpm workspace. pnpm audit succeeded.

---

## 2. Security Test Suite Results

**Runner:** vitest | **Duration:** 4.99s

| Metric | Value |
|--------|-------|
| Test Files | 25 total, 24 passed, **1 failed** |
| Tests | 123 total, 111 passed, **12 failed** |

### Passing Security Tests (all GREEN)

- `src/__tests__/security.test.ts` — 6/6 passed
  - Blocks unauthorized access to /api/admin
  - Blocks unauthorized access to protected API
  - Allows public API routes
  - Allows authorized access with Bearer token
  - Blocks invalid token
  - Blocks non-admin user from /api/admin
- `src/lib/payments/__tests__/polar-client.test.ts` — 4/4 passed
- `src/lib/__tests__/rate-limit.test.ts` — 3/3 passed
- `src/lib/validations/__tests__/finance.test.ts` — 10/10 passed
- `src/app/api/webhooks/__tests__/polar.test.ts` — passed
- `src/__tests__/integration/money-engine.test.ts` — passed

### Failed Tests (12)

All failures in `backend/ml/__tests__/signal-generator.test.ts` — caused by missing Supabase env vars in test environment, NOT a security issue. The `SignalGenerator` constructor throws `Missing Supabase configuration` because `CONFIG.SUPABASE.URL` and `CONFIG.SUPABASE.KEY` are not set.

**Severity:** INFO — Test infrastructure issue, not a security vulnerability.

### Existing Security Test Script (`scripts/security-test.ts`)

Comprehensive regression test covering:
- Middleware & Access Control (unauthorized access, invalid tokens)
- IDOR prevention (cross-user order access)
- Webhook signature validation (missing/invalid signatures)
- API abuse protection (negative leverage, extreme leverage)
- User enumeration prevention (signup with existing email)

**Runner:** `npm run test:security` (requires `vitest.security.config.ts` + running local server)
**Status:** Not runnable in CI without local server. Test logic is SOUND.

---

## 3. .gitignore Verification

| Pattern | Status | Notes |
|---------|--------|-------|
| `.env*` (line 34) | PASS | Catches ALL .env variants |
| `.env*.local` (line 46) | PASS | Redundant but harmless |
| `node_modules` | PASS | Listed |
| `*.pem` | PASS | Private keys excluded |
| `.gemini/payment_credentials_template.txt` | PASS | Explicitly excluded |

**Verdict:** PASS — All sensitive file patterns properly covered. The `.env*` glob on line 34 covers `.env`, `.env.local`, `.env.production`, etc.

---

## 4. Hardcoded Secrets Scan

### MEDIUM: Client-Side Mock API Key Uses `sk_live_` Prefix

- **File:** `src/app/[locale]/enterprise/dashboard/page.tsx:41`
- **Code:** `const key = 'sk_live_' + Array.from({length: 32}, ...)`
- **Risk:** Generates mock API keys with production-looking `sk_live_` prefix client-side. Not a real key, but:
  - Users may mistake these for real production keys
  - Could train users to treat `sk_live_` keys casually
  - Security scanners will flag this as a hardcoded production key
- **Fix:** Use a custom prefix like `apex_key_` or `demo_` instead of `sk_live_`

### MEDIUM: Hardcoded Passwords in Utility Scripts

- **File:** `src/scripts/create_verified_user.ts:23` — `password = 'password123'`
- **File:** `src/scripts/create_admin.ts:21` — `password = 'Admin123!@#'`
- **File:** `scripts/security-test.ts:14` — `USER_PASSWORD = 'Admin123!@#'`
- **Risk:** These scripts are committed to git. Even though they are dev/test scripts, hardcoded passwords in VCS are bad practice.
- **Fix:** Read passwords from env vars or generate random ones at runtime.

### LOW: Test Data in Encryption Test

- **File:** `src/scripts/test-encryption.ts:34-35`
- **Code:** `apiKey = 'BINANCE_API_KEY_ABC123'`, `apiSecret = 'binance_secret_xyz789'`
- **Risk:** Clearly fake test data. Not real credentials. Has production guard (`NODE_ENV !== 'production'`).
- **Fix:** No action needed, but could use more obviously fake values.

### Stripe/GitHub/Slack/AWS Key Scan Results

| Pattern | Files Found | Status |
|---------|-------------|--------|
| `sk_live\|sk_test\|pk_live\|pk_test` | 2 files | MEDIUM (see above) |
| `eyJ` (JWT base64) | 0 | PASS |
| `ghp_\|gho_\|github_pat` | 0 | PASS |
| `xoxb-\|xoxp-` (Slack) | 0 | PASS |
| `AKIA\|ASIA` (AWS) | 0 | PASS |
| `console.log(.*key\|secret\|password)` | 0 | PASS |
| `eval()` | 0 | PASS |
| `innerHTML\|document.write` | 0 | PASS |

---

## 5. Environment Variable Security

### .env.example Analysis (Root)

| Variable | Type | Exposed to Browser? | Assessment |
|----------|------|---------------------|------------|
| `POLAR_ACCESS_TOKEN` | Server-only | No | PASS |
| `POLAR_ORGANIZATION_ID` | Server-only | No | PASS |
| `POLAR_WEBHOOK_SECRET` | Server-only | No | PASS |
| `NOWPAYMENTS_API_KEY` | Server-only | No | PASS |
| `NOWPAYMENTS_IPN_SECRET` | Server-only | No | PASS |
| `NEXT_PUBLIC_APP_URL` | Public | Yes | PASS — safe URL |
| `PAYMENT_SUCCESS_URL` | Server-only | No | PASS |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | PASS — designed to be public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | PASS — public anon key, protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | No | PASS |

**Verdict:** PASS — No sensitive keys are exposed via `NEXT_PUBLIC_*` prefix. All public vars are safe for browser exposure.

### NEXT_PUBLIC_* Vars Used in Codebase

| Variable | Risk | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | None | Public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | None | Public by design, RLS protects data |
| `NEXT_PUBLIC_APP_URL` | None | Just the app URL |
| `NEXT_PUBLIC_SENTRY_DSN` | None | Public DSN is standard |
| `NEXT_PUBLIC_POSTHOG_KEY` | None | Public analytics key |
| `NEXT_PUBLIC_DEBUG_MODE` | LOW | Should be `false` in production |
| `NEXT_PUBLIC_SUPABASE_REFERENCE_ID` | None | Used for cookie naming |
| `NEXT_PUBLIC_WS_URL` | None | WebSocket endpoint |
| `NEXT_PUBLIC_API_URL` | None | API endpoint |

---

## 6. Security Architecture Findings

### MEDIUM: JWT Secret Fallback to Service Role Key

- **Files:** `src/middleware.ts:15-17`, `src/middleware/auth-guard.ts:4-6`
- **Code:** `process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''`
- **Risk:** Using the service role key as JWT verification secret is an anti-pattern. If `SUPABASE_JWT_SECRET` is not set, the service role key is used, and the empty string `''` is a final fallback that would accept any JWT.
- **Fix:** Make `SUPABASE_JWT_SECRET` required (throw error if missing). Remove empty string fallback.

### MEDIUM: CSP Allows `'unsafe-inline'` and `'unsafe-eval'`

- **File:** `next.config.mjs:24`
- **CSP script-src:** `'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org ...`
- **Risk:** `'unsafe-eval'` allows `eval()`, `Function()`, etc. — significantly weakens CSP. `'unsafe-inline'` allows inline `<script>` tags.
- **Mitigating factor:** Next.js requires `'unsafe-eval'` in development, and some third-party scripts (TradingView) may require it.
- **Fix:** Use nonces or hashes instead of `'unsafe-inline'`. Check if `'unsafe-eval'` can be removed in production CSP.

### GOOD: Security Headers Configured

All key headers present in `next.config.mjs`:
- Content-Security-Policy (with caveats above)
- Strict-Transport-Security: `max-age=63072000; includeSubDomains; preload`
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `SAMEORIGIN`
- Referrer-Policy: `strict-origin-when-cross-origin`
- Permissions-Policy: camera, microphone, geolocation denied
- X-DNS-Prefetch-Control: `on`

### GOOD: XSS Prevention

- `dangerouslySetInnerHTML` used only in SEO components (JsonLd) with `safeJsonLd()` sanitizer that escapes `<` characters
- No `eval()`, no `innerHTML`, no `document.write` in src/
- React auto-escapes JSX output

### GOOD: Auth & Middleware

- Rate limiting middleware implemented
- CSRF protection middleware exists
- Webhook signature validation for Polar
- Enterprise auth middleware layer
- Request signature validation middleware

---

## Summary by Severity

| Severity | Count | Items |
|----------|-------|-------|
| CRITICAL | 0 | - |
| HIGH | 1 | Fastify CVE in workspace (not direct dep) |
| MEDIUM | 4 | sk_live_ prefix, hardcoded passwords, JWT fallback, CSP unsafe-eval |
| LOW | 2 | Test fake API keys, NEXT_PUBLIC_DEBUG_MODE |
| INFO | 1 | Signal generator tests fail (env config) |

---

## Recommendations (Prioritized)

1. **[MEDIUM]** Set `SUPABASE_JWT_SECRET` as REQUIRED env var. Remove `|| ''` fallback from `middleware.ts` and `auth-guard.ts`.
2. **[MEDIUM]** Replace `sk_live_` prefix in enterprise dashboard mock key with a custom prefix like `apex_key_`.
3. **[MEDIUM]** Move hardcoded passwords in `create_admin.ts` and `create_verified_user.ts` to env vars or generate randomly.
4. **[MEDIUM]** Evaluate removing `'unsafe-eval'` from CSP in production builds. Use nonces for `'unsafe-inline'`.
5. **[LOW]** Fix `signal-generator.test.ts` to properly mock Supabase config.
6. **[LOW]** Upgrade fastify in `apps/engine` to >= 5.7.2.
7. **[LOW]** Ensure `NEXT_PUBLIC_DEBUG_MODE` is unset or `false` in production.

---

## Unresolved Questions

1. The fastify HIGH vulnerability is in `apps__engine`, not `apex-os` directly. Is `apps/engine` deployed alongside apex-os? If not, this is a workspace-level concern only.
2. Is `vitest.security.config.ts` used in any CI pipeline? The `scripts/security-test.ts` regression suite requires a running local server — unclear if it runs in CI.
3. Does the production deployment set `SUPABASE_JWT_SECRET`? If not, the empty string fallback in JWT verification is a critical auth bypass vector.
