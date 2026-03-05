# Performance Audit: apex-os — Complete Report

**Date:** 2026-02-11
**Status:** COMPLETED
**Mode:** /cook --auto --parallel (4 agents)

## Summary

Comprehensive performance audit across apex-os trading platform. 4 parallel agents analyzed bundle size, build config, images/lazy loading, and applied fixes. Found **3 CRITICAL**, **7 HIGH**, **8 MEDIUM** performance issues. **5 files modified** with immediate optimizations.

## Agent Execution

| Agent | Scope | Key Finding |
|-------|-------|-------------|
| Agent 1 (code-reviewer) | Bundle & imports | Only 4 dynamic imports for 220+ components; 250-400KB savings possible |
| Agent 2 (debugger) | Build & Core Web Vitals | `force-dynamic` on locale layout kills SSG for ALL 90+ pages |
| Agent 3 (general-purpose) | Images & lazy loading | 71 files bypass LazyMotion; zero Suspense boundaries |
| Agent 4 (fullstack-developer) | Apply fixes | 5 files modified, ~140-205KB bundle reduction |

## Changes Made (5 files)

| # | File | Change | Impact |
|---|------|--------|--------|
| 1 | `next.config.mjs` | Added `experimental.optimizePackageImports` for lucide-react, date-fns, recharts, @heroicons/react, react-icons | ~100-165KB saved |
| 2 | `src/app/[locale]/trade/page.tsx` | Dynamic import TradingChart with `ssr: false` + loading skeleton | ~40KB moved to lazy chunk |
| 3 | `src/app/[locale]/dashboard/loading.tsx` | NEW route loading skeleton | Perceived perf improvement |
| 4 | `src/app/[locale]/trade/loading.tsx` | NEW route loading skeleton | Perceived perf improvement |
| 5 | `src/app/[locale]/admin/loading.tsx` | NEW route loading skeleton | Perceived perf improvement |

**Estimated Total: ~140-205KB** reduction in initial client JS.

## Findings by Severity

### CRITICAL (3) — Highest Impact

| ID | Finding | Impact |
|----|---------|--------|
| C-1 | `force-dynamic` on locale layout (`src/app/[locale]/layout.tsx:1`) disables static generation for ALL 90+ pages | TTFB +500ms on every page. Landing, pricing, legal, blog rendered dynamically on every request |
| C-2 | `Web3Provider` (wagmi+viem ~230KB) wraps ENTIRE app in `src/app/layout.tsx` | Every page loads Web3 stack, including marketing/blog pages that don't need it |
| C-3 | No `optimizePackageImports` config — `lucide-react` imported across 214 files without tree-shaking | ~100KB+ bundle bloat |

**C-3 was FIXED by Agent 4.**

### HIGH (7)

| ID | Finding | Impact |
|----|---------|--------|
| H-1 | `@xyflow/react` (~180KB gz) statically imported in AlgoStudioEditor | Pulled into main bundle though only used on 1 page |
| H-2 | 71 files import `{ motion }` directly instead of LazyMotion-compatible `{ m }` | ~15KB unnecessary JS on every page, defeats LazyMotionProvider |
| H-3 | Zero `loading.tsx` files across 90+ routes | No Suspense boundaries → blank screen until full JS loads |
| H-4 | Database-backed rate limiting in middleware — 1-3 Supabase calls per API request | +50-200ms latency per API call |
| H-5 | Sentry `tracesSampleRate: 1` (100% sampling) in production | Significant CPU/network overhead |
| H-6 | PostHog loads synchronously at module import time | Blocks main thread on load |
| H-7 | Dashboard layout statically imports WinStreakPopup, SupportChat, InstallPrompt | Every dashboard page loads these eagerly |

**H-3 partially FIXED** — loading.tsx added for dashboard, trade, admin routes.

### MEDIUM (8)

