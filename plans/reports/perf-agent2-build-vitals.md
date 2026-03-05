# Performance Audit: Build Analysis & Core Web Vitals — apex-os

**Agent:** debugger-ad731f8
**Date:** 2026-02-11
**Scope:** next.config.mjs, loading boundaries, fonts, scripts, route structure, middleware, CSS

---

## Executive Summary

apex-os has **critical performance anti-patterns** that will severely impact Core Web Vitals (LCP, FID/INP, CLS). The two worst offenders are:

1. **`force-dynamic` on the root locale layout** -- disables ALL static page generation for the entire site
2. **Database-backed rate limiting in middleware** -- adds 1-3 Supabase round-trips to every API request at the edge

Secondary issues: zero `loading.tsx` files, no `Suspense` boundaries, heavy providers wrapping all routes, lucide-react barrel imports across 214 files, Sentry at 100% trace sampling.

**Estimated Impact:** LCP penalty 500-2000ms, FID/INP penalty 200-500ms from oversized JS bundles, TTFB penalty on all pages from force-dynamic.

---

## 1. next.config.mjs Analysis

**File:** `/Users/macbookprom1/mekong-cli/apps/apex-os/next.config.mjs`

| Setting | Status | Impact |
|---------|--------|--------|
| `reactCompiler: true` | GOOD | Reduces re-renders |
| `images.formats: ['avif', 'webp']` | GOOD | Optimal image formats |
| `images.domains` configured | GOOD | Supabase storage |
| `optimizePackageImports` | **MISSING** | lucide-react, recharts, framer-motion not tree-shaken |
| `modularizeImports` | **MISSING** | No barrel import optimization |
| Bundle analyzer | **MISSING** | No visibility into bundle composition |
| Turbopack (prod) | N/A | Only dev mode (`next dev --turbopack`) |
| `widenClientFileUpload` (Sentry) | CONFIGURED | Increases build time for better stack traces |

### Recommendations

```js
// Add to nextConfig:
experimental: {
  optimizePackageImports: [
    'lucide-react',     // 214 files import this
    'recharts',         // Heavy charting lib
    'framer-motion',    // Animation lib
    '@radix-ui/react-dialog',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    'date-fns',
  ],
},
```

**Priority: HIGH** -- lucide-react alone has 222 import occurrences across 214 files. Without `optimizePackageImports`, the entire icon library may be bundled.

---

## 2. Loading Boundaries (loading.tsx) Analysis

### Coverage

| Boundary Type | Count | Status |
|--------------|-------|--------|
| `loading.tsx` | **0** | CRITICAL -- zero coverage |
| `error.tsx` | 1 | Minimal -- only at `[locale]/error.tsx` |
| `not-found.tsx` | **0** | MISSING |
| `<Suspense>` usage | **0** | No Suspense boundaries anywhere |
| `next/dynamic` usage | **1** | Only `dashboard/overview/page.tsx` |

### Route Count

- **90+ page.tsx files** under `[locale]/`
- **35+ route directories** (admin, dashboard, trading, etc.)
- **0 loading.tsx** files for any of them

### Impact

- No streaming SSR -- users see nothing until entire page JS downloads + renders
- No progressive loading for heavy pages (trade, dashboard, admin)
- CLS risk -- content shifts as components mount without skeleton placeholders

### Recommendations

**Priority: CRITICAL** -- Add `loading.tsx` to at minimum:

```
src/app/[locale]/loading.tsx                     # Root fallback
src/app/[locale]/dashboard/loading.tsx           # Dashboard routes
src/app/[locale]/admin/loading.tsx               # Admin routes
src/app/[locale]/trading/loading.tsx             # Trading routes
src/app/[locale]/trade/loading.tsx               # Trade page (heavy charts)
```

Example minimal loading.tsx:
```tsx
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#030303]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );
}
```

---

## 3. Route Structure & Code Splitting

### Layout Hierarchy

```
src/app/layout.tsx              (root -- Web3Provider, TelegramProvider, LazyMotion)
  src/app/[locale]/layout.tsx   (force-dynamic -- NextIntl, WagmiProvider, AuthProvider)
    src/app/[locale]/dashboard/layout.tsx  ('use client' -- Sidebar, WinStreak, SupportChat)
    src/app/[locale]/admin/layout.tsx      (server -- Supabase auth check, AdminSidebar)
```

### Critical Issues

#### Issue A: `export const dynamic = 'force-dynamic'` on locale layout

**File:** `src/app/[locale]/layout.tsx` line 1

This single line **disables static generation for EVERY page** under `[locale]/`. That means:
- Landing page (`/en`) -- dynamically rendered on every request
- Pricing page -- dynamically rendered
- Legal pages (terms, privacy, cookies) -- dynamically rendered
- Blog pages -- dynamically rendered
- All 90+ pages -- NO static optimization, NO ISR, NO caching

