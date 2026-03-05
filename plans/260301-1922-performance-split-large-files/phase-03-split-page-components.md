---
title: "Phase 03: Split Page Components"
status: pending
priority: P1
effort: 1h
parallel: true
---

# Phase 03 — Split Page Components

## Context Links
- Plan: [plan.md](./plan.md)
- Research: [researcher-01-large-files.md](./research/researcher-01-large-files.md)

## Parallelization Info
- **Can run in parallel with**: Phase 01, Phase 02
- **Blocked by**: nothing
- **Blocks**: Phase 04

## Overview
- **Date**: 2026-03-01
- **Priority**: P1
- **Status**: pending
- **Description**: Split 4 oversized UI files (855+517+390+363 lines) into focused sub-components. Largest split in the plan.

## Key Insights
- `AlphaDashboard.tsx` (855 lines): monolithic dashboard with signal sidebar, position list, arbitrage sidebar, trading panel — each panel is a distinct visual region
- `settings/page.tsx` (517 lines): tabbed settings UI with Profile, API Keys, Preferences, Security tabs — each tab is a standalone form
- `reports/page.tsx` (390 lines): report cards, transaction table, upgrade prompt — distinct presentational blocks
- `admin/providers/page.tsx` (363 lines): provider stats bar + filters + table — stats and filters are reusable sub-components

## Requirements
- Each output file <300 lines
- Page files remain as thin orchestrators importing sub-components
- Sub-components placed in colocated `_components/` directories (Next.js App Router convention)
- No logic changes — structural refactor only

## Architecture

```
src/components/dashboard/
├── AlphaDashboard.tsx              ← orchestrator (~150 lines)
├── signal-sidebar.tsx              ← new (~180 lines)
├── position-list.tsx               ← new (~180 lines)
├── arb-sidebar.tsx                 ← new (~180 lines)
└── trading-panel.tsx               ← new (~180 lines)

src/app/[locale]/settings/
├── page.tsx                        ← orchestrator (~120 lines)
└── _components/
    ├── profile-tab.tsx             ← new (~120 lines)
    ├── api-keys-tab.tsx            ← new (~120 lines)
    ├── preferences-tab.tsx         ← new (~120 lines)
    └── security-tab.tsx            ← new (~120 lines)

src/app/[locale]/dashboard/reports/
├── page.tsx                        ← orchestrator (~100 lines)
└── _components/
    ├── quick-report-card.tsx       ← new (~100 lines)
    ├── transaction-table.tsx       ← new (~120 lines)
    └── upgrade-prompt.tsx          ← new (~80 lines)

src/app/[locale]/admin/providers/
├── page.tsx                        ← orchestrator (~200 lines)
└── _components/
    ├── provider-stats-bar.tsx      ← new (~100 lines)
    └── provider-filters.tsx        ← new (~80 lines)
```

## File Ownership (EXCLUSIVE to Phase 03)
- `src/components/dashboard/AlphaDashboard.tsx`
- `src/components/dashboard/signal-sidebar.tsx` (new)
- `src/components/dashboard/position-list.tsx` (new)
- `src/components/dashboard/arb-sidebar.tsx` (new)
- `src/components/dashboard/trading-panel.tsx` (new)
- `src/app/[locale]/settings/page.tsx`
- `src/app/[locale]/settings/_components/profile-tab.tsx` (new)
- `src/app/[locale]/settings/_components/api-keys-tab.tsx` (new)
- `src/app/[locale]/settings/_components/preferences-tab.tsx` (new)
- `src/app/[locale]/settings/_components/security-tab.tsx` (new)
- `src/app/[locale]/dashboard/reports/page.tsx`
- `src/app/[locale]/dashboard/reports/_components/quick-report-card.tsx` (new)
- `src/app/[locale]/dashboard/reports/_components/transaction-table.tsx` (new)
- `src/app/[locale]/dashboard/reports/_components/upgrade-prompt.tsx` (new)
- `src/app/[locale]/admin/providers/page.tsx`
- `src/app/[locale]/admin/providers/_components/provider-stats-bar.tsx` (new)
- `src/app/[locale]/admin/providers/_components/provider-filters.tsx` (new)

## Implementation Steps

1. **AlphaDashboard.tsx** — Read full file; identify JSX regions for SignalSidebar, PositionList, ArbSidebar, TradingPanel
2. Extract each region + its local state/handlers into `signal-sidebar.tsx`, `position-list.tsx`, `arb-sidebar.tsx`, `trading-panel.tsx`
3. Props-drill or use existing Zustand store for shared state — do not add new state
4. Replace extracted JSX in `AlphaDashboard.tsx` with `<SignalSidebar />`, `<PositionList />`, etc.
5. **settings/page.tsx** — Read full file; identify each tab panel JSX block
6. Create `_components/` dir under settings; extract `profile-tab.tsx`, `api-keys-tab.tsx`, `preferences-tab.tsx`, `security-tab.tsx`
7. Replace tab panel JSX in `page.tsx` with imported tab components
8. **reports/page.tsx** — Extract `quick-report-card.tsx`, `transaction-table.tsx`, `upgrade-prompt.tsx`
9. Replace in `page.tsx` with imported components
10. **admin/providers/page.tsx** — Extract `provider-stats-bar.tsx`, `provider-filters.tsx`
11. Replace in `page.tsx` with imported components
12. Run `npx tsc --noEmit` to verify; check no missing prop types

## Todo

- [ ] Split AlphaDashboard.tsx into 4 sub-components
- [ ] Split settings/page.tsx into 4 tab components
- [ ] Split reports/page.tsx into 3 sub-components
- [ ] Split admin/providers/page.tsx into 2 sub-components
- [ ] Verify `npx tsc --noEmit` passes
- [ ] Verify all output files <300 lines

## Success Criteria
- `AlphaDashboard.tsx` <300 lines
- `settings/page.tsx` <300 lines
- `reports/page.tsx` <300 lines
- `admin/providers/page.tsx` <300 lines
- All new sub-components <300 lines
- `npx tsc --noEmit` 0 errors
- No visible UI regressions

## Conflict Prevention
- Phase 03 exclusively owns `src/components/dashboard/` and the 3 app route directories listed
- Zero overlap with Phase 01 (`src/lib/`) or Phase 02 (`src/hooks/`, `src/middleware.ts`)

## Risk Assessment
- **Medium**: AlphaDashboard (855 lines) is the highest-risk split — shared local state must be identified before extraction
- **Mitigation**: Prefer Zustand store over prop-drilling; if state is truly local, lift to orchestrator and pass as props
- **Watch**: Client/Server component boundary in App Router — extracted components must keep `'use client'` directive if they use hooks or browser APIs

## Security Considerations
- `api-keys-tab.tsx` renders sensitive API key data — ensure no keys are logged or exposed in component props during extraction
- Maintain existing masking/display patterns verbatim

## Next Steps
- Phase 04 audits all new component files for dead exports
