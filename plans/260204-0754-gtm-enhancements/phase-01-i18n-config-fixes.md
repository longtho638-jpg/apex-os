# Phase 01: i18n Configuration Fixes

**Context**: [i18n Research Report](../reports/researcher-i18n.md)
**Priority**: CRITICAL (Blocks Phase 05)
**Status**: Pending

## Overview
Currently, `next-intl` is configured but `layout.tsx` hardcodes locales to only English/Vietnamese, or limits scalability. We need to refactor the locale configuration to be dynamic and robust, enabling easy addition of new languages.

## Key Insights
- Existing `layout.tsx` has hardcoded constraints.
- `next.config.mjs` and `src/i18n.ts` (or equivalent) need to be aligned.
- Middleware matcher needs to support all target locales without regression.

## Requirements
### Functional
- Support dynamic locale routing (en, vi, jp, cn, kr).
- Ensure default locale fallback works correctly.
- Fix any hydration mismatches caused by locale switching.

### Non-Functional
- No performance regression on route change.
- Maintain SEO-friendly URL structure (`/en/...`, `/vi/...`).

## Architecture
- **Config**: Centralize locale definitions in `src/config/locales.ts`.
- **Middleware**: Update `src/middleware.ts` to use centralized config.
- **Layout**: Refactor `src/app/[locale]/layout.tsx` to accept dynamic params valid against config.

## Related Code Files
- Modify: `src/middleware.ts`
- Modify: `src/i18n.ts` (or `src/i18n/request.ts`)
- Modify: `src/app/[locale]/layout.tsx`
- Create: `src/config/locales.ts`

## Implementation Steps
1.  **Centralize Config**: Create `src/config/locales.ts` exporting `locales`, `defaultLocale`, and locale metadata.
2.  **Update Request Config**: Update `src/i18n.ts` to use the shared config for validation.
3.  **Refactor Middleware**: Ensure `middleware.ts` imports locales from config and handles redirects properly.
4.  **Fix Layout**: Update root layout to use `unstable_setRequestLocale` (if using static rendering) or proper param validation.
5.  **Verify Routing**: specific test cases for switching between languages.

## Todo List
- [ ] Create `src/config/locales.ts`
- [ ] Refactor `src/i18n.ts`
- [ ] Update `src/middleware.ts` matchers
- [ ] Fix `src/app/[locale]/layout.tsx`
- [ ] Test locale switching manually

## Success Criteria
- User can navigate to `/en`, `/vi`, `/jp` without 404s (even if content is missing, route works).
- `next-intl` throws no console warnings about locale mismatch.

## Risk Assessment
- **Risk**: Infinite redirect loops in middleware.
- **Mitigation**: Unit test middleware logic separately.

## Security Considerations
- Ensure locale param does not allow directory traversal (handled by Next.js, but validate inputs).

## Next Steps
- Proceed to Phase 05 for content population.
