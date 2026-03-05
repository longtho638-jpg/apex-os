# Security Agent 4 — Code-Level Security Fixes

**Date:** 2026-02-11
**Status:** Completed
**Scope:** Debug routes, health endpoints, cron auth, sensitive logging, secret leakage

---

## Issues Found & Fixed

### 1. CRITICAL: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` Exposure
**File:** `src/app/api/v1/wolf-pack/status/route.ts:5`
**Severity:** CRITICAL
**Problem:** Used `process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — the `NEXT_PUBLIC_` prefix exposes env vars to the client bundle. If this variable were ever set, the Supabase service role key would leak to every browser.
**Fix:** Changed to `process.env.SUPABASE_SERVICE_ROLE_KEY` (server-only).

### 2. Debug Routes Public Whitelist
**File:** `src/middleware.ts:258`
**Severity:** MEDIUM
**Problem:** `/api/debug` was whitelisted as a public route, allowing unauthenticated access to `simulate-payout` (reveals tier rate structures and commission logic).
**Fix:** Removed `/api/debug` from whitelist. Added `/api/cron` instead (cron routes have their own CRON_SECRET verification and need to bypass JWT middleware for Vercel Cron to work).

### 3. Token Logging in Client Hook
**File:** `src/hooks/useApi.ts:254`
**Severity:** MEDIUM
**Problem:** `logger.info` logged first 10 characters of auth token on every API request. This runs client-side, exposing token fragments in browser console.
**Fix:** Removed token logging entirely. Only log unauthenticated requests at debug level without any credential data.

### 4. Health Readiness — Env Var Name Disclosure
**File:** `src/app/api/health/readiness/route.ts:8-10`
**Severity:** LOW
**Problem:** Response field names (`apiKey`, `paymentKey`, `environment`) revealed specific env var naming conventions, giving attackers hints about infrastructure.
**Fix:** Renamed to generic labels: `database`, `services`, `payments`.

### 5. Middleware Error Level for Normal Routing
**File:** `src/middleware.ts:250`
**Severity:** LOW (operational)
**Problem:** `logger.error('Middleware API Check:')` logged every API request as an error, creating log noise.
**Fix:** Changed to `logger.debug`.

---

## Verified: No Issues Found

### Cron Routes — All Secured
All 9 cron routes verified to have `CRON_SECRET` authorization check:
- `/api/cron/drip-campaign` — line 8
- `/api/cron/winback-campaign` — line 12
- `/api/cron/upsell-tenure` — line 7
- `/api/cron/ghost-profit` — line 10
- `/api/cron/health-check` — line 18
- `/api/cron/referral-reminder` — line 8
- `/api/cron/hive-mind` — line 8
- `/api/cron/auto-content` — line 8
- `/api/cron/market-analysis` — line 7

### SQL Injection — Safe
All database queries use Supabase client with parameterized queries. No raw SQL construction from user input detected.

### SUPABASE_SERVICE_ROLE_KEY — Server-Only (After Fix)
All remaining uses of `SUPABASE_SERVICE_ROLE_KEY` are in:
- API route handlers (`src/app/api/`)
- Server-side lib files (`src/lib/`)
- Admin scripts (`src/scripts/`)
None in client components (`src/components/`, `src/app/[locale]/`).

### Health Diagnosis Route
`/api/health/diagnosis/route.ts` — Protected by middleware JWT check (not in public whitelist). Returns service availability status and latency, not secret values.

---

## Known Issues Not Fixed (Out of Scope)

### Scripts Logging Credentials
Several admin scripts in `src/scripts/` log passwords and keys:
- `reset_admin_password.ts:67` — logs new password
- `create_verified_user.ts:39` — logs credentials
- `create_admin.ts:25,101` — logs password
- `test-encryption.ts:36-48` — logs API keys/secrets
- `disable_mfa.ts:87` — logs hardcoded password

These are development/admin scripts, not production routes. Flagged for future cleanup but not fixed in this security pass to avoid breaking admin workflows.

---

## Files Modified

| File | Lines Changed | Change |
|------|--------------|--------|
| `src/middleware.ts` | 2 | Replaced `/api/debug` with `/api/cron` in whitelist; error to debug log level |
| `src/app/api/v1/wolf-pack/status/route.ts` | 1 | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_SERVICE_ROLE_KEY` |
| `src/app/api/health/readiness/route.ts` | 3 | Generic field names for readiness checks |
| `src/hooks/useApi.ts` | 4 | Removed token logging |

## Type Check
- `npx tsc --noEmit` — 0 errors in modified files
- 1 pre-existing error in `CheckoutModal.test.tsx` (unrelated)
