# Apex OS GTM Enhancements Implementation Plan

> **Status**: In Progress
> **Timeline**: Sprint (1-2 weeks)
> **Goal**: Production-ready GTM features (Onboarding, Compliance, Payments, i18n)

## Overview
This plan targets critical Go-To-Market features needed for the public launch of Apex OS.
It addresses findings from research on Onboarding, Compliance, Payments, and Internationalization.

## Phases

### [Phase 01: i18n Configuration Fixes](./phase-01-i18n-config-fixes.md)
**Priority**: CRITICAL | **Status**: Completed
Fix `next-intl` configuration and `layout.tsx` hardcoded locales to enable proper multi-language support. Blocks Phase 05.

### [Phase 02: Compliance Foundation](./phase-02-compliance-foundation.md)
**Priority**: High | **Status**: Pending
Implement ToS/Privacy acceptance flows, GDPR-compliant cookie consent, and user data export.

### [Phase 03: User Onboarding Flow](./phase-03-user-onboarding-flow.md)
**Priority**: High | **Status**: Pending
Create an interactive "First Trade" tour using `react-joyride` and a paper trading faucet.

### [Phase 04: Payment Enhancements](./phase-04-payment-enhancements.md)
**Priority**: Medium | **Status**: Pending
Add withdrawal UI components and invoice generation for the existing Polar/NOWPayments integration.

### [Phase 05: i18n Content](./phase-05-i18n-content.md)
**Priority**: Medium | **Status**: Completed
Create and populate translation files for supported languages (EN, VI, etc.) based on Phase 01 structure.

### [Phase 06: Testing & Documentation](./phase-06-testing-documentation.md)
**Priority**: Medium | **Status**: Pending
Comprehensive testing (E2E, Unit) and documentation update for all new features.

## Key Dependencies
- Phase 01 blocks Phase 05.
- Phase 02 is required for GDPR compliance in EU markets.
- Phase 03 depends on existing Paper Trading Engine.

## Questions & Risks
- **Risk**: `next-intl` routing changes might affect existing middleware.
- **Risk**: Third-party cookie consent integration might block essential analytics if not configured correctly.