**Fix:** Remove `force-dynamic`. Use per-route dynamic where needed (already done for API routes, health check). The `messages` import uses `await import()` which already works with dynamic rendering when needed.

#### Issue B: No route groups -- heavy providers on all pages

Root layout wraps ALL pages with:
- `Web3Provider` (wagmi + QueryClient) -- only needed for DAO/DeFi pages
- `TelegramProvider` -- only needed for Telegram Mini App context
- `LazyMotionProvider` -- acceptable (uses `domAnimation` subset)
- `ClientOnly` wrapper -- forces client rendering for all content

**Fix:** Use route groups:
```
src/app/[locale]/
  (public)/          # Landing, pricing, legal, blog -- NO auth, NO web3
    layout.tsx       # Minimal: just NextIntl
  (app)/             # Dashboard, trade, settings -- Auth required
    layout.tsx       # AuthProvider, WagmiProvider
  (admin)/           # Admin panel
    layout.tsx       # AdminAuth, AdminSidebar
```

#### Issue C: Duplicate font initialization

Fonts `Geist` and `Geist_Mono` are initialized in BOTH:
- `src/app/layout.tsx` (lines 8-16)
- `src/app/[locale]/layout.tsx` (lines 15-23)

Double initialization = double download request (though browser may dedupe). Remove from one layout.

#### Issue D: Dashboard layout is fully client-rendered

`src/app/[locale]/dashboard/layout.tsx` is `'use client'` and imports:
- `OnboardingChecklist` (commented out but imported)
- `WinStreakPopup` -- renders on every dashboard page
- `SupportChat` -- renders on every dashboard page
- `InstallPrompt` -- PWA prompt on every page
- `MobileNav` -- bottom nav on every page

These should be dynamically imported:
```tsx
const WinStreakPopup = dynamic(() => import('@/components/upsell/WinStreakPopup').then(m => m.WinStreakPopup), { ssr: false });
const SupportChat = dynamic(() => import('@/components/support/SupportChat').then(m => m.SupportChat), { ssr: false });
```

---

## 4. Font Loading Assessment

**Status: GOOD with one issue**

| Check | Result |
|-------|--------|
| `next/font` used | Yes -- `Geist`, `Geist_Mono` from Google |
| `display: swap` | Automatic with `next/font` (default) |
| External font links | None (no `<link>` tags for fonts) |
| Font subsets | `["latin"]` -- correct for English-primary |

**Issue:** Missing `display: 'swap'` explicit config. While `next/font` defaults to swap, explicit is better:
```ts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',  // Add explicitly
});
```

**Issue:** Duplicate initialization in two layouts (see Section 3C).

---

## 5. Third-Party Script Loading

### Sentry

**File:** `sentry.client.config.ts`

```ts
tracesSampleRate: 1,  // 100% sampling!
```

**CRITICAL:** 100% trace sampling in production = significant performance overhead. Every page navigation, every user interaction is traced.

**Fix:**
```ts
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
```

### PostHog

**File:** `src/lib/posthog.ts`

PostHog initializes at module import time via top-level `if (typeof window !== 'undefined')`. This means it loads as soon as any component imports this module -- no lazy loading.

**Fix:** Use `next/script` strategy or dynamic import:
```tsx
// In layout, use Script component:
<Script src="posthog-snippet" strategy="afterInteractive" />
```

Or lazy-init on first interaction rather than module load.

### TradingView

**Status: GOOD** -- Not using TradingView widget. Uses `lightweight-charts` library instead (much lighter). TradingView is only referenced in CSP headers for iframe embedding.

### Web3/Wagmi

wagmi + viem + @rainbow-me/rainbowkit are heavy (~200KB+). Currently loaded for ALL pages via root layout `Web3Provider`. Should be code-split to only DAO/DeFi routes.

### next/script Usage

`next/script` is imported in `src/app/layout.tsx` but NOT actually used in the JSX. The import is dead code.

---

## 6. CSS/Styling Analysis

| Check | Result |
|-------|--------|
| Tailwind CSS | v4.1.17 via `@tailwindcss/postcss` |
| Purging/content | Automatic in Tailwind v4 (no config needed) |
| globals.css size | 327 lines -- acceptable |
| CSS-in-JS | `framer-motion` inline styles only -- acceptable |
| Global CSS imports | `globals.css` imported in both layouts -- redundant |

**Issue:** globals.css imported in BOTH `src/app/layout.tsx` (line 3) AND `src/app/[locale]/layout.tsx` (line 9 as `../globals.css`). Remove from one.

---

## 7. Middleware Performance Assessment

**File:** `src/middleware.ts` -- **310 lines, HEAVY**

### Operations Per Request (non-API page request)

1. Hostname parsing + multi-tenancy check
2. Protected paths regex matching (7 paths x locale regex)
3. i18n locale detection + path parsing
4. CSRF token injection

