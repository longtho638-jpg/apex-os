# Phase 2: Resolve NPM Vulnerabilities

**Priority:** High
**Status:** Pending

## Context
`npm audit` reports 42 vulnerabilities (4 Critical, 32 High). These need to be resolved to meet security standards.

## Analysis (Anticipated)
Common issues in current stack:
- `@octokit/*`: Often related to request handling.
- `semantic-release`: Often dev dependency, but might report high.
- `vega-embed` / `glamor`: Frontend deps.

## Steps
1.  **Audit:** Run `npm audit` to capture current state.
2.  **Update:** Run `npm audit fix` for safe updates.
3.  **Manual Fixes:** For breaking changes or those not fixed by auto-fix:
    - Identify package.
    - Upgrade explicitly: `npm install <package>@latest`.
    - If nested dependency: Use `overrides` in `package.json` if strictly necessary and safe.
4.  **Verification:**
    - Run `npm audit` (Goal: 0 Critical/High).
    - Run `npm run build` to ensure no breaking changes in build.
    - Run `npm test` to ensure no regressions.

## Dependencies to Check
- `micromatch`
- `braces`
- `axios` (if used)
- `next` (ensure latest patch)

## Success Criteria
- `npm audit` returns clean (ignoring low/info if non-actionable).
- Build passes.
