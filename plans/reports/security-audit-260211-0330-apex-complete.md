# Security Audit: apex-os — Complete Report

**Date:** 2026-02-11
**Status:** COMPLETED
**Mode:** /cook --auto --parallel (4 agents)

## Summary

Comprehensive security audit across the apex-os trading platform. 4 parallel agents covered CSP/XSS, dependencies/secrets, API auth/CORS, and code-level fixes. **5 CRITICAL, 7 HIGH, 8 MEDIUM, 5 LOW** findings identified. **7 issues fixed directly**, rest documented for prioritized remediation.

## Agent Execution

| Agent | Scope | Report |
|-------|-------|--------|
| Agent 1 (code-reviewer) | CSP headers, XSS vectors, security headers | `security-agent1-csp-headers.md` |
| Agent 2 (tester) | npm audit, secrets scan, .gitignore, env vars | `security-agent2-deps-secrets.md` |
| Agent 3 (debugger) | API route auth, webhook signatures, CORS, rate limiting, CSRF, input validation | `security-agent3-api-auth-cors.md` |
| Agent 4 (fullstack-developer) | Fix debug routes, secret exposure, token logging | `security-agent4-fixes.md` |

## Changes Made (7 fixes)

| # | File | Change | Severity |
|---|------|--------|----------|
| 1 | `src/components/seo/StructuredData.tsx` | Added `safeJsonLd()` XSS sanitizer for JSON-LD output | HIGH |
| 2 | `next.config.mjs` | Added `Cross-Origin-Opener-Policy: same-origin-allow-popups` | MEDIUM |
| 3 | `src/middleware.ts` | Removed `/api/debug` from public whitelist, added `/api/cron` | CRITICAL |
| 4 | `src/middleware.ts` | Changed API check log from `error` to `debug` level | LOW |
| 5 | `src/app/api/v1/wolf-pack/status/route.ts` | Fixed `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_SERVICE_ROLE_KEY` | CRITICAL |
| 6 | `src/hooks/useApi.ts` | Removed auth token logging from client-side hook | MEDIUM |
| 7 | `src/app/api/health/readiness/route.ts` | Replaced env var names with generic labels in readiness response | LOW |

## Findings by Severity

### CRITICAL (5) — Require Immediate Attention

| ID | Finding | Status |
|----|---------|--------|
| C-1 | CSRF middleware blocks external webhooks (`/api/webhooks/*` not in CSRF skip list) | **OPEN** — add `/api/webhooks/` to CSRF skip list in `src/middleware/csrf.ts` |
| C-2 | Launchpad buy trusts client `userId`, fallback to any wallet with balance | **OPEN** — replace with `supabase.auth.getUser()` in `api/v1/launchpad/buy/route.ts` |
| C-3 | Checkout uses `x-user-id` header for identity with `user_123` fallback | **OPEN** — replace with session/token auth in `api/checkout/route.ts` |
| C-4 | Hardcoded secret `'apex-admin-secret'` in signals webhook | **OPEN** — replace with `process.env.TRADING_SIGNAL_SECRET` |
| C-5 | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` exposed service key to client bundle | **FIXED** — changed to `SUPABASE_SERVICE_ROLE_KEY` |

### HIGH (7)

| ID | Finding | Status |
|----|---------|--------|
| H-1 | Rate limiter fails open on DB errors (3 code paths) | **OPEN** |
| H-2 | Debug routes public + CSRF-exempt (payout simulation exposed) | **FIXED** — removed from public whitelist |
| H-3 | NOWPayments signature uses incorrect JSON key sorting | **OPEN** |
| H-4 | NOWPayments uses `!==` instead of timing-safe comparison | **OPEN** |
| H-5 | Trade webhook uses `!==` for secret comparison | **OPEN** |
| H-6 | No per-route rate limiting on withdrawal/payment routes | **OPEN** |
| H-7 | XSS in StructuredData.tsx — `</script>` injection via blog post data | **FIXED** — `safeJsonLd()` sanitizer |

### MEDIUM (8)

| ID | Finding | Status |
|----|---------|--------|
| M-1 | `sk_live_` prefix in client-side mock key generation | **OPEN** |
| M-2 | Hardcoded passwords in admin scripts (`Admin123!@#`, `password123`) | **OPEN** |
| M-3 | JWT secret fallback to `SUPABASE_SERVICE_ROLE_KEY || ''` — empty string dangerous | **OPEN** |
| M-4 | CSP allows `unsafe-inline` and `unsafe-eval` | **ACCEPTED** — required by Next.js + TradingView |
| M-5 | Non-atomic balance updates in trade/launchpad routes | **OPEN** |
| M-6 | `/api/claude` proxies to AI with no prompt sanitization | **OPEN** |
| M-7 | Token logging in client-side `useApi.ts` hook | **FIXED** |
| M-8 | `/api/v1/auth/me` whitelisted as public | **OPEN** — verify internal token check |

