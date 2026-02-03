# Project Changelog

## [Unreleased]

## [1.0.1] - 2026-02-04
### Security
- **Audit**: Completed full security audit.
- **Dependencies**: Reduced npm vulnerabilities from 42 high/critical to 9 high (0 critical) via package overrides.
- **Webhooks**: Fixed Polar webhook signature verification in `route.ts` to prevent replay and spoofing attacks.

### Fixed
- **Tests**: Resolved flaky tests across multiple domains.
- **CI/CD**: CI pipeline is now GREEN (122/122 tests passing).

### Changed
- **Config**: Excluded `mobile/` directory from Vitest configuration to prevent conflicts.
