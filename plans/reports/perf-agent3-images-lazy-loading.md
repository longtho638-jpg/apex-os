# Performance Audit: Image Optimization & Lazy Loading

**Project:** apex-os
**Date:** 2026-02-11
**Auditor:** Agent 3 (Images & Lazy Loading)
**Scope:** Image handling, lazy loading patterns, component loading strategies, data fetching

---

## Executive Summary

The codebase has **minimal image usage** (text/CSS-heavy design) but suffers from critical performance gaps: **71 files import full framer-motion instead of LazyMotion-compatible `m`**, zero `Suspense` boundaries, pervasive client-side waterfall fetching, and several **broken asset references** (404s in production). The dashboard overview page is the sole example of proper dynamic imports.

**Severity:** HIGH for framer-motion bundle bloat + data fetching waterfalls. MEDIUM for missing images/assets.

---

## 1. Image Component Audit

### next/image (`<Image>`) Usage — 4 Instances

| File | Component | `fill`/`width+height` | `priority` | `sizes` | `loading` | `placeholder` | `quality` | Verdict |
|------|-----------|----------------------|-----------|---------|-----------|--------------|----------|---------|
| `src/components/blog/BlogCard.tsx:25` | Cover image | `fill` | MISSING | MISSING | MISSING | MISSING | MISSING | Needs `sizes` for responsive |
| `src/components/blog/BlogCard.tsx:58` | Author avatar | `fill` | MISSING | N/A (small) | MISSING | MISSING | MISSING | OK (tiny 32px) |
| `src/components/security/TwoFactorSetup.tsx:77` | QR code | `width=150 height=150` | N/A | N/A | N/A | MISSING | MISSING | OK (dynamic content) |
| `src/app/[locale]/admin/security/mfa/setup/page.tsx:110` | QR code | `width=192 height=192` | N/A | N/A | N/A | MISSING | MISSING | OK (dynamic content) |

**Key findings:**
- No `priority` prop set anywhere. Not critical since no Image component is above-the-fold on landing pages.
- No `sizes` prop on BlogCard cover image using `fill` -- causes the browser to download the largest srcset variant unnecessarily.
- No `placeholder="blur"` on any Image -- missed opportunity for perceived performance on blog cards.

### Raw `<img>` Tags -- 4 Instances (should use next/image)

| File | Purpose | Issue |
|------|---------|-------|
| `src/components/defi/WalletConnectButton.tsx:75` | Chain icon | Dynamic `iconUrl` from wallet SDK; difficult to use next/image with external domains |
| `src/app/[locale]/settings/page.tsx:207` | User avatar | Missing width/height, no optimization, causes CLS |
| `src/app/[locale]/admin/templates/page.tsx:117` | Template preview | Missing dimensions, no optimization |
| `src/components/admin/MFASetupWizard.tsx:196` | QR code data URL | OK for data URIs, `w-64 h-64` via CSS |

### SVG Usage

- Public directory has 6 SVGs: `grid-pattern.svg` (342B), `file.svg` (391B), `vercel.svg` (128B), `next.svg` (1.4KB), `globe.svg` (1KB), `window.svg` (385B)
- All are tiny decorative files -- no optimization needed
- Icons use `lucide-react` (inline SVG components) -- good, tree-shakeable

### Background Images in CSS/Tailwind

