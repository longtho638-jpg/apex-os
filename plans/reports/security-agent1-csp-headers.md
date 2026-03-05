# Security Audit Report: CSP Headers, Security Headers & XSS Review

**Agent:** code-reviewer (Agent 1)
**Date:** 2026-02-11
**Scope:** CSP policy, security headers, XSS vectors in apex-os

---

## Summary

Overall security header posture is **strong**. One **high-priority XSS fix** applied to `StructuredData.tsx`. One **medium-priority header** (COOP) added. CSP `unsafe-inline`/`unsafe-eval` cannot be removed due to Next.js and TradingView widget requirements.

---

## 1. CSP Analysis (`next.config.mjs` lines 20-35)

### `unsafe-inline` in script-src -- CANNOT REMOVE

**Why it must stay:**
- Next.js injects inline `<script>` tags for page data (`__NEXT_DATA__`), hydration markers, and chunk loading
- Without nonce-based CSP (which requires custom `_document.tsx` + server-side nonce generation), Next.js breaks completely
- The TradingView widget embed (`s.tradingview.com/widgetembed/`) loaded via iframe in `SignalInspector.tsx` may also inject inline scripts inside its own frame

**Mitigation path (future):** Implement nonce-based CSP using Next.js `experimental.sri` config + custom `headers()` with per-request nonces. This is a non-trivial change requiring middleware modifications.

### `unsafe-eval` in script-src -- CANNOT REMOVE

