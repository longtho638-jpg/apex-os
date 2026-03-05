# Phase 2: Image Optimization

## Context
- Parent Plan: [ApexOS Performance Optimization](./plan.md)
- Docs: `nextjs-best-practices.md`

## Overview
- **Status**: Pending
- **Priority**: Medium
- **Description**: Improve LCP and reduce bandwidth by optimizing `next/image` usage with correct `sizes` and loading priorities.

## Key Insights
- `BlogCard` uses `fill` without `sizes`, causing full-size image download on small devices.
- Images above the fold should have `priority={true}`.

## Requirements
1. Add `sizes` prop to all responsive images.
2. Set `priority` for LCP candidates (hero images).
3. Ensure proper aspect ratios to prevent CLS.

## Related Code Files
- `src/components/blog/BlogCard.tsx`
- `src/components/security/TwoFactorSetup.tsx`

## Implementation Steps
1.  **Optimize BlogCard**:
    - Update `src/components/blog/BlogCard.tsx`.
    - Add `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`.
2.  **Optimize 2FA QR Code**:
    - Review `src/components/security/TwoFactorSetup.tsx`.
    - Ensure dimensions are explicit and efficient.

## Todo List
- [ ] Update `BlogCard.tsx` with `sizes`.
- [ ] Review and update `TwoFactorSetup.tsx`.
- [ ] Audit other `next/image` usages via grep.

## Success Criteria
- Images load with appropriate size for the viewport.
- LCP improves on pages with hero images.
