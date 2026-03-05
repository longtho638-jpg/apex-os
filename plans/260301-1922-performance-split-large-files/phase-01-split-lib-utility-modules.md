---
title: "Phase 01: Split lib/ Utility Modules"
status: pending
priority: P1
effort: 1h
parallel: true
---

# Phase 01 — Split lib/ Utility Modules

## Context Links
- Plan: [plan.md](./plan.md)
- Research: [researcher-01-large-files.md](./research/researcher-01-large-files.md)
- Research: [researcher-02-dead-exports.md](./research/researcher-02-dead-exports.md)

## Parallelization Info
- **Can run in parallel with**: Phase 02, Phase 03
- **Blocked by**: nothing
- **Blocks**: Phase 04

## Overview
- **Date**: 2026-03-01
- **Priority**: P1
- **Status**: pending
- **Description**: Split 5 oversized lib/ modules into focused sub-modules. All files are in `src/lib/` and independent of each other.

## Key Insights
- `FeatureEngine.ts` (626 lines): monolithic class with momentum/volatility/volume/trend indicator methods — split by indicator category
- `RiskMetrics.ts` (366 lines): VaR, performance, drawdown, Monte Carlo methods — split by calculation domain
- `ui-constants.ts` (361 lines): pure constant groups — split by UI domain (colors, spacing, chart config, etc.)
- `ml/types.ts` (348 lines): pure type definitions — split by model/feature/signal domain
- `strategy/phases.ts` (394 lines): pure data array — split by phase category or time period

## Requirements
- Each output file <300 lines
- Original file becomes barrel re-export (or thin facade for classes)
- All existing import paths remain valid (barrel pattern preserves this)
- No logic changes — structural refactor only

## Architecture

```
src/lib/quant/
├── FeatureEngine.ts          ← facade/barrel (~80 lines)
├── momentum-indicators.ts    ← new (~120 lines)
├── volatility-indicators.ts  ← new (~120 lines)
├── volume-indicators.ts      ← new (~120 lines)
├── trend-indicators.ts       ← new (~100 lines)
└── quant-utils.ts            ← new (~80 lines)

src/lib/risk/
├── RiskMetrics.ts            ← facade/barrel (~80 lines)
├── var-calculations.ts       ← new (~90 lines)
├── performance-metrics.ts    ← new (~90 lines)
├── drawdown-analysis.ts      ← new (~90 lines)
└── monte-carlo.ts            ← new (~80 lines)

src/lib/
├── ui-constants.ts           ← barrel re-exports (~50 lines)
├── ui-constants-colors.ts    ← new (~100 lines)
├── ui-constants-charts.ts    ← new (~120 lines)
└── ui-constants-layout.ts    ← new (~100 lines)

src/lib/ml/
├── types.ts                  ← barrel re-exports (~50 lines)
├── model-types.ts            ← new (~100 lines)
├── feature-types.ts          ← new (~100 lines)
└── signal-types.ts           ← new (~100 lines)

src/lib/strategy/
├── phases.ts                 ← barrel re-exports (~50 lines)
├── early-phases.ts           ← new (~130 lines)
├── mid-phases.ts             ← new (~130 lines)
└── late-phases.ts            ← new (~120 lines)
```

## File Ownership (EXCLUSIVE to Phase 01)
- `src/lib/quant/FeatureEngine.ts`
- `src/lib/quant/momentum-indicators.ts` (new)
- `src/lib/quant/volatility-indicators.ts` (new)
- `src/lib/quant/volume-indicators.ts` (new)
- `src/lib/quant/trend-indicators.ts` (new)
- `src/lib/quant/quant-utils.ts` (new)
- `src/lib/risk/RiskMetrics.ts`
- `src/lib/risk/var-calculations.ts` (new)
- `src/lib/risk/performance-metrics.ts` (new)
- `src/lib/risk/drawdown-analysis.ts` (new)
- `src/lib/risk/monte-carlo.ts` (new)
- `src/lib/ui-constants.ts`
- `src/lib/ui-constants-colors.ts` (new)
- `src/lib/ui-constants-charts.ts` (new)
- `src/lib/ui-constants-layout.ts` (new)
- `src/lib/ml/types.ts`
- `src/lib/ml/model-types.ts` (new)
- `src/lib/ml/feature-types.ts` (new)
- `src/lib/ml/signal-types.ts` (new)
- `src/lib/strategy/phases.ts`
- `src/lib/strategy/early-phases.ts` (new)
- `src/lib/strategy/mid-phases.ts` (new)
- `src/lib/strategy/late-phases.ts` (new)

## Implementation Steps

1. **FeatureEngine.ts** — Read full file, identify method groups by indicator category
2. Create `momentum-indicators.ts`, `volatility-indicators.ts`, `volume-indicators.ts`, `trend-indicators.ts`, `quant-utils.ts` with extracted methods
3. Replace `FeatureEngine.ts` body with imports from sub-files + class re-assembly or barrel export
4. **RiskMetrics.ts** — Read full file, group methods: VaR → `var-calculations.ts`, perf → `performance-metrics.ts`, drawdown → `drawdown-analysis.ts`, Monte Carlo → `monte-carlo.ts`
5. Replace `RiskMetrics.ts` with thin facade importing from sub-files
6. **ui-constants.ts** — Group constants by domain → `ui-constants-colors.ts`, `ui-constants-charts.ts`, `ui-constants-layout.ts`
7. Replace `ui-constants.ts` with barrel: `export * from './ui-constants-colors'; ...`
8. **ml/types.ts** — Group types by domain → `model-types.ts`, `feature-types.ts`, `signal-types.ts`
9. Replace `ml/types.ts` with barrel re-exports
10. **strategy/phases.ts** — Split data array by phase group → `early-phases.ts`, `mid-phases.ts`, `late-phases.ts`
11. Replace `strategy/phases.ts` with barrel that re-exports merged array
12. Run `npx tsc --noEmit` to verify no type errors introduced

## Todo

- [ ] Split FeatureEngine.ts into 5 sub-files
- [ ] Split RiskMetrics.ts into 4 sub-files
- [ ] Split ui-constants.ts into 3 sub-files
- [ ] Split ml/types.ts into 3 sub-files
- [ ] Split strategy/phases.ts into 3 sub-files
- [ ] Verify `npx tsc --noEmit` passes
- [ ] Verify all output files <300 lines

## Success Criteria
- All 5 original files now <300 lines (barrel/facade pattern)
- All new sub-files <300 lines
- `npx tsc --noEmit` 0 errors
- No import path changes needed by consumers

## Conflict Prevention
- This phase only touches `src/lib/` — zero overlap with Phase 02 (hooks/) or Phase 03 (components/, app/)
- Barrel pattern ensures consumers don't need import path updates

## Risk Assessment
- **Low**: Pure structural refactor, no logic changes
- **Mitigation**: Use barrel re-exports so existing imports remain valid
- **Watch**: FeatureEngine class methods that call `this.*` internally — keep within same class or pass instance

## Security Considerations
- N/A — structural refactor only, no auth/data handling changes

## Next Steps
- Phase 04 will run ts-prune on all new files to identify dead exports