| File | URL | Issue |
|------|-----|-------|
| `src/components/trading/DeepSeekInsight.tsx:118` | `https://grainy-gradients.vercel.app/noise.svg` | **EXTERNAL dependency** -- will fail if 3rd party is down |
| `src/components/dashboard/SignalCard.tsx:43` | `https://grainy-gradients.vercel.app/noise.svg` | Same external dependency |
| `src/components/dashboard/AlgoVisualizer.tsx:134` | `https://grainy-gradients.vercel.app/noise.svg` | Same external dependency |
| `src/app/[locale]/page.tsx:219` | `/grid-pattern.svg` | OK, local file (342B) |
| `src/app/[locale]/landing/page.tsx:159` | `/grid-pattern.svg` | OK |
| `src/app/[locale]/support/page.tsx:49` | `/grid-pattern.svg` | OK |
| `src/app/[locale]/docs/page.tsx:118` | `/grid-pattern.svg` | OK |
| `src/components/marketing/InteractiveDemoWidget.tsx:43` | `/grid-pattern.svg` | OK |
| `src/app/[locale]/dashboard/wallet/page.tsx:232` | `/noise.png` | **BROKEN: file does not exist in public/** |
| `src/app/globals.css:214` | Data URI SVG | Good, inline |

### Broken Asset References (404s)

| Referenced In | Missing Asset | Impact |
|---------------|--------------|--------|
| `src/app/[locale]/dashboard/wallet/page.tsx:232` | `/noise.png` | Visual noise texture missing, 404 in browser |
| `src/app/layout.tsx` (OG metadata) | `/og-image.jpg` | Social share preview image broken, SEO impact |
| `src/components/blog/BlogCard.tsx:59` | `/images/default-avatar.png` | Blog author fallback avatar missing, 404 |

---

## 2. Above-the-Fold / LCP Analysis

### Homepage (`/` -- `src/app/[locale]/page.tsx`)

- **LCP Element:** Text headline (`<h1>` "APEX" + GradientText) -- no image
- **No images above fold** -- CSS gradients, Lucide icons, text only
- `ParticleBackground` renders 30 CSS-animated divs eagerly -- minor DOM overhead
- `MouseGlow` component loaded eagerly -- adds motion tracking on every mouse move
- `SmartSwitchWizard` (373 lines) loaded **eagerly** even though it's below fold (section 4)
- Client-side `fetch('/api/marketplace/strategies')` in `useEffect` -- blocks marketplace section render

### Landing Page (`/landing` -- `src/app/[locale]/landing/page.tsx`)

- **LCP Element:** Text headline + AnimatedNumber component
- **No images above fold**
- `ParticleBackground` loaded eagerly (same as homepage)
- `SocialProofSection` loaded eagerly -- could defer

### Login (`/login`)

- **LCP Element:** Form card with Terminal icon
- No images -- pure CSS design with gradient glows
- `motion.div` wraps entire card -- full framer-motion loaded for one fade-in

### Pricing (`/pricing`)

- **LCP Element:** Text headline + PricingCalculator
- No images
- `ParticleBackground` loaded eagerly again

### Dashboard Overview (`/dashboard/overview`)

- **LCP Element:** Metric cards grid
- 4 widgets properly lazy-loaded via `next/dynamic` with skeleton loading states
- Data fetched via `useEffect` + Supabase client -- sequential queries (see Section 6)

**Verdict:** LCP is text-based across all key pages. No LCP image to set `priority` on. Main concern is JS bundle size from eager component loading.

---

## 3. Lazy Loading Gap Analysis

### What Exists (Good)

| Pattern | File | Details |
|---------|------|---------|
| `next/dynamic` + `ssr: false` + loading skeleton | `dashboard/overview/page.tsx` | 4 widgets: AlgoVisualizer, WhaleWatcherWidget, ArbitrageScannerWidget, SystemHealthMesh |
| `LazyMotionProvider` wrapping app | `app/layout.tsx` | Uses `domAnimation` feature bundle |
| `ClientOnly` wrapper | `app/layout.tsx` | Prevents SSR of provider tree |

### What Is Missing (Critical Gaps)

| Missing Pattern | Impact | Affected Files |
|----------------|--------|----------------|
| **Zero `Suspense` boundaries** | No streaming SSR, no granular loading states | Entire app |
| **Zero `IntersectionObserver`** usage | Below-fold sections load eagerly | All landing/marketing pages |
| **No `React.lazy()`** usage | All components loaded synchronously except 4 dashboard widgets | 200+ components |
| **No route-level code splitting beyond Next.js default** | Each page bundle includes all imported components | All pages |

### Components That Should Be Lazy-Loaded

| Component | Lines | Used On | Why Lazy |
|-----------|-------|---------|----------|
| `SmartSwitchWizard` | 373 | Homepage (section 4, below fold) | Below fold, complex wizard UI |
| `SocialProofSection` | -- | Landing page (below hero) | Below fold |
| `SiteFooter` | -- | All marketing pages (always below fold) | Below fold |
| `ParticleBackground` | 35 | 4+ pages | CSS animation, can defer render |
| `PricingCalculator` | -- | Pricing page (below hero heading) | Below fold |
| `AlphaDashboard` | 1,265 | Dashboard | Massive component, only one route |
| `SynergyCore` | 333 | Dashboard | Heavy visualization |
| `IndicatorPanel` | 331 | Trading | Heavy chart component |
| `TradingChart` | 324 | Trading | Heavy chart component |

---

## 4. Framer-Motion Optimization Assessment

### Current Setup

- `LazyMotionProvider` at app root with `domAnimation` + `strict` mode
- `PageTransition` component correctly uses `m as motion` from framer-motion (1 file)

### Critical Problem: 71 Files Import Full `motion`

The `LazyMotion strict` mode is designed to throw an error when `motion` components are used instead of `m` components. However, **71 files** import `{ motion }` directly from `'framer-motion'`, bypassing the LazyMotion optimization entirely.

**Breakdown:**
- Files importing `motion` only: **46 files**
- Files importing `motion` + `AnimatePresence`: **25 files**
- Files correctly using `m as motion`: **1 file** (`page-transition.tsx`)

**Bundle Impact:** Each `import { motion } from 'framer-motion'` pulls in the full animation engine (~30KB gzipped) rather than the tree-shaken `domAnimation` bundle (~15KB). Since these are all in different chunks, the full bundle is included in virtually every page.

### Top Offenders (Marketing/Landing Pages)

These import `motion` on pages that are first-paint critical:

| File | Import | LCP Impact |
|------|--------|------------|
| `src/app/[locale]/page.tsx` | `motion` | Homepage -- first paint delayed |
| `src/app/[locale]/landing/page.tsx` | `motion` | Landing -- first paint delayed |
| `src/app/[locale]/login/page.tsx` | `motion` | Login -- first paint delayed |
| `src/app/[locale]/signup/page.tsx` | `motion` | Signup -- first paint delayed |
| `src/app/[locale]/pricing/page.tsx` | `motion` | Pricing -- first paint delayed |
| `src/components/marketing/SiteHeader.tsx` | `motion` | Every marketing page header |
| `src/components/marketing/Button3D.tsx` | `motion` | Every CTA button |
| `src/components/marketing/GlassmorphicCard.tsx` | `motion` | Marketing cards |

### Recommendation

All 71 files should replace `import { motion } from 'framer-motion'` with `import { m as motion } from 'framer-motion'` to leverage the LazyMotion provider. For `AnimatePresence`, it can remain as a direct import since it's a utility, not a component renderer.

---

## 5. Top Largest Components Needing Splitting

| Rank | File | Lines | Loaded On | Recommendation |
|------|------|-------|-----------|----------------|
| 1 | `components/dashboard/AlphaDashboard.tsx` | 1,265 | Dashboard | Split into 5+ sub-widgets, lazy-load each |
| 2 | `lib/quant/FeatureEngine.ts` | 636 | Trading pages | Extract calculation modules |
| 3 | `app/[locale]/settings/page.tsx` | 486 | Settings | Split tabs into separate lazy-loaded components |
| 4 | `app/[locale]/dashboard/wallet/page.tsx` | 410 | Wallet | Extract modals, card components |
| 5 | `lib/strategy/phases.ts` | 394 | Trading | Split by strategy type |
| 6 | `lib/risk/RiskMetrics.ts` | 376 | Dashboard/Trading | Extract individual metric calculators |
| 7 | `components/dashboard/SmartSwitchWizard.tsx` | 373 | Homepage (below fold!) | Lazy-load via `next/dynamic` |
| 8 | `admin/providers/ProviderFormModal.tsx` | 373 | Admin only | Already route-isolated |
| 9 | `app/[locale]/dashboard/reports/page.tsx` | 367 | Reports | Extract table and chart sections |
| 10 | `admin/providers/page.tsx` | 364 | Admin only | Already route-isolated |

**Additional oversized files (300+ lines):**
- `lib/ui-constants.ts` (358) -- data file, acceptable
- `components/trading/LimitOrderPanel.tsx` (353) -- split form sections
- `lib/ml/types.ts` (348) -- type file, acceptable
- `app/[locale]/offer/page.tsx` (347) -- marketing, split sections
- `components/SynergyCore.tsx` (333) -- heavy visualization
- `hooks/useApi.ts` (332) -- split into individual hooks per endpoint

---

## 6. Data Fetching Anti-Patterns

### Client-Side Waterfall Fetching

| File | Pattern | Issue |
|------|---------|-------|
| `src/app/[locale]/page.tsx:24-32` | `useEffect + fetch('/api/marketplace/strategies')` | Homepage data fetched client-side; delays marketplace section render by RTT+parse time |
| `src/app/[locale]/dashboard/overview/page.tsx:60-87` | `useEffect` with 2 sequential Supabase queries | Waterfall: referral count waits, THEN signals count fires |
| `src/hooks/useApi.ts:54-66` | `useEffect + fetch(pnl/summary)` | Individual hook fetches |
| `src/hooks/useApi.ts:81-93` | `useEffect + fetch(auditor/rebates)` | Fires independently but in same component = parallel, OK |
| `src/hooks/useApi.ts:107-119` | `useEffect + fetch(guardian/leverage)` | Same pattern |
| `src/hooks/useApi.ts:142-165` | `useEffect + fetch(pnl/summary)` (duplicated!) | **Duplicate fetch** of same endpoint in different hook |
| `src/hooks/useApi.ts:189-211` | `useEffect` with `await fetch(pnl) THEN await fetch(rebate)` | **Sequential waterfall** -- these could be `Promise.all()` |
| `src/hooks/useCryptoPrice.ts:8-12` | `useEffect + fetch(coingecko)` | External API call on mount |
| `src/hooks/useMarketData.ts:69-86` | `useEffect + fetch(binance klines)` | External API call |
| `src/contexts/AuthContext.tsx:44-50` | `useEffect + fetch(/auth/me)` | Auth check on every mount |

### Missing Server-Side Data Patterns

| Pattern | Found | Expected |
|---------|-------|----------|
| `export const revalidate` | 1 file (`blog/page.tsx: revalidate = 3600`) | Should be on all data pages |
| `fetch()` with `next: { revalidate }` | 0 files | Should be used in server components |
| `cache: 'force-cache'` or `cache: 'no-store'` | 1 file (`useUserTier: 'no-store'`) | Should be explicit on all fetches |
| Server Components fetching data | 0 instances found | Homepage strategies, blog, docs could all be server-fetched |
| `React.cache()` for request deduplication | 0 files | Duplicate pnl/summary calls would benefit |

### External API Dependencies in Client Code

| Hook | External API | Risk |
|------|-------------|------|
| `useCryptoPrice` | `api.coingecko.com` | Rate-limited, CORS dependent, no error boundary |
| `useMarketData` | `api.binance.com` | Same risks, 50+ klines per request |
| Analytics | `grainy-gradients.vercel.app` (CSS bg) | Visual degradation if down |

---

## Summary of Critical Issues

### P0 (Critical -- Bundle/Performance)

1. **71 files import full `motion` instead of `m`** -- defeats LazyMotion optimization, adds ~15KB unnecessary to every page bundle
2. **Homepage fetches data client-side** instead of server component -- delays FCP
3. **`useApi.ts:189-211` waterfall pattern** -- sequential awaits should be `Promise.all()`
4. **`AlphaDashboard.tsx` at 1,265 lines** -- single monolith component, no code splitting

### P1 (High -- Broken/Missing)

5. **`/noise.png` does not exist** in public/ -- 404 on wallet page
6. **`/og-image.jpg` does not exist** -- broken OpenGraph social preview
7. **`/images/default-avatar.png` does not exist** -- 404 on blog author avatars
8. **3 external `grainy-gradients.vercel.app` references** -- dependency on 3rd party for visual noise texture

### P2 (Medium -- Missing Optimization)

9. **Zero `Suspense` boundaries** in entire app
10. **Only 1 page uses `revalidate`** -- blog page only; all other data is client-fetched
11. **`SmartSwitchWizard` (373 lines) eagerly loaded on homepage** -- below fold, should be `next/dynamic`
12. **BlogCard `<Image fill>` missing `sizes` prop** -- browser downloads oversized variant
13. **4 raw `<img>` tags** should use next/image for optimization

### P3 (Low -- Polish)

14. Settings page avatar uses raw `<img>` -- could use next/image with `remotePatterns`
15. `ParticleBackground` creates 30 DOM elements with random inline styles on mount -- could use CSS-only animation or canvas
16. No `quality` prop on any Image -- defaults to 75, acceptable

---

## Unresolved Questions

1. Is the `LazyMotion strict` mode actually enforced at runtime? With 71 files using `motion` instead of `m`, either strict mode throws errors (app is broken) or it silently falls back. Needs browser console verification.
2. Are the external `grainy-gradients.vercel.app` noise SVGs intentional, or were they developer shortcuts that should be self-hosted?
3. The `useApi.ts` file has a hardcoded `USER_ID = '00000000-...'` (demo user) -- is this intentional for development only, or a production bug?