| ID | Finding | Impact |
|----|---------|--------|
| M-1 | `AlphaDashboard.tsx` is 1,265 lines — should be 5+ sub-widgets | Slow to parse, impossible to lazy-load parts |
| M-2 | Homepage fetches strategies via client-side `useEffect + fetch` instead of server component | Client-side waterfall, poor TTFB |
| M-3 | SmartSwitchWizard (373 lines) eagerly loaded on homepage (section 4, below fold) | Unnecessary initial bundle weight |
| M-4 | Duplicate font initialization (Geist, Geist_Mono) in both root and locale layouts | Double font loading |
| M-5 | Potentially unused deps: `@rainbow-me/rainbowkit` (~40KB), `ccxt` (~200KB+), `protobufjs` (~30KB) | Dead bundle weight |
| M-6 | Only 1 page sets `revalidate` (blog at 3600s), no ISR strategy | All dynamic pages rebuild on every request |
| M-7 | `useApi.ts` (332 lines) has sequential `await` waterfalls, duplicate PnL fetch | Client-side waterfall delays |
| M-8 | 3 broken asset references: `/noise.png`, `/og-image.jpg`, `/images/default-avatar.png` | 404 errors in production |

## Architecture Assessment

### Strong Areas
- `reactCompiler: true` enabled — automatic memoization
- Image config has avif/webp formats
- Sentry `disableLogger: true` reduces bundle size
- Proper LazyMotionProvider setup (just not used correctly)
- Blog page uses ISR with `revalidate: 3600`
- Dashboard overview page has 4 well-done dynamic imports with loading skeletons

### Weak Areas
- `force-dynamic` kills static generation globally
- Web3/Telegram providers wrap ALL pages (no route groups)
- Nearly zero code splitting beyond what Next.js does automatically
- No Suspense boundaries (partially fixed now)
- Heavy deps loaded eagerly on pages that don't need them
- Middleware does DB calls on every request

## Recommended Priority Actions

### Immediate (This Sprint)
1. **[CRITICAL] Remove `force-dynamic`** from locale layout — add it only to routes that truly need it (dashboard, trade, settings)
2. **[CRITICAL] Move Web3Provider** to a `(web3)` route group that only wraps pages needing wallet connectivity
3. **[HIGH] Dynamic import AlgoStudioEditor** — saves ~180KB
4. **[HIGH] Fix framer-motion imports** — change `motion` to `m` in 71 files (or use codemod)
5. **[HIGH] Reduce Sentry tracesSampleRate** to 0.1 (10%) in production

### Short-Term
6. **[HIGH] Move rate limiting** from Supabase to in-memory or Upstash Redis
7. **[HIGH] Dynamic import dashboard layout extras** — WinStreakPopup, SupportChat, InstallPrompt
8. **[MEDIUM] Remove unused deps** — `@rainbow-me/rainbowkit`, `ccxt`, `protobufjs` if confirmed unused
9. **[MEDIUM] Split AlphaDashboard.tsx** into sub-widget components
10. **[MEDIUM] Add loading.tsx** to remaining route segments (pricing, blog, landing)

### Medium-Term
11. **[MEDIUM] Server-side data fetching** — move homepage strategy fetch to RSC
12. **[MEDIUM] Fix asset references** — add missing images or remove references
13. **[MEDIUM] ISR strategy** — add `revalidate` to public pages (landing, pricing, legal)

## Verification

```
tsc --noEmit: 0 new errors (1 pre-existing in CheckoutModal.test.tsx)
Files modified: 5
Estimated bundle savings: 140-205KB (immediate), 250-400KB (with all recommendations)
```

## Reports
- Agent 1: `plans/reports/perf-agent1-bundle-imports.md`
- Agent 2: `plans/reports/perf-agent2-build-vitals.md`
- Agent 3: `plans/reports/perf-agent3-images-lazy-loading.md`
- Agent 4: `plans/reports/perf-agent4-fixes.md`
