# Phase 06: Testing & Documentation

**Context**: All previous phases
**Priority**: Medium
**Status**: Pending

## Overview
Before "Go-To-Market" (GTM), we must ensure stability and update documentation. Features added (Compliance, Payments, i18n) modify core flows; rigorous testing is non-negotiable.

## Key Insights
- i18n changes often break smoke tests looking for specific English strings.
- Compliance modals can block E2E test runners if not handled.

## Requirements
### Functional
- **E2E Tests**: Update Playwright tests to handle:
  - Locale prefixes in URLs.
  - Cookie banners (click "Accept").
  - ToS modals (click "Accept").
- **Unit Tests**: Verify payment logic and localized string formatting.

### Non-Functional
- Documentation must be updated for Developers (Architecture) and Users (Help Guides).

## Architecture
- **Testing**: Playwright for E2E, Vitest for Unit.
- **Docs**: Markdown in `docs/` folder.

## Related Code Files
- Modify: `e2e/auth.spec.ts`
- Modify: `e2e/trade.spec.ts`
- Create: `docs/features/compliance.md`
- Create: `docs/features/localization.md`
- Create: `docs/user-guide/getting-started.md`

## Implementation Steps
1.  **Fix E2E Config**: Update Playwright `baseURL` or test fixtures to accommodate `/[locale]` routing.
2.  **Test Helpers**: Create helpers to bypass Compliance/Onboarding in tests (`await acceptTerms()`, `await skipTour()`).
3.  **Run Regression**: Execute full test suite; fix failures caused by new blocking UI.
4.  **Unit Tests**: Add tests for `WithdrawalForm` validation and `AuditService`.
5.  **Documentation**: Write technical docs for new modules and user guides for the Onboarding flow.

## Todo List
- [ ] Update Playwright config for i18n
- [ ] Create E2E helpers for Compliance/Tour
- [ ] Fix existing broken tests
- [ ] Add Unit tests for Withdrawals
- [ ] Write `docs/features/compliance.md`
- [ ] Write `docs/features/localization.md`

## Success Criteria
- CI/CD pipeline passes (Green).
- Documentation covers new features.
- Critical paths verified in at least 2 locales (EN, VI).

## Risk Assessment
- **Risk**: Tests become flaky due to tour animations.
- **Mitigation**: Disable animations in test environment or use `await tour.skip()`.

## Security Considerations
- Ensure tests do not expose real API keys or sensitive data in logs/traces.

## Next Steps
- **Launch Prep**: Final deployment checklist.
