# Apex-OS Fintech: Production Readiness Audit

**Date:** 2026-02-11 15:49 (Asia/Saigon)
**Project:** apex-os (Next.js 16 + React 19 + Supabase + Zustand + Sentry)
**Version:** 1.0.0
**Domain:** Trading Platform — Fintech/Crypto

---

## Dashboard

| Metric | Status | Chi tiết |
|--------|--------|----------|
| **BUILD** | ❌ FAIL | Missing `require-in-the-middle` (Sentry/OpenTelemetry dep) |
| **TESTS** | ✅ 25/25 PASS | 123/123 tests pass, 5.14s runtime |
| **I18N** | ✅ 100% SYNC | 7 locales × 947 keys = 0 missing |
| **SECURITY** | ⚠️ 7.5/10 | CSP tốt nhưng `unsafe-eval`, 19 TODOs, 7 ts-ignore |

---

## 1. BUILD STATUS: ❌ FAIL

```
Error: Cannot find module 'require-in-the-middle'
→ @sentry/nextjs → @opentelemetry/instrumentation → require-in-the-middle
```

### Root Cause

Monorepo pnpm hoisting issue. `@sentry/nextjs@10.27.0` cần `@opentelemetry/instrumentation` → `require-in-the-middle` nhưng package không được hoist vào `apps/apex-os/node_modules/`.

### Fix (1 trong 2 cách)

```bash
# Option A: Install missing dep
npm install require-in-the-middle --save-dev

# Option B: Add to pnpm overrides in root package.json
"pnpm": {
  "overrides": {
    "require-in-the-middle": "^7.0.0"
  }
}
```

### Code Quality Metrics

| Check | Count | Target | Status |
|-------|-------|--------|--------|
| `: any` types | 9 | 0 | ⚠️ (chủ yếu test files) |
| `@ts-ignore/@ts-expect-error` | 7 | 0 | ⚠️ |
| `console.log/warn/error` | 18 | 0 | ✅ (chỉ logger.ts + test) |
| `TODO/FIXME/HACK` | 19 | 0 | ⚠️ (14 files) |

### Project Scale

- **660 source files** (`.ts` + `.tsx`)
- **25 test files** (24 src + 1 backend)
- **Coverage ratio:** ~3.8% files có tests

---

## 2. SECURITY SCORE: 7.5/10

### ✅ Strengths (Tốt)

