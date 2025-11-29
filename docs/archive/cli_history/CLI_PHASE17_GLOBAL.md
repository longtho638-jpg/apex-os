# CLI PHASE 17: GLOBAL DOMINATION (LOCALIZATION)

## Strategic Context: 遠交近攻 (Befriend the Distant)

**Sun Tzu Principle**: "Attack where they are unprepared."

**Application**: While competitors fight for the saturated English market, we quietly dominate emerging markets (Vietnam, Korea, Japan) where demand is high but high-quality tools are scarce.

**Objective**: Launch in 5 key languages.
**Timeline**: Week 6 (2-3 days CLI execution)

---

## TASK 1: i18n INFRASTRUCTURE

### 1.1 Dependencies
```bash
npm install next-intl
```

### 1.2 Configuration
**File**: `src/i18n/request.ts` (NEW)
**File**: `src/middleware.ts` (MODIFY)

**Languages**:
- `en`: English (Default)
- `vi`: Vietnamese (High volume)
- `ko`: Korean (High value)
- `ja`: Japanese (High retention)
- `zh`: Chinese (Huge market)

### 1.3 Structure
- Move all hardcoded strings to `messages/en.json`.
- Update `layout.tsx` and pages to use `useTranslations()`.

---

## TASK 2: LANGUAGE SWITCHER

### 2.1 Component
**File**: `src/components/i18n/LanguageSwitcher.tsx` (NEW)

**UI**:
- Globe icon in header.
- Dropdown with flags.
- Persist user preference.

### 2.2 Integration
- Add to `SiteHeader` and `Sidebar`.

---

## TASK 3: AI TRANSLATION ENGINE

### 3.1 Translation Script
**File**: `scripts/translate.ts` (NEW)

**Logic**:
1. Read `messages/en.json`.
2. Identify missing keys in target languages.
3. Call DeepSeek via OpenRouter:
   "Translate this JSON to [Language]. Context: Crypto Trading Platform. Keep technical terms (Long, Short, Margin) standard."
4. Write to `messages/[lang].json`.

**Execution**:
Run `npx tsx scripts/translate.ts` to auto-translate the entire app.

---

## DELIVERABLES

1. ✅ **Multilingual App**: Support 5 languages.
2. ✅ **Language Switcher**: Easy toggle for users.
3. ✅ **Zero-Effort Translation**: AI handles the heavy lifting.

---

## EXECUTION COMMAND

```bash
Execute PHASE 17 (Global Domination)

Implement:
1. next-intl Setup (Config + Middleware)
2. Language Switcher UI
3. AI Translation Script (DeepSeek)

Quality:
- TypeScript strict mode
- SEO-friendly URLs (/vi/pricing, /ko/dashboard)
- Build: 0 errors
```
