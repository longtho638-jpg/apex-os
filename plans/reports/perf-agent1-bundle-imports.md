# Performance Audit: Bundle Size & Import Optimization

**Project:** apex-os
**Date:** 2026-02-11
**Agent:** code-reviewer (perf-agent1)
**Scope:** READ-ONLY audit of bundle size, tree-shaking, dynamic imports, icon imports, "use client" boundaries

---

## Executive Summary

The apex-os codebase has **significant bundle optimization opportunities**. Only 4 `dynamic()` imports exist in the entire 220+ component codebase. Heavy libraries (`framer-motion`, `recharts`, `lightweight-charts`, `@xyflow/react`, `wagmi/viem`) are statically imported across 70+ files. The dashboard layout is fully `"use client"`, pulling in multiple heavy components (WinStreakPopup, SupportChat, OnboardingChecklist) on every dashboard page load.

**Estimated total savings: 250-400KB gzipped** from the initial JS bundle if all recommendations are implemented.

---

## 1. Top 20 Dynamic Import Candidates

Ranked by estimated bundle impact (gzipped contribution).

| # | Component | Current Import | Heavy Deps | Est. Savings (gz) | Priority |
|---|-----------|---------------|------------|-------------------|----------|
| 1 | `AlgoStudioEditor` | Static in studio page | `@xyflow/react` (~180KB gz), lucide (11 icons) | **80-100KB** | CRITICAL |
| 2 | `TradingChart` | Static in trade page | `lightweight-charts` (~45KB gz), WebSocket | **45-55KB** | CRITICAL |
| 3 | `SynergyCore` | Static | `framer-motion` (full), SVG animation | **15-20KB** | HIGH |
| 4 | `NetProfitChart` | Static in admin | `recharts` (full chart suite) | **40-50KB** | HIGH |
| 5 | `SupportChat` | Static in dashboard layout | `framer-motion`, lucide | **8-12KB** | HIGH |
| 6 | `WinStreakPopup` | Static in dashboard layout | `framer-motion`, `UpgradeModal` chain | **8-12KB** | HIGH |
| 7 | `OnboardingTour` | Static | `react-joyride` (~25KB gz) | **25-30KB** | HIGH |
| 8 | `OnboardingChecklist` | Static | `framer-motion`, `canvas-confetti` (~5KB) | **10-15KB** | HIGH |
| 9 | Admin pages (all 20+) | Static | Various heavy deps per page | **15-25KB each** | HIGH |
| 10 | `PerformanceShowcase` | Static marketing | `recharts` LineChart suite | **40-50KB** | MEDIUM |
| 11 | `PricingModal` | Static | `framer-motion`, lucide | **6-8KB** | MEDIUM |
| 12 | `SmartSwitchWizard` | Static | `framer-motion`, AnimatePresence | **6-8KB** | MEDIUM |
| 13 | `ConnectExchange` | Static | `framer-motion`, AnimatePresence | **5-8KB** | MEDIUM |
| 14 | `RiskDashboard` | Static | `framer-motion` | **5-8KB** | MEDIUM |
| 15 | `QuantPanel` | Static | `framer-motion`, lucide | **5-8KB** | MEDIUM |
| 16 | `MiniSparkline` | Static | `react-sparklines` (~8KB gz) | **8-10KB** | MEDIUM |
| 17 | `LiveLogStream` | Static admin | `framer-motion`, AnimatePresence | **5-8KB** | MEDIUM |
| 18 | `WithdrawalModal` | Static | `framer-motion`, AnimatePresence | **5-8KB** | MEDIUM |
| 19 | `SwapInterface` | Static defi | `wagmi` hooks, lucide | **5-8KB** | MEDIUM |
| 20 | `DeFiPortfolio` | Static defi | `wagmi` hooks, `viem`, lucide | **5-8KB** | MEDIUM |

**Current dynamic imports (only 4):**
- `AlgoVisualizer` (dashboard overview)
- `WhaleWatcherWidget` (dashboard overview)
- `ArbitrageScannerWidget` (dashboard overview)
- `SystemHealthMesh` (dashboard overview)

---

