---
title: "Phase 04: Dead Exports Removal + Final Verification"
status: pending
priority: P1
effort: 30m
parallel: false
---

# Phase 04 — Dead Exports Removal + Final Verification

## Context Links
- Plan: [plan.md](./plan.md)
- Research: [researcher-02-dead-exports.md](./research/researcher-02-dead-exports.md)

## Parallelization Info
- **Can run in parallel with**: nothing — SEQUENTIAL
- **Blocked by**: Phase 01, Phase 02, Phase 03 (all must complete first)
- **Blocks**: nothing (final phase)

## Overview
- **Date**: 2026-03-01
- **Priority**: P1
- **Status**: blocked
- **Description**: After all splits complete, audit for dead exports using ts-prune, remove confirmed dead ones, then run final line-count and build verification.

## Key Insights
- Dead export candidates flagged by research: internals in `FeatureEngine.ts`, some constant groups in `ui-constants.ts`, some interfaces in `ml/types.ts`
- File splitting naturally surfaces dead code — barrel files expose which sub-exports are never imported externally
- ts-prune only flags `export` statements not referenced by any other file; safe to remove
- Build verification is the final safety net

## Requirements
- Use `npx ts-prune` — no global install
- Remove only exports confirmed unused (not just flagged — verify manually for re-exported barrel items)
- Final check: 0 src files >300 lines
- Full build must pass: `npm run build`

## Architecture

```
Audit flow:
  npx ts-prune → list unused exports
  → manual review (exclude barrel re-exports, test-only exports)
  → remove confirmed dead exports
  → npx tsc --noEmit (type check)
  → npm run build (full build)
  → wc -l src/**/*.ts src/**/*.tsx | sort -rn | head -20 (line count check)
```

## File Ownership (EXCLUSIVE to Phase 04)
- **Read-only audit** of all files from Phases 01–03
- **Write** only to remove dead `export` keywords/statements in any src file
- No new files created

## Implementation Steps

1. Confirm Phases 01, 02, 03 are all complete
2. Run ts-prune: `npx ts-prune 2>/dev/null | grep -v '(used in module)'`
3. Review output — exclude false positives:
   - Barrel re-exports (exported by index/barrel, consumed transitively)
   - Items exported for test files only (acceptable to keep)
   - Public API exports intended for future use (keep if documented)
4. For each confirmed dead export: remove the `export` keyword or the entire declaration if unused
5. After removals, run `npx tsc --noEmit` — fix any type errors introduced
6. Run final line count check:
   ```bash
   find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -20
   ```
7. Confirm 0 files exceed 300 lines — if any remain, flag for follow-up split
8. Run full build: `npm run build`
9. Confirm build exits 0

## Todo

- [ ] Confirm Phase 01 complete
- [ ] Confirm Phase 02 complete
- [ ] Confirm Phase 03 complete
- [ ] Run `npx ts-prune` and capture output
- [ ] Review and classify each flagged export
- [ ] Remove confirmed dead exports
- [ ] Run `npx tsc --noEmit` — 0 errors
- [ ] Run line count check — 0 files >300 lines
- [ ] Run `npm run build` — exits 0
- [ ] Write verification summary to plans/reports/

## Success Criteria
- `npx ts-prune` output reviewed; confirmed dead exports removed
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0
- `find src \( -name '*.ts' -o -name '*.tsx' \) | xargs wc -l | awk '$1 > 300 && NF==2'` returns empty
- Summary report written to `plans/reports/planner-260301-1925-performance-split-large-files.md`

## Conflict Prevention
- This phase does not create new files or restructure modules
- Only removes `export` declarations — minimal blast radius
- Full build is the authoritative conflict detector

## Risk Assessment
- **Low**: ts-prune is additive-safe — only removes, never adds
- **Watch**: Barrel re-exports can show as "unused" in ts-prune even when consumed — always manually verify before removing
- **Mitigation**: `npm run build` as final gate catches any incorrectly removed exports

## Security Considerations
- N/A — removing unused exports has no security implications

## Next Steps
- Task complete. Update `plan.md` status to `completed`.
- Optional: add `eslint-plugin-unused-imports` to CI to prevent recurrence
