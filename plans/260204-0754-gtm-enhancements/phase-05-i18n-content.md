# Phase 05: i18n Content

**Context**: [i18n Research Report](../reports/researcher-i18n.md)
**Priority**: Medium
**Status**: Completed

## Overview
With the configuration fixed (Phase 01), we have generated and organized the actual translation content. We structured the JSON translation files to be modular and manageable, avoiding a single massive file.

## Key Insights
- Managing translations in a single file leads to merge conflicts.
- Namespacing (e.g., `auth.login.title`, `trade.order.buy`) is best practice.
- Fallback to English is essential for missing keys in other languages.

## Requirements
### Functional
- Support 5 initial languages: English (en), Vietnamese (vi), Japanese (ja), Chinese (zh), Korean (ko).
- Complete translation coverage for critical flows: Auth, Dashboard, Trading, Wallet.

### Non-Functional
- Translations loaded efficiently (server-side where possible).
- Type-safe translation keys using `next-intl` TypeScript integration.

## Architecture
- **Structure**:
  ```
  messages/
    en.json
    vi.json
    ja.json
    zh.json
    ko.json
    th.json
    id.json
  ```
  Or split by feature if `next-intl` supports dynamic imports, but standard approach is single JSON per locale for simplicity in Next.js App Router (often loaded per request).
- **Tooling**: Use script to verify missing keys across languages.

## Related Code Files
- Create/Update: `messages/en.json` (Base source of truth)
- Create: `messages/vi.json`, `messages/ja.json`, `messages/zh.json`, `messages/ko.json`, `messages/th.json`, `messages/id.json`
- Modify: `src/components/auth/*` (Replace hardcoded text with `t('key')`)
- Modify: `src/components/dashboard/*` (Replace hardcoded text)

## Implementation Steps
1.  **Extract Strings**: Audit codebase (Auth, Trade, Wallet pages) and replace hardcoded text with `t('namespace.key')`.
2.  **Build Base English JSON**: Organize keys hierarchically in `messages/en.json`.
3.  **Machine Translate Drafts**: Use script/tool to generate initial drafts for VI, JP, CN, KR.
4.  **Manual Review (Partial)**: Review critical UI elements (Buttons, Headers) for layout breakage (long text).
5.  **Type Generation**: Ensure `global.d.ts` is configured for `next-intl` type safety.

## Todo List
- [x] Audit and extract strings from Auth pages
- [x] Audit and extract strings from Dashboard/Trade pages
- [x] Create `messages/en.json`
- [x] Generate `messages/vi.json`
- [x] Generate `messages/ja.json` (Japanese)
- [x] Generate `messages/zh.json` (Chinese)
- [x] Generate `messages/ko.json` (Korean)
- [x] Generate `messages/th.json` (Thai)
- [x] Generate `messages/id.json` (Indonesian)
- [x] Verify UI layout with long strings (e.g., German/Russian if added, or verbose VI)

## Success Criteria
- [x] No raw text visible in the UI when browsing critical paths.
- [x] Changing locale instantly updates text.
- [x] TypeScript autocomplete works for `t()` keys.

## Risk Assessment
- **Risk**: Missing keys causing "auth.login.title" to appear in UI.
- **Mitigation**: `next-intl` default error handler or fallback to English.

## Security Considerations
- Ensure no sensitive data is hardcoded in translation files (unlikely, but good to check).

## Next Steps
- Set up a process for continuous translation (e.g., Crowdin or simple git workflow).
