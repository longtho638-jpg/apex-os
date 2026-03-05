---
title: "Report: Performance — Split Large Files + Dead Exports"
date: 2026-03-01
plan: plans/260301-1922-performance-split-large-files/
---

# Planner Report: Performance File Splitting

## Summary

Plan created for splitting 11 files exceeding 300 lines in `apex-os`. Structured as 3 parallel phases + 1 sequential verification phase.

## Plan Files

| File | Purpose |
|------|---------|
| `plans/260301-1922-performance-split-large-files/plan.md` | Overview, dependency graph, file ownership matrix |
| `phase-01-split-lib-utility-modules.md` | FeatureEngine, RiskMetrics, ui-constants, ml/types, strategy/phases |
| `phase-02-split-hooks-and-middleware.md` | useApi.ts, middleware.ts |
| `phase-03-split-page-components.md` | AlphaDashboard, settings, reports, providers pages |
| `phase-04-dead-exports-and-verification.md` | ts-prune audit + build verification |

## Parallelization

Phases 1, 2, 3 have zero file overlap — can be assigned to 3 implementer agents simultaneously. Phase 4 gates on all three.

## File Impact

| Phase | Files Modified | New Files | Net Lines Reduced |
|-------|---------------|-----------|------------------|
| 1 | 5 (become barrels) | 14 | ~2095 → <300 each |
| 2 | 2 (become barrels/orchestrators) | 7 | ~626 → <300 each |
| 3 | 4 (become orchestrators) | 13 | ~2125 → <300 each |
| 4 | 0–N (dead export removals) | 0 | minor |

## Key Risks

- **AlphaDashboard.tsx** (855 lines, highest risk): shared local state must be inventoried before extraction; Zustand preferred over prop-drilling
- **middleware.ts**: Next.js Edge runtime constraint — extracted `jwt-verify.ts` must use only Edge-compatible APIs
- **ts-prune barrel false positives**: barrel re-exports appear "unused" to ts-prune — manual review required before removal

## Unresolved Questions

1. Does `FeatureEngine` class use `this.*` calls that couple methods internally? If yes, extraction into separate files requires passing the class instance or refactoring to pure functions — needs file read to confirm.
2. Are any of the `ml/types.ts` interfaces used in external packages (e.g., `packages/` dir)? ts-prune may not cross package boundaries.
3. Does `strategy/phases.ts` export a single merged array or individual phase objects? Split strategy depends on the data shape.
