# Phase 1: Lazy Loading Implementation

## Context
- Parent Plan: [ApexOS Performance Optimization](./plan.md)
- Docs: `nextjs-best-practices.md`

## Overview
- **Status**: Pending
- **Priority**: High
- **Description**: Reduce initial JavaScript bundle size by lazy loading heavy charting libraries and non-critical components.

## Key Insights
- `recharts` and `lightweight-charts` are large libraries that should not be included in the main bundle if possible.
- Components using `window` or browser-specific APIs often need `ssr: false`.

## Requirements
1. Identify all Chart components.
2. Replace static imports with `next/dynamic`.
3. Ensure loading states (skeletons/spinners) are present to prevent layout shifts.

## Related Code Files
- `src/components/TradingChart.tsx`
- `src/components/marketing/PerformanceShowcase.tsx`
- Any other file importing `recharts` or `lightweight-charts`.

## Implementation Steps
1.  **Refactor TradingChart**:
    - Modify `src/components/TradingChart.tsx` or its parent to use `dynamic(() => import(...), { ssr: false, loading: () => ... })`.
2.  **Refactor PerformanceShowcase**:
    - Apply `next/dynamic` for the Recharts component inside `PerformanceShowcase.tsx`.
3.  **Verify Bundle**:
    - Build and check for warnings or size reduction.

## Todo List
- [ ] Refactor `TradingChart` imports.
- [ ] Refactor `PerformanceShowcase` imports.
- [ ] Add loading fallbacks (Skeletons).
- [ ] Verify functionality remains unchanged.

## Success Criteria
- Components load only when in viewport or required.
- No hydration errors for client-side charts.
