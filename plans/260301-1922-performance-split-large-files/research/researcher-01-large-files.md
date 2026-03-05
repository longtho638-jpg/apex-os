# Research: Large Files Analysis (>300 lines)

## Files Exceeding 300 Lines (sorted by size)

| # | File | Lines | Type |
|---|------|-------|------|
| 1 | `src/components/dashboard/AlphaDashboard.tsx` | 855 | Component |
| 2 | `src/lib/quant/FeatureEngine.ts` | 626 | Class |
| 3 | `src/app/[locale]/settings/page.tsx` | 517 | Page |
| 4 | `src/lib/strategy/phases.ts` | 394 | Data |
| 5 | `src/app/[locale]/dashboard/reports/page.tsx` | 390 | Page |
| 6 | `src/lib/risk/RiskMetrics.ts` | 366 | Class |
| 7 | `src/app/[locale]/admin/providers/page.tsx` | 363 | Page |
| 8 | `src/lib/ui-constants.ts` | 361 | Constants |
| 9 | `src/lib/ml/types.ts` | 348 | Types |
| 10 | `src/hooks/useApi.ts` | 314 | Hooks |
| 11 | `src/middleware.ts` | 312 | Middleware |

## Split Strategies

### AlphaDashboard.tsx (855 → ~150 orchestrator)
- Extract `SignalSidebar.tsx`, `PositionList.tsx`, `ArbSidebar.tsx`, `TradingPanel.tsx`

### FeatureEngine.ts (626 → ~80 facade)
- Split: `momentum-indicators.ts`, `volatility-indicators.ts`, `volume-indicators.ts`, `trend-indicators.ts`, `quant-utils.ts`

### settings/page.tsx (517 → ~120)
- Extract: `ProfileTab.tsx`, `ApiKeysTab.tsx`, `PreferencesTab.tsx`, `SecurityTab.tsx`

### RiskMetrics.ts (366 → ~80 facade)
- Split: `var-calculations.ts`, `performance-metrics.ts`, `drawdown-analysis.ts`, `monte-carlo.ts`

### useApi.ts (314 → barrel)
- Split each hook: `usePnL.ts`, `useRebates.ts`, `useTradeHistory.ts`, `usePortfolioStats.ts`, `useSystemHealth.ts`

### middleware.ts (312 → ~80 orchestrator)
- Extract: `admin-guard.ts`, `jwt-verify.ts`

### reports/page.tsx (390 → ~100)
- Extract: `QuickReportCard.tsx`, `TransactionTable.tsx`, `UpgradePrompt.tsx`

### admin/providers/page.tsx (363 → ~200)
- Extract: `ProviderStatsBar.tsx`, `ProviderFilters.tsx`

### Low priority (pure data/types):
- `strategy/phases.ts` (394) — pure data array
- `ui-constants.ts` (361) — pure constants
- `ml/types.ts` (348) — pure type definitions