### Operations Per API Request

1. All of the above PLUS:
2. **Rate limiting via Supabase** -- 1-3 database round-trips (SELECT + UPDATE/INSERT + RPC call)
3. JWT verification (jose library)
4. Public route whitelist matching (14 routes)
5. Copy trading special case check
6. Token extraction from 3 cookie sources + auth header

### Critical Issues

#### Issue A: Database-backed rate limiting in middleware

**File:** `src/lib/rateLimit.ts`

Every API request triggers `checkRateLimit()` which:
1. `SELECT` from `rate_limits` table
2. If not found: `INSERT` new record
3. If found + window expired: `UPDATE` to reset
4. If found + within window: `RPC increment_rate_limit`

**This adds 50-200ms latency per API request** depending on Supabase region distance.

**Fix:** Use in-memory rate limiting for edge:
- Vercel Edge: Use `@upstash/ratelimit` with Redis (2-5ms)
- Or use `Map()` with TTL for simple per-instance limiting
- Or move rate limiting to API route handlers, not middleware

#### Issue B: Multiple JWT verifications

JWT is verified up to 3 times in a single request:
1. Enterprise API auth (line 74)
2. Admin auth check (line 117)
3. Protected routes check (line 198)
4. General API auth check (line 291)

**Fix:** Verify JWT once, store result in request headers.

#### Issue C: Module-level Supabase client

```ts
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

This creates a Supabase client at module load time for EVERY cold start. Should be lazy-initialized.

#### Issue D: Matcher too broad

```ts
matcher: ['/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)']
```

This runs middleware on ALL requests except static files. Static marketing pages dont need auth checks.

---

## 8. Bundle Composition Concerns

### Heavy Dependencies in Client Bundle

| Package | Est. Size (gzip) | Loaded Where |
|---------|-----------------|--------------|
| `wagmi` + `viem` | ~150KB | ALL pages (root layout) |
| `@rainbow-me/rainbowkit` | ~80KB | ALL pages |
| `framer-motion` | ~30KB | ALL pages (LazyMotion helps) |
| `recharts` | ~50KB | Dashboard/Admin only |
| `lightweight-charts` | ~40KB | Trade page only |
| `@xyflow/react` | ~80KB | Studio editor only |
| `ccxt` | ~200KB+ | Should be server-only |
| `posthog-js` | ~30KB | ALL pages |
| `lucide-react` (full) | ~50KB+ | 214 files |

### Estimated Total Client JS (unoptimized)

Without `optimizePackageImports` and with providers on all pages: **~700KB+ gzipped** initial load.

With proper code splitting: could be **~200KB gzipped** for landing pages.

---

## Summary: Priority Matrix

| # | Issue | Severity | Est. Impact | Effort |
|---|-------|----------|-------------|--------|
| 1 | Remove `force-dynamic` from locale layout | **CRITICAL** | TTFB -500ms, enables static pages | Low |
| 2 | Add `optimizePackageImports` to next.config | **CRITICAL** | JS bundle -100KB+ | Low |
| 3 | Add `loading.tsx` to 5+ key routes | **HIGH** | LCP improvement, perceived perf | Low |
| 4 | Replace DB rate limiting with in-memory/Redis | **HIGH** | API TTFB -50-200ms | Medium |
| 5 | Route groups to isolate heavy providers | **HIGH** | Landing page JS -300KB+ | Medium |
| 6 | Reduce Sentry tracesSampleRate to 0.1 | **HIGH** | CPU/network overhead reduction | Low |
| 7 | Dynamic import dashboard layout components | **MEDIUM** | Dashboard initial load -50KB | Low |
| 8 | Deduplify JWT verification in middleware | **MEDIUM** | Middleware latency -20ms | Low |
| 9 | Remove duplicate font/CSS initialization | **LOW** | Minor bundle reduction | Low |
| 10 | Add `not-found.tsx` | **LOW** | UX improvement, SEO | Low |
| 11 | Lazy-load PostHog | **MEDIUM** | FID/INP improvement | Low |
| 12 | Move Web3 providers to route group | **HIGH** | Non-Web3 pages -230KB JS | Medium |

---

## Unresolved Questions

1. Is `force-dynamic` on locale layout intentional due to `next-intl` message loading, or accidental? The `await import()` for messages should work with static generation if locale is a known param.
2. Is the Supabase rate limiting table (`rate_limits`) actually populated/working, or is it a dead code path? The `increment_rate_limit` RPC function needs verification.
3. What is the actual production bundle size? Running `ANALYZE=true next build` with `@next/bundle-analyzer` would give precise numbers.
4. Is `ccxt` (crypto exchange library, ~200KB+) being imported in any client component? Should be server-only.
5. Is the `react-intersection-observer` package (installed in deps) actually used anywhere? Grep found 0 direct `IntersectionObserver` usage -- may be dead dependency.