| Layer | Chi tiết |
|-------|----------|
| **CSP Headers** | Comprehensive — 11 directives, production-grade |
| **HSTS** | `max-age=63072000; includeSubDomains; preload` (2 năm) |
| **XSS Prevention** | `X-XSS-Protection: 0` + CSP (modern approach) + DOMPurify (`isomorphic-dompurify`) |
| **X-Content-Type-Options** | `nosniff` ✅ |
| **Referrer-Policy** | `strict-origin-when-cross-origin` ✅ |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), browsing-topics=()` ✅ |
| **COOP** | `same-origin-allow-popups` (Telegram integration) |
| **Rate Limiting** | 20+ files implement rate limiting (Redis-backed) |
| **CORS** | Configured in `src/lib/api/config.ts` |
| **Auth** | Supabase Auth + JWT (jose) + MFA (TOTP) + WebAuthn/FIDO2 |
| **Password Hashing** | bcrypt + bcryptjs |
| **Input Validation** | zod schemas |
| **Error Tracking** | Sentry configured with source maps |
| **Encryption** | `src/lib/encryption.ts` (AES) |
| **Env Files** | `.env*` in `.gitignore` — NOT tracked ✅ |

### ⚠️ Weaknesses (Cần cải thiện)

| Issue | Severity | Chi tiết |
|-------|----------|----------|
| CSP `unsafe-inline` + `unsafe-eval` | 🟡 MEDIUM | Cần thiết cho Next.js nhưng mở rộng attack surface cho XSS |
| `X-Frame-Options: SAMEORIGIN` | 🟢 LOW | Cho phép framing (cần cho Telegram Mini App) — acceptable |
| No CSP report-uri | 🟡 MEDIUM | Không monitor CSP violations |
| `.env.local` chứa real secrets | 🟡 MEDIUM | VAULT_KEY_MASTER + Vercel OIDC token trên disk (nhưng không tracked) |
| `.env` có placeholder values | 🟢 LOW | Supabase placeholder URLs — cần verify không commit real values |
| No `npm audit` | 🟡 MEDIUM | Monorepo pnpm — cần `pnpm audit` từ root |
| 7 `@ts-expect-error` | 🟡 MEDIUM | Type safety gaps trong production code |
| `images.domains` deprecated | 🟢 LOW | Next.js 16 khuyến nghị dùng `remotePatterns` thay thế |

### Security Stack Overview

```
Auth:           Supabase Auth + JWT + MFA (TOTP) + WebAuthn/FIDO2
Encryption:     AES-256 (src/lib/encryption.ts)
XSS:            DOMPurify (isomorphic-dompurify)
Validation:     Zod schemas
Rate Limiting:  Redis-backed (ioredis + bottleneck)
Password:       bcrypt (cost factor default)
Monitoring:     Sentry (error tracking + performance)
CORS:           Configured per-route
CSP:            11 directives (comprehensive)
```

---

## 3. I18N COMPLETENESS: ✅ 100%

```
Locales: 7 (en, id, ja, ko, th, vi, zh)
Keys per locale: 947
Missing keys: 0 (across ALL locales)
Sync status: ✅ PERFECT
```

| Locale | Keys | Missing | Extra | Status |
|--------|------|---------|-------|--------|
| EN (base) | 947 | — | — | ✅ |
| ID (Indonesia) | 947 | 0 | 0 | ✅ |
| JA (Japanese) | 947 | 0 | 0 | ✅ |
| KO (Korean) | 947 | 0 | 0 | ✅ |
| TH (Thai) | 947 | 0 | 0 | ✅ |
| VI (Vietnamese) | 947 | 0 | 0 | ✅ |
| ZH (Chinese) | 947 | 0 | 0 | ✅ |

**Zero English fallback target: ✅ ĐẠT** — Tất cả locales đồng bộ 100%, không locale nào thiếu key.

---

## 4. TEST RESULTS: ✅ 100% PASS

```
Test Files:  25 passed (25)
Tests:       123 passed (123)
Duration:    5.14s
Framework:   Vitest 4.0.13
```

### Test Suites Breakdown

| Category | Suites | Tests | Status |
|----------|--------|-------|--------|
| API Webhooks (Polar) | 1 | 6 | ✅ |
| API Routes (auth, trade, admin) | 4 | 20 | ✅ |
| Components (payments, pricing) | 5 | 22 | ✅ |
| Lib (jwt, encryption, rate-limit, utils) | 5 | 25 | ✅ |
| Trading (paper-trading, binance, signals) | 3 | 19 | ✅ |
| Security tests | 1 | 6 | ✅ |
| Viral Economics (tier, commission, money-engine) | 3 | 7 | ✅ |
| Backend ML (signal-generator) | 1 | 12 | ✅ |
| Social (twitter-client) | 1 | 6 | ✅ |
| Page tests | 1 | 1 | ✅ |

### Coverage Gaps

- **660 source files** nhưng chỉ **25 test files** (~3.8%)
- Thiếu tests cho: middleware, nhiều API routes, dashboard components, hooks
- Khuyến nghị: Tăng coverage lên >20% trước production launch

---

## 5. TỔNG KẾT & KHUYẾN NGHỊ

### Điểm mạnh

1. **i18n hoàn hảo** — 7 locales × 947 keys, 0 missing
2. **Test suite vững** — 123/123 tests pass, đa dạng categories
3. **Security infrastructure mạnh** — Auth stack đầy đủ (Supabase + JWT + MFA + WebAuthn + bcrypt + DOMPurify + Zod + rate limiting)
4. **Monitoring** — Sentry configured với source maps
5. **CSP comprehensive** — 11 directives, HSTS preload

### Cần fix TRƯỚC production

| Priority | Item | Action |
|----------|------|--------|
| 🔴 CRITICAL | Build fail | Install `require-in-the-middle` hoặc fix pnpm hoisting |
| 🔴 HIGH | 19 TODO/FIXME | Review và resolve trước launch |
| 🟡 MEDIUM | Test coverage 3.8% | Tăng lên ít nhất 20% cho critical paths |
| 🟡 MEDIUM | 9 `any` types | Replace với proper types |
| 🟡 MEDIUM | 7 `@ts-expect-error` | Fix underlying type issues |
| 🟡 MEDIUM | CSP report-uri | Thêm monitoring cho CSP violations |
| 🟢 LOW | `images.domains` deprecated | Migrate sang `remotePatterns` |
| 🟢 LOW | `unsafe-eval` trong CSP | Tighten khi có thể (sau khi test Telegram Mini App) |

---

## VERDICT

```
BUILD_STATUS:       ❌ FAIL (Sentry dep missing — fixable in 1 command)
SECURITY_SCORE:     ⚠️ 7.5/10 (infrastructure mạnh, cần cleanup TODOs + types)
I18N_COMPLETENESS:  ✅ 100% (7 locales × 947 keys × 0 missing)
TEST_PASS_RATE:     ✅ 100% (25/25 suites, 123/123 tests)
OVERALL:            ⚠️ NOT PRODUCTION-READY (fix build + resolve TODOs first)
```