**Why it must stay:**
- The `lightweight-charts` library (TradingView's charting lib used in `TradingChart.tsx`) uses `new Function()` internally for performance-critical rendering paths
- Some React development tooling uses eval-like patterns
- Removing `unsafe-eval` in production would risk runtime breakage of the charting components without exhaustive QA

**Mitigation path (future):** Test production build with `unsafe-eval` removed. If charts render correctly, remove it. This needs a full regression test.

### connect-src whitelist -- ACCEPTABLE

The broad connect-src list is justified:
- `*.supabase.co` / `wss://*.supabase.co` -- Supabase Realtime + API
- `wss://stream.binance.com` -- Live price WebSocket feed
- `wss://ws.okx.com` -- OKX exchange WebSocket
- `*.tradingview.com` -- TradingView widget data
- `api.coingecko.com` -- Market data API
- `api.binance.com` -- Binance REST API
- `vercel.live` / `*.vercel.app` -- Vercel preview/dev tooling

Each entry serves a specific, documented purpose. No unnecessary wildcards detected.

### Other CSP directives -- WELL CONFIGURED

- `default-src 'self'` -- restrictive default
- `object-src 'none'` -- blocks Flash/Java plugins
- `base-uri 'self'` -- prevents base tag injection
- `form-action 'self'` -- prevents form hijacking
- `frame-ancestors 'self' https://telegram.org https://*.telegram.org` -- allows Telegram miniapp embedding only
- `worker-src 'self' blob:` -- allows service workers and blob workers

---

## 2. XSS Vector Audit

### 2a. `JsonLd.tsx` -- SAFE

All three functions (`OrganizationJsonLd`, `SoftwareAppJsonLd`, `FAQPageJsonLd`) use the `safeJsonLd()` helper which replaces `<` with `\u003c`, preventing `</script>` tag injection. All data is hardcoded string literals (no user input). **No action needed.**

### 2b. `StructuredData.tsx` -- FIX APPLIED (was HIGH priority)

**Vulnerability found:** `BlogPostStructuredData` received `post.title` and `post.seo_keywords` from Supabase `blog_posts` table (admin-created content) and passed them through raw `JSON.stringify()` to `dangerouslySetInnerHTML`.

**Attack vector:** If `post.title` contained `</script><script>alert(1)</script>`, the JSON-LD `<script>` tag would be broken out of, enabling arbitrary script execution. While this requires admin-level database access to exploit, defense-in-depth demands sanitization.

**Fix applied:** Added `safeJsonLd()` helper (same pattern as `JsonLd.tsx`) that escapes `<` to `\u003c` before injection.

**File:** `/Users/macbookprom1/mekong-cli/apps/apex-os/src/components/seo/StructuredData.tsx`

**Before:**
```tsx
dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
```

**After:**
```tsx
const safeJsonLd = (data: Record<string, unknown>) => {
  return JSON.stringify(data).replace(/</g, '\\u003c');
};
// ...
dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
```

### 2c. Other XSS vectors -- NONE FOUND

- No `innerHTML`, `outerHTML`, `document.write`, or `eval()` usage in source
- `document.createElement('a')` usage (6 files) is for safe download link creation only
- `ReactMarkdown` used in blog page (`blog/[slug]/page.tsx`) -- renders markdown safely by default (no raw HTML pass-through)
- No `ref` callbacks that write to DOM directly

---

## 3. Security Headers Completeness

### Present and correctly configured:

| Header | Value | Status |
|--------|-------|--------|
| Content-Security-Policy | Comprehensive policy | OK |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | OK (2 years, preload) |
| X-Content-Type-Options | `nosniff` | OK |
| X-Frame-Options | `SAMEORIGIN` | OK |
| Referrer-Policy | `strict-origin-when-cross-origin` | OK |
| Permissions-Policy | camera, mic, geo, browsing-topics disabled | OK |
| X-DNS-Prefetch-Control | `on` | OK |
| X-XSS-Protection | `0` | OK (correct modern approach -- deprecated header, setting to 0 avoids browser bugs) |

### Added:

| Header | Value | Rationale |
|--------|-------|-----------|
| Cross-Origin-Opener-Policy (COOP) | `same-origin-allow-popups` | Protects against Spectre-class cross-origin attacks while allowing Telegram OAuth popups and payment redirects to function |

**File:** `/Users/macbookprom1/mekong-cli/apps/apex-os/next.config.mjs` (line 66-68)

### NOT added (would break functionality):

| Header | Why NOT added |
|--------|---------------|
| Cross-Origin-Embedder-Policy (COEP) | Setting `require-corp` would block the TradingView iframe embed (`s.tradingview.com/widgetembed/`) and Telegram login widget. These cross-origin resources do not set `Cross-Origin-Resource-Policy` headers, so requiring CORP would break them. |
| Cross-Origin-Resource-Policy (CORP) | Only useful in conjunction with COEP. Since COEP cannot be enabled, CORP provides minimal additional protection on its own. Adding `cross-origin` would be a no-op. |

---

## 4. Middleware Security Review (bonus scout findings)

### CSRF Protection (`src/middleware/csrf.ts`) -- GOOD

- Double Submit Cookie pattern correctly implemented
- Safe methods (GET/HEAD/OPTIONS) correctly excluded
- Auth endpoints correctly whitelisted
- Cookie set with `sameSite: 'strict'` and `secure: true` in production
- `httpOnly: false` is correct here since JS must read the cookie to send it as header

### Rate Limiting (`src/middleware/rateLimit.ts`) -- GOOD

- IP-based rate limiting on all API routes
- Proper `X-RateLimit-*` headers in 429 responses
- Institutional endpoints get higher limits (50/s vs standard)

### JWT Verification (`src/middleware.ts`) -- GOOD

- Uses `jose` library (`jwtVerify`) for JWT validation
- Admin routes properly check for `admin`/`service_role`/`super_admin` roles
- Protected routes redirect to login with return URL
- API routes return proper 401/403 JSON responses

### Minor observation:

- `src/middleware.ts` line 16: JWT_SECRET fallback to `SUPABASE_SERVICE_ROLE_KEY` when `SUPABASE_JWT_SECRET` is not set. This works but ideally `SUPABASE_JWT_SECRET` should always be explicitly set to avoid confusion.

---

## 5. `vercel.json` -- NO CHANGES NEEDED

Current `vercel.json` only has build config and crons. Security headers configured in `next.config.mjs` are automatically applied by Vercel's Next.js integration. No duplication needed.

---

## Changes Made

| File | Change | Priority |
|------|--------|----------|
| `src/components/seo/StructuredData.tsx` | Added `safeJsonLd()` to prevent `</script>` injection XSS | HIGH |
| `next.config.mjs` | Added `Cross-Origin-Opener-Policy: same-origin-allow-popups` header | MEDIUM |

## TypeScript Verification

```
npx tsc --noEmit -- PASS (only pre-existing error in CheckoutModal.test.tsx, unrelated)
```

---

## Unresolved Questions

1. **Can `unsafe-eval` be removed from script-src in production?** Requires testing the production build with `lightweight-charts` rendering. If charts work without eval, it can be removed for a meaningful CSP improvement.

2. **Nonce-based CSP for removing `unsafe-inline`?** Next.js supports experimental SRI/nonce features. Implementing would eliminate the biggest CSP weakness but requires non-trivial middleware changes and testing.

3. **JWT_SECRET fallback chain in middleware:** Should `SUPABASE_JWT_SECRET` be made mandatory instead of falling back to `SUPABASE_SERVICE_ROLE_KEY`? This is a deployment config concern, not a code vulnerability.