### LOW (5)

| ID | Finding | Status |
|----|---------|--------|
| L-1 | Health readiness response revealed env var naming | **FIXED** |
| L-2 | Middleware logged all API requests as `error` | **FIXED** |
| L-3 | Fastify CVE in workspace (indirect dep, not apex-os) | **OPEN** — upgrade in apps/engine |
| L-4 | `NEXT_PUBLIC_DEBUG_MODE` should be unset in production | **OPEN** |
| L-5 | Test fake API keys use obviously real-looking prefixes | **OPEN** |

## Security Posture Assessment

### Strong Areas
- CSP comprehensive with strict defaults (`default-src 'self'`, `object-src 'none'`, `form-action 'self'`)
- HSTS with preload, 2-year max-age
- All security headers present (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Polar webhook uses timing-safe HMAC-SHA256 verification
- Admin routes double-protected (middleware JWT + role check)
- All 9 cron routes verify CRON_SECRET
- Wallet withdraw route is exemplary (KYC, zod, checksum, atomic RPC, AI risk scoring, audit logging)
- Enterprise API key auth well-implemented (hashed keys, per-key rate limits)
- No explicit CORS headers (secure-by-default)
- No SQL injection vectors (all queries use Supabase client with parameterized queries)
- No real secrets found in source code (AWS, GitHub, Slack scans clean)
- `.gitignore` properly configured for all `.env*` variants
- `NEXT_PUBLIC_*` vars are all safe for browser exposure
- All 6 security middleware tests pass

### Weak Areas
- Inconsistent auth patterns (some routes trust headers/body, others use token-derived identity)
- CSRF middleware ordering blocks external webhook POST requests
- Demo mode fallbacks remain in financial routes (launchpad buy)
- Multiple `!==` string comparisons for secret verification (timing attack vectors)
- Rate limiter fails open on DB errors

## Verification

```
tsc --noEmit: 0 new errors (1 pre-existing in CheckoutModal.test.tsx)
Security tests: 6/6 passed
npm audit: 0 critical, 1 high (indirect), 1 low
```

## Recommended Priority Actions

1. **[CRITICAL]** Add `/api/webhooks/` to CSRF skip list — payment webhooks may be blocked
2. **[CRITICAL]** Fix launchpad buy and checkout auth — replace client-settable identity with token-derived
3. **[CRITICAL]** Replace hardcoded `'apex-admin-secret'` with env var
4. **[HIGH]** Replace all `!==` secret comparisons with `crypto.timingSafeEqual`
5. **[HIGH]** Fix NOWPayments signature verification
6. **[HIGH]** Add per-route rate limiting on financial routes

## Unresolved Questions

1. Is CSRF middleware actually active in production? If webhooks work today, something may override it
2. Is launchpad buy route used in production or a demo artifact?
3. Does `/api/v1/auth/me` internally verify token before returning user data?
4. Should `SUPABASE_JWT_SECRET` be made mandatory (fail-hard instead of fallback)?
