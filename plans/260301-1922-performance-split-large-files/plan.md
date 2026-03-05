---
title: "Performance: Split Large Files + Remove Dead Exports"
description: "Split 11 files >300 lines into focused modules, remove dead exports, verify all src files <300 lines"
status: pending
priority: P1
effort: 3h
branch: main
tags: [performance, refactor, file-splitting, dead-exports]
created: 2026-03-01
---

# Performance: Split Large Files

## Dependency Graph

```
Phase 1 (lib/)  ──┐
Phase 2 (hooks) ──┼──→ Phase 4 (dead exports + verify)
Phase 3 (pages) ──┘
```

Phases 1, 2, 3: PARALLEL. Phase 4: SEQUENTIAL after all.

## File Ownership Matrix

| Phase | Files Owned | Lines | Status |
|-------|-------------|-------|--------|
| 1 | FeatureEngine.ts, RiskMetrics.ts, ui-constants.ts, ml/types.ts, strategy/phases.ts | 626+366+361+348+394=2095 | pending |
| 2 | useApi.ts, middleware.ts | 314+312=626 | pending |
| 3 | AlphaDashboard.tsx, settings/page.tsx, reports/page.tsx, providers/page.tsx | 855+517+390+363=2125 | pending |
| 4 | All new files (read-only audit + dead export removal) | - | blocked by 1,2,3 |

## Phases

- [phase-01](./phase-01-split-lib-utility-modules.md) — Split lib/ utilities (FeatureEngine, RiskMetrics, ui-constants, ml/types, strategy/phases)
- [phase-02](./phase-02-split-hooks-and-middleware.md) — Split hooks + middleware (useApi, middleware)
- [phase-03](./phase-03-split-page-components.md) — Split pages/components (AlphaDashboard, settings, reports, providers)
- [phase-04](./phase-04-dead-exports-and-verification.md) — Dead exports removal + final verification

## Success Criteria

- [ ] 0 src files >300 lines
- [ ] Build passes: `npm run build`
- [ ] No broken imports
- [ ] Dead exports removed with ts-prune confirmation
