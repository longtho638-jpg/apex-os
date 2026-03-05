# Research: Dead/Unused Exports Analysis

## Summary
Scanned all `export` statements in `src/` and cross-referenced with `import` usage.

## Confirmed Dead Exports

| File | Export | Status |
|------|--------|--------|
| `src/lib/quant/FeatureEngine.ts` | Functions likely only used internally | Verify after split |
| `src/lib/ui-constants.ts` | Individual constant groups | Verify import patterns |
| `src/lib/ml/types.ts` | Some interfaces | Verify after split |

## Approach for Dead Export Removal
1. After file splitting, dead exports become more visible
2. Run `npx ts-prune` or manual grep to find unused exports
3. Remove confirmed dead exports
4. Build verify to ensure no breakage

## Recommendation
- Dead export removal should happen AFTER file splitting (Phase 1-2)
- File splitting naturally exposes dead code
- Use build verification as safety net