## 2. Heavy Dependency Analysis

### Tier 1: CRITICAL (each >40KB gzipped)

| Dependency | Gzip Size | Import Count | Issue |
|-----------|-----------|-------------|-------|
| `@xyflow/react` | ~180KB | 6 files | Only used in Algo Studio. Statically imported. Should be dynamic-only. |
| `recharts` | ~90KB | 11 files | Used across admin, dashboard, marketing. Each page imports full chart types. No code-splitting. |
| `framer-motion` | ~35KB base | **50+ src files** | Imported as `motion` on nearly every page. LazyMotion provider exists but most components bypass it by importing `motion` directly instead of `m`. |
| `lightweight-charts` | ~45KB | 1 file | Only used in TradingChart. Should be `next/dynamic` with `ssr: false`. |
| `wagmi` + `viem` | ~60KB combined | 8 files | Web3Provider wraps the ENTIRE app in root layout. Most users never use Web3 features. |
| `@rainbow-me/rainbowkit` | ~40KB | In package.json | Listed as dependency but no import found in src/. Likely unused dead weight. |

### Tier 2: HIGH (15-40KB gzipped)

| Dependency | Gzip Size | Import Count | Issue |
|-----------|-----------|-------------|-------|
| `react-joyride` | ~25KB | 2 files | Onboarding tour. Loaded for ALL users, not just new ones. |
| `react-markdown` | ~15KB | 1 file | Only used on blog post page. Should be dynamic. |
| `posthog-js` | ~20KB | 1 file (`lib/posthog.ts`) | Analytics lib. Check if lazy-loaded or eagerly imported. |
| `ccxt` | ~200KB+ | In package.json | **NOT imported in src/**. This is a massive server-side crypto exchange lib. If truly unused in client, confirm it is not accidentally bundled. |
| `openai` | ~15KB | 1 file (`lib/claude.ts`) | Server-only lib. Ensure no client import path. |

### Tier 3: MEDIUM (5-15KB gzipped)

| Dependency | Gzip Size | Import Count | Issue |
|-----------|-----------|-------------|-------|
| `canvas-confetti` | ~5KB | 1 file | Only used in OnboardingChecklist for celebration effect. |
| `react-sparklines` | ~8KB | 1 file | Only used in MiniSparkline. |
| `papaparse` | ~8KB | In package.json | CSV parser. Verify if client-side or server-only. |
| `@sentry/nextjs` | ~30KB (SDK) | Config + wrapping | Already configured. Sentry's `disableLogger: true` is set. Good. |

### Potentially Unused Dependencies

| Dependency | Evidence |
|-----------|---------|
| `@rainbow-me/rainbowkit` | No import found in `src/`. Likely dead code. ~40KB savings if removed. |
| `ccxt` | No import in `src/`. If only used in backend scripts, should be `devDependencies`. ~200KB+ if accidentally bundled. |
| `protobufjs` | No import in `src/`. ~30KB if accidentally bundled. |
| `@google-cloud/vertexai` | No import in `src/`. Server-only. Should not appear in client bundle. |
| `bcrypt` | Listed alongside `bcryptjs`. Duplicate. `bcrypt` has native bindings and should be server-only. |
| `react-is` | Listed as dependency. React 19 does not require this. May be dead. |

### Dependencies That Should Be devDependencies

| Package | Reason |
|---------|--------|
| `@types/papaparse` | Type definitions |
| `@types/react-sparklines` | Type definitions |
| `@types/telegram-web-app` | Type definitions |
| `tsx` | Dev tool for running TypeScript |
| `dotenv` | Should be dev/build-time only for Next.js |

---

## 3. "use client" Boundary Analysis

### Critical Findings

**43 files with `"use client"` found.** Key issues:

#### A. Dashboard Layout Forces Entire Route Segment Client-Side

File: `/src/app/[locale]/dashboard/layout.tsx` (line 1: `'use client'`)

This layout wraps ALL dashboard pages as client components. It imports:
- `OnboardingChecklist` (with `canvas-confetti`)
- `WinStreakPopup` (with `UpgradeModal`, `framer-motion`)
- `SupportChat` (with `framer-motion`)
- `InstallPrompt` (with `framer-motion`)
- `MobileNav`
- `Sidebar` (10 lucide icons)
- 10 lucide icons directly

**Impact:** Every dashboard page (overview, reports, signals, wallet, affiliate, risk, marketplace, payment, resources, settings) inherits ALL of these imports, even if unused on that page.

**Recommendation:** Extract `WinStreakPopup`, `SupportChat`, `InstallPrompt` into dynamically imported components with `ssr: false`. These are interactive overlays that do not need to be in the initial render.

#### B. Root Layout Wraps Everything in Web3Provider

File: `/src/app/layout.tsx`

```
Web3Provider (wagmi + viem ~60KB)
  -> ClientOnly
    -> TelegramProvider
      -> LazyMotionProvider (framer-motion)
        -> PageTransition (framer-motion)
          -> {children}
```

`Web3Provider` wraps the ENTIRE app. This means wagmi, viem, and @tanstack/react-query are loaded on EVERY page, even marketing/landing pages where no Web3 functionality exists.

**Recommendation:** Move Web3Provider to only wrap routes that need it (e.g., `/dashboard`, `/defi`, `/dao`), or lazy-load the provider.

#### C. Locale Layout Has duplicate PageTransition

File: `/src/app/[locale]/layout.tsx`

Imports `PageTransition` from `@/components/ui/page-transition` -- this is a SECOND PageTransition wrapper. The root layout already wraps children in a PageTransition from `@/components/motion/page-transition`. This creates a double animation wrapper.

#### D. Components That Could Be Server Components

| File | Current | Could Be Server | Reason |
|------|---------|-----------------|--------|
| Hooks (`usePnLSummary`, `useRebates`, etc.) | `"use client"` | No | Hooks require client context -- correctly marked |
| `IndicatorPanel` | `"use client"` | No | Has state (useState) -- correctly marked |
| UI primitives (`slider`, `select`, `tabs`, `dialog`, `switch`, `label`) | `"use client"` | No | Radix UI requires client -- correctly marked |

Most `"use client"` usages are correct for interactive components. The issue is not that individual components are wrong, but that the **layout boundaries** pull too many heavy components into the initial bundle.

---

## 4. Icon Library Optimization

### Current State

- **221 files** import from `lucide-react` in `src/`
- **0 files** import from `@heroicons` (not used in src, only in docs)
- **0 files** import from `react-icons` (not used in src, only in docs)
- Single icon library is good (no duplication)

### Import Pattern Analysis

All 221 files use named imports:
```tsx
import { ArrowDown, ArrowUp, Activity, DollarSign } from 'lucide-react';
```

**lucide-react tree-shaking status:** With `lucide-react` v0.554.0 and Next.js 16+ with Turbopack, named imports ARE tree-shakeable. The library provides ESM exports with individual icon modules. The barrel import pattern (`from 'lucide-react'`) does work with modern bundlers because the library uses `/*#__PURE__*/` annotations and proper sideEffects configuration.

**However**, there are still optimization opportunities:

1. **221 files importing icons = 221 potential chunk boundaries** where the bundler must resolve the barrel. For builds without Turbopack (production builds still use webpack in Next.js 16), this adds resolution overhead.

2. **Some files import 10+ icons** at once:
   - `dashboard/layout.tsx`: 10 icons
   - `AlgoStudioEditor.tsx`: 11 icons
   - `admin pages`: 8-12 icons each

### Recommendation

For apex-os, the current `lucide-react` barrel import pattern is acceptable given:
- Single icon library (no react-icons or heroicons duplication)
- Modern bundler with tree-shaking
- No wildcard (`import * as`) imports found

**Low priority** -- focus on dynamic imports and provider restructuring first.

---

## 5. framer-motion Analysis

### Critical Finding: LazyMotion Exists But Is Bypassed

The codebase has a proper `LazyMotionProvider` at `/src/components/motion/lazy-motion-provider.tsx`:
```tsx
import { LazyMotion, domAnimation } from "framer-motion";
```

And a `PageTransition` that correctly uses `m` (the lazy-compatible import):
```tsx
import { AnimatePresence, m as motion } from "framer-motion";
```

**But 50+ other components bypass this** by importing `motion` directly:
```tsx
import { motion } from 'framer-motion';        // BAD - full motion
import { motion, AnimatePresence } from 'framer-motion';  // BAD - full motion
```

`LazyMotion` with `domAnimation` provides a subset of framer-motion features (~15KB vs ~35KB). When components import `motion` directly (not `m`), they pull in the full runtime regardless of the LazyMotion wrapper.

**Impact:** The LazyMotion optimization is effectively nullified. Every page that imports any component using direct `motion` gets the full framer-motion bundle.

**Recommendation:** Replace all `import { motion } from 'framer-motion'` with `import { m as motion } from 'framer-motion'` across all 50+ files. This is a massive but straightforward find-and-replace.

---

## 6. Estimated Bundle Size Savings

| Optimization | Estimated Savings (gzipped) | Effort |
|-------------|---------------------------|--------|
| Dynamic import AlgoStudioEditor + @xyflow/react | 80-100KB | Low |
| Dynamic import TradingChart + lightweight-charts | 45-55KB | Low |
| Move Web3Provider to route-specific wrapper | 40-60KB off initial load | Medium |
| Remove `@rainbow-me/rainbowkit` (unused) | ~40KB | Trivial |
| framer-motion: `motion` -> `m` migration (50+ files) | ~20KB per chunk | Medium-High |
| Dynamic import recharts components (11 files) | 40-50KB per page | Medium |
| Dynamic import SupportChat, WinStreakPopup from layout | 15-25KB off dashboard initial | Low |
| Remove/move `ccxt` to devDeps if unused | 0 (if server-only) - 200KB (if bundled) | Trivial to verify |
| Dynamic import react-joyride (onboarding) | 25-30KB | Low |
| Dynamic import react-markdown (blog only) | 15KB | Trivial |
| **TOTAL ESTIMATED** | **250-400KB** | - |

---

## 7. Recommended Action Plan

### Phase 1: Quick Wins (1-2 hours)

1. **Verify and remove unused deps:** `@rainbow-me/rainbowkit`, `protobufjs`, `react-is`
2. **Move type-only packages to devDependencies:** `@types/papaparse`, `@types/react-sparklines`, `@types/telegram-web-app`, `dotenv`, `tsx`
3. **Dynamic import TradingChart:** `next/dynamic` with `ssr: false` (it uses browser APIs)
4. **Dynamic import react-markdown** on blog page
5. **Dynamic import react-joyride** in OnboardingTour

### Phase 2: Layout Restructuring (2-4 hours)

6. **Extract dashboard layout overlays** (SupportChat, WinStreakPopup, InstallPrompt) to dynamic imports
7. **Move Web3Provider** from root layout to only wrap `/defi`, `/dao`, and wallet-related routes
8. **Remove duplicate PageTransition** (root layout vs locale layout)
9. **Dynamic import AlgoStudioEditor** on the studio page

### Phase 3: Systematic Migration (4-8 hours)

10. **framer-motion `motion` -> `m` migration** across 50+ files
11. **Dynamic import recharts** on all 11 pages that use it
12. **Dynamic import admin-only components** that use heavy deps
13. **Verify `ccxt` is not in client bundle** (run build analysis)

### Phase 4: Verification

14. Run `next build` with `ANALYZE=true` (add `@next/bundle-analyzer`)
15. Compare before/after bundle sizes
16. Lighthouse performance audit on key pages (landing, dashboard, trade)

---

## Unresolved Questions

1. Is `ccxt` (200KB+) actually used anywhere in the codebase, or is it a leftover from early development? No imports found in `src/`.
2. Is `@rainbow-me/rainbowkit` truly unused, or is it imported indirectly via `wagmi` config?
3. The `bcrypt` and `bcryptjs` duplicate -- which one is actively used? Having both adds unnecessary install weight.
4. Is `posthog-js` lazy-loaded via `next/script` or eagerly imported on every page?
5. The `export const dynamic = 'force-dynamic'` on locale layout -- was this intentional? It disables static generation for ALL pages.
