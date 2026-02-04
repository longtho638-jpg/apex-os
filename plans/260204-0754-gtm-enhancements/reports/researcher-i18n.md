# Internationalization (i18n) Research Report

**Date:** 2026-02-04
**Status:** Analysis Complete
**Context:** `next-intl` already integrated; configuration mismatch detected.

## 1. Current State Analysis

The project has a solid i18n foundation using `next-intl` but is artificially restricted.

- **Infrastructure:** ✅ `next-intl` installed and configured (`next.config.mjs`, `src/i18n/`).
- **Routing:** ✅ `src/app/[locale]` routing structure exists.
- **Languages:** ⚠️ **Configuration Mismatch**
  - `src/i18n/routing.ts`: Supports `['en', 'vi', 'th', 'id', 'ko', 'ja', 'zh']`.
  - `src/app/[locale]/layout.tsx`: Restricts to `['en', 'vi']` only.
  - `messages/`: Only contains `en.json` and `vi.json`.
- **UI:** ✅ `LanguageSwitcher.tsx` exists (supports EN, VI, KO, JA, ZH).
- **Formatting:** ❌ `src/lib/utils.ts` hardcodes `en-US` for currency and dates.

## 2. Quick Wins (1-2 Weeks)

### A. Unlock Existing Languages
**Effort:** Low | **Impact:** High
1.  **Update Layout:** Modify `src/app/[locale]/layout.tsx` to import locales from `@/i18n/routing` instead of hardcoding `['en', 'vi']`.
2.  **Create Message Files:** Copy `messages/en.json` to:
    - `zh.json` (Chinese)
    - `ja.json` (Japanese)
    - `ko.json` (Korean)
    - `th.json` (Thai)
    - `id.json` (Indonesian)
3.  **Machine Translation:** Run a script to auto-translate these files using `en.json` as the source (can use OpenAI/DeepL).

### B. Fix Formatting Logic
**Effort:** Low
Refactor `src/lib/utils.ts` to accept `locale`:

```typescript
// Current
export function formatCurrency(amount: number, currency = 'USDT') {
  return new Intl.NumberFormat('en-US', ...).format(amount)...
}

// Recommended
export function formatCurrency(amount: number, locale: string, currency = 'USDT') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'USDT' ? 'USD' : currency,
    // ... options
  }).format(amount).replace('$', '') + ' ' + currency; // Custom USDT handling
}
```

### C. RTL Support (Arabic)
**Effort:** Medium
1.  Add `ar` to `routing.ts`.
2.  In `layout.tsx`, set `dir={locale === 'ar' ? 'rtl' : 'ltr'}` on the `<html>` or `<body>` tag.
3.  Tailwind v4 handles RTL automatically with logical properties (e.g., `ms-2` instead of `ml-2`), but verify legacy utility usage.

## 3. Trading Platform Specifics

### Financial Terminology
Trading interfaces require precise terminology. "Execution" implies different things in code vs. finance.
- **Action:** Create a glossary for translators to ensure consistency (e.g., "Long/Short", "Fill", "Spread", "Slippage").

### Number Formatting
Asian markets (ZH, JA, KO) traditionally use 10,000 groups (Myriad system), though in crypto/finance, standard 3-digit grouping is often preferred for consistency with international charts.
- **Recommendation:** Stick to standard 3-digit grouping for price/volume to match exchange APIs, but respect decimal separators (comma vs dot) based on locale.

### Timezones
Market hours are global.
- **Recommendation:** Use `Intl.DateTimeFormat` with `timeZone` options. Display server time (UTC) alongside local user time to avoid confusion for funding rate countdowns.

## 4. Tools & Workflow

### Translation Management
Since no external TMS (Translation Management System) is currently configured:
1.  **Immediate:** Use `messages/en.json` as the source of truth.
2.  **Process:**
    - Dev adds key to `en.json`.
    - CI/Script checks for missing keys in other files.
    - Use a temporary "pseudo-localization" (e.g., brackets `[Text]`) to spot hardcoded strings.

### Recommended Tooling
- **VS Code Extension:** `i18n Ally` for inline editing.
- **Linting:** `eslint-plugin-next-intl` to catch hardcoded strings.

## 5. Sample Structure (Trading Focused)

Existing `en.json` is well structured. Ensure new keys follow this pattern:

```json
{
  "Trading": {
    "OrderForm": {
      "limit": "Limit",
      "market": "Market",
      "stopLimit": "Stop Limit",
      "availableBalance": "Available: {amount} {symbol}"
    },
    "Positions": {
      "pnl": "PnL (ROE%)",
      "liquidationPrice": "Liq. Price",
      "marginRatio": "Margin Ratio"
    }
  }
}
```

## Unresolved Questions
1.  **RTL Priority:** Is Arabic a confirmed requirement for this sprint? (Adds UI complexity).
2.  **Font Support:** Do current fonts (`Geist`) support CJK (Chinese/Japanese/Korean) characters?
    - *Risk:* Fallback fonts might look jarring.
    - *Fix:* Configure `next/font` to load `Noto Sans` for CJK locales.
