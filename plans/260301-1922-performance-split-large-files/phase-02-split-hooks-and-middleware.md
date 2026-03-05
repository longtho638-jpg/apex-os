---
title: "Phase 02: Split Hooks and Middleware"
status: pending
priority: P1
effort: 45m
parallel: true
---

# Phase 02 — Split Hooks and Middleware

## Context Links
- Plan: [plan.md](./plan.md)
- Research: [researcher-01-large-files.md](./research/researcher-01-large-files.md)

## Parallelization Info
- **Can run in parallel with**: Phase 01, Phase 03
- **Blocked by**: nothing
- **Blocks**: Phase 04

## Overview
- **Date**: 2026-03-01
- **Priority**: P1
- **Status**: pending
- **Description**: Split `useApi.ts` (314 lines) into per-hook files and extract middleware guards from `middleware.ts` (312 lines).

## Key Insights
- `useApi.ts`: aggregates multiple unrelated hooks (PnL, rebates, trade history, portfolio stats, system health) — each hook is independent and self-contained
- `middleware.ts`: mixes JWT verification logic and admin route guard logic — separate concerns into dedicated files, keep orchestrator lean
- Both files are isolated modules with no cross-dependency between them

## Requirements
- Each output file <300 lines
- `useApi.ts` becomes barrel re-exporting individual hook files
- `middleware.ts` becomes thin orchestrator importing guard/verify helpers
- Existing import paths remain valid

## Architecture

```
src/hooks/
├── useApi.ts                  ← barrel re-exports (~30 lines)
├── usePnL.ts                  ← new (~60 lines)
├── useRebates.ts              ← new (~60 lines)
├── useTradeHistory.ts         ← new (~60 lines)
├── usePortfolioStats.ts       ← new (~60 lines)
└── useSystemHealth.ts         ← new (~60 lines)

src/middleware.ts               ← orchestrator (~80 lines)
src/lib/middleware/
├── admin-guard.ts             ← new (~120 lines)
└── jwt-verify.ts              ← new (~120 lines)
```

## File Ownership (EXCLUSIVE to Phase 02)
- `src/hooks/useApi.ts`
- `src/hooks/usePnL.ts` (new)
- `src/hooks/useRebates.ts` (new)
- `src/hooks/useTradeHistory.ts` (new)
- `src/hooks/usePortfolioStats.ts` (new)
- `src/hooks/useSystemHealth.ts` (new)
- `src/middleware.ts`
- `src/lib/middleware/admin-guard.ts` (new)
- `src/lib/middleware/jwt-verify.ts` (new)

## Implementation Steps

1. **useApi.ts** — Read full file, identify each hook function boundary
2. Create `usePnL.ts` — extract `usePnL` hook with its types and imports
3. Create `useRebates.ts` — extract `useRebates` hook
4. Create `useTradeHistory.ts` — extract `useTradeHistory` hook
5. Create `usePortfolioStats.ts` — extract `usePortfolioStats` hook
6. Create `useSystemHealth.ts` — extract `useSystemHealth` hook
7. Replace `useApi.ts` body with barrel: `export * from './usePnL'; export * from './useRebates'; ...`
8. **middleware.ts** — Read full file, identify JWT verification vs admin guard logic
9. Create `src/lib/middleware/jwt-verify.ts` — extract JWT decode/verify functions
10. Create `src/lib/middleware/admin-guard.ts` — extract admin route matching + redirect logic
11. Refactor `middleware.ts` to import from both helpers, keep only orchestration (~80 lines)
12. Run `npx tsc --noEmit` to verify no type errors

## Todo

- [ ] Split useApi.ts into 5 individual hook files
- [ ] Replace useApi.ts with barrel re-exports
- [ ] Extract jwt-verify.ts from middleware.ts
- [ ] Extract admin-guard.ts from middleware.ts
- [ ] Refactor middleware.ts to thin orchestrator
- [ ] Verify `npx tsc --noEmit` passes
- [ ] Verify all output files <300 lines

## Success Criteria
- `useApi.ts` <300 lines (barrel)
- `middleware.ts` <300 lines (orchestrator)
- All 7 new files <300 lines
- `npx tsc --noEmit` 0 errors
- Existing consumers of `useApi` imports unaffected

## Conflict Prevention
- This phase only touches `src/hooks/` and `src/middleware.ts` + `src/lib/middleware/` (new dir)
- Zero overlap with Phase 01 (`src/lib/quant/`, `src/lib/risk/`, etc.) or Phase 03 (`src/components/`, `src/app/`)

## Risk Assessment
- **Low-Medium**: `middleware.ts` is a Next.js special file — must keep default export `middleware` function and `config` export intact
- **Mitigation**: Only extract helper functions; keep `export default middleware` and `export const config` in root `middleware.ts`
- **Watch**: Next.js middleware runs at Edge runtime — ensure `jwt-verify.ts` uses only Edge-compatible APIs (no Node.js builtins)

## Security Considerations
- `jwt-verify.ts` handles JWT decoding — ensure no secrets are hardcoded; env vars must remain referenced correctly after extraction
- Admin guard logic must remain functionally identical — no behavioural changes

## Next Steps
- Phase 04 will audit new hook files for any dead exports
