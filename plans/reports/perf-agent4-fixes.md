# Performance Fix Report — Dynamic Imports & Config Optimization

**Date:** 2026-02-11
**Agent:** fullstack-developer (perf-agent4)
**Status:** Completed

---

## Files Modified

### 1. `next.config.mjs` (+3 lines)

**Change:** Added `experimental.optimizePackageImports` with 5 barrel-exported packages.

```js
experimental: {
  optimizePackageImports: ['lucide-react', 'date-fns', 'recharts', '@heroicons/react', 'react-icons'],
}
```

**Estimated impact:**
- `lucide-react`: ~60-80KB saved (barrel exports hundreds of icons, only used icons get bundled)
- `recharts`: ~30-50KB saved (tree-shakes unused chart types across 10 files)
- `date-fns`: ~10-20KB saved (tree-shakes unused date functions)
- `react-icons` / `@heroicons/react`: ~5-15KB each if used

**Total estimated:** ~100-165KB reduction in client JS

### 2. `src/app/[locale]/trade/page.tsx` (+5 lines, -1 line)

**Change:** Replaced static `import TradingChart` with `next/dynamic` import, `ssr: false`.

```tsx
// Before
import TradingChart from '@/components/TradingChart';

// After
import dynamic from 'next/dynamic';
const TradingChart = dynamic(() => import('@/components/TradingChart'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-muted h-full w-full rounded-lg" />,
});
```

**Estimated impact:**
- `lightweight-charts` (~40KB gzipped) moved out of main bundle into separate chunk
- Chart only loads when trade page renders (not on initial app load)
- `ssr: false` correct since chart requires DOM (canvas) access

### 3. `src/app/[locale]/dashboard/loading.tsx` (NEW, 7 lines)
### 4. `src/app/[locale]/trade/loading.tsx` (NEW, 7 lines)
### 5. `src/app/[locale]/admin/loading.tsx` (NEW, 7 lines)

**Change:** Created route-level loading skeletons for 3 heavy route segments.

Each exports a centered spinner skeleton matching Next.js App Router Suspense convention. Enables:
- Instant navigation feedback (spinner shows while page JS loads)
- Automatic code-splitting boundary at route level
- Reduced perceived latency for dashboard, trade, admin routes

## Skipped Items (With Rationale)

| Item | Reason |
|------|--------|
| QR code dynamic import | No client-side QR library found. MFA uses server-generated base64 images. Affiliate page uses `QrCode` icon from lucide-react (covered by `optimizePackageImports`). |
| Terminal component | `src/components/apps/terminal.tsx` has zero heavy dependencies (no external libs). Dynamic import would add complexity with negligible bundle savings. |
| Recharts per-file dynamic imports | 10 files import recharts directly as page components. `optimizePackageImports` handles tree-shaking. Per-file wrapping would require extracting chart sections into separate components — high churn, marginal gain beyond what optimizePackageImports already provides. |
| LazyMotion fix | Already correct: uses `LazyMotion, domAnimation` from `framer-motion` (not full `motion` bundle). No change needed. |

## TypeScript Verification

```
$ npx tsc --noEmit
Errors: 1 (PRE-EXISTING)
- src/components/payments/__tests__/CheckoutModal.test.tsx(134,47): error TS2322
  Property 'isOpen' does not exist on type 'CheckoutModalProps'
  (test file prop mismatch — not caused by this PR)

New errors introduced: 0
```

## Estimated Total Bundle Impact

| Optimization | Estimated Savings |
|-------------|-------------------|
| `optimizePackageImports` (5 packages) | ~100-165KB |
| TradingChart dynamic import | ~40KB moved to lazy chunk |
| Route loading.tsx (3 files) | Perceived perf improvement (no size change) |
| **Total** | **~140-205KB** reduction in initial client JS |
