# GEMINI CLI - i18n FULL IMPLEMENTATION

**Mission**: Add complete i18n support to 3 marketing pages

**Timeline**: 2 hours

**Deliverables**: Vietnamese translations + updated React code

---

## 🎯 TASK 1: Vietnamese Translation (30 min)

**File**: `messages/vi.json`

Em (Claude) đã add English keys vào `messages/en.json`:
- `Homepage` - Homepage keys
- `Landing` - Landing page keys  
- `Pricing` - Pricing page keys

**Your job**: Add Vietnamese translations

### Instructions:

1. Read `messages/en.json` (lines added at bottom)
2. Translate ALL keys to Vietnamese
3. Add to `messages/vi.json`

**Translation Guidelines**:
- Natural Vietnamese (not literal translation)
- Keep technical terms in English (API, dashboard, etc.)
- Marketing tone: Hype but professional
- CTAs: Action-oriented Vietnamese

**Example**:
```json
// English
"Stop Losing Money on Crypto Rebates"

// Vietnamese (GOOD)
"Đừng Để Mất Tiền Vì Rebate Crypto"

// Vietnamese (BAD - too literal)
"Dừng mất tiền trên hoàn tiền crypto"
```

---

## 🎯 TASK 2: Update Homepage (30 min)

**File**: `src/app/[locale]/page.tsx`

**Current**: Hardcoded English text

**Target**: Use `useTranslations('Homepage')`

### Instructions:

1. Import hook:
```typescript
import { useTranslations } from '@/contexts/I18nContext';
```

2. Use in component:
```typescript
export default function LandingPage() {
    const t = useTranslations('Homepage');
    
    return (
        <div>
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.subtitle')}</p>
            // etc...
        </div>
    );
}
```

3. Replace ALL hardcoded text with `t('key')`

**Keep**:
- Component structure unchanged
- Styling unchanged
- Just replace text!

---

## 🎯 TASK 3: Update Landing Page (30 min)

**File**: `src/app/[locale]/landing/page.tsx`

**Same process as Task 2**:

1. Import `useTranslations`
2. Use `const t = useTranslations('Landing')`
3. Replace all text with `t('section.key')`

**Sections to update**:
- Hero
- Problem (pain points)
- Solution
- Testimonials
- Features
- Pricing CTA
- FAQ

---

## 🎯 TASK 4: Update Pricing Page (30 min)

**File**: `src/app/[locale]/payment/page.tsx`

**Same process**:

1. Import `useTranslations`
2. Use `const t = useTranslations('Pricing')`
3. Replace all text

**Special attention**:
- Tier names
- Feature lists (map over arrays)
- Price formatting (keep $ symbol)

**Example for tier features**:
```typescript
// Before
features: ["1 exchange", "Basic tracking", "7-day history"]

// After
features: t('tiers.free.features', { returnObjects: true }) as string[]
```

---

## 🎯 OUTPUT FORMAT

Create/Update 4 files:

1. `messages/vi.json` - Vietnamese translations
2. `src/app/[locale]/page.tsx` - i18n homepage
3. `src/app/[locale]/landing/page.tsx` - i18n landing
4. `src/app/[locale]/payment/page.tsx` - i18n pricing

---

## ✅ TESTING CHECKLIST

After completing all tasks:

1. [ ] `npm run dev` - No errors
2. [ ] Visit `http://localhost:3000/en` - English works
3. [ ] Visit `http://localhost:3000/vi` - Vietnamese works
4. [ ] Visit `http://localhost:3000/en/landing` - English works
5. [ ] Visit `http://localhost:3000/vi/landing` - Vietnamese works
6. [ ] Visit `http://localhost:3000/en/payment` - English works
7. [ ] Visit `http://localhost:3000/vi/payment` - Vietnamese works
8. [ ] No missing translation warnings in console
9. [ ] All CTAs clickable
10. [ ] All layouts intact

---

## 💎 QUALITY STANDARDS

**Vietnamese Translation**:
- ✅ Natural, native-level Vietnamese
- ✅ Marketing terminology in English when appropriate
- ✅ Consistent tone (professional but exciting)
- ✅ CTAs compelling (action verbs)

**Code**:
- ✅ TypeScript strict mode passes
- ✅ No ESLint errors
- ✅ Existing styling preserved
- ✅ Component structure unchanged
- ✅ Only text replaced with i18n

**Testing**:
- ✅ Both languages work
- ✅ No console errors
- ✅ SEO meta tags updated (if any)
- ✅ Mobile responsive (unchanged)

---

## 🚀 EXECUTION PRIORITY

1. **Task 1**: Vietnamese translation (foundation)
2. **Task 2**: Homepage i18n (simplest)
3. **Task 3**: Landing i18n (medium)
4. **Task 4**: Pricing i18n (complex - tier arrays)

**Start with Task 1 - Vietnamese translations!**

---

## 📝 NOTES

**Existing i18n pattern** (from other pages):
```typescript
// Login page example
const t = useTranslations('Login');

return (
    <input placeholder={t('email_placeholder')} />
    <button>{t('submit')}</button>
);
```

**Follow this exact pattern!**

**Context path**: `@/contexts/I18nContext`

**Translation files**: `messages/en.json` and `messages/vi.json`

---

## 💪 YOU GOT THIS, GEMINI!

**Remember**:
- Quality Vietnamese (not Google Translate!)
- Preserve all React code structure
- Just swap hardcoded text → t('keys')
- Test thoroughly

**Deliverable**: Fully bilingual marketing pages ready to convert international users! 🌍

**GO GO GO!** 🔥🚀
