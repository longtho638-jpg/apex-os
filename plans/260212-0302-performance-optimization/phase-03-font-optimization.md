# Phase 3: Font & Layout Optimization

## Context
- Parent Plan: [ApexOS Performance Optimization](./plan.md)
- Docs: `nextjs-best-practices.md`

## Overview
- **Status**: Pending
- **Priority**: Medium
- **Description**: Configure `next/font` to ensure text is visible during loading (`swap`) and minimize layout shifts.

## Key Insights
- `Geist` font is used. Default behavior usually good, but explicit configuration ensures consistency.
- `display: 'swap'` helps with FID/LCP perception.

## Requirements
1. Verify `src/app/layout.tsx` font configuration.
2. Ensure `variable` approach is used correctly with Tailwind.

## Related Code Files
- `src/app/layout.tsx`
- `src/app/globals.css` (check font variable usage)

## Implementation Steps
1.  **Configure Geist Font**:
    - Update `src/app/layout.tsx`.
    - Add `display: 'swap'` to `Geist` and `Geist_Mono` config.
    - Ensure `subsets: ['latin']` is present.
2.  **Verify Tailwind Config**:
    - Ensure `tailwind.config.ts` (or v4 CSS) refers to the font variables correctly.

## Todo List
- [ ] Update `layout.tsx` font config.
- [ ] Verify font loading in browser network tab.

## Success Criteria
- Text visible immediately (no FOIT).
- Correct font applied after load (FOUT managed by swap).
