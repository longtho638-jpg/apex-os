# i18n & Translation Standards

> **Principle**: Zero Technical Debt. No text shall be hardcoded. All keys must exist.

## 1. Architecture
ApexOS uses `next-intl` with a custom `I18nContext` for type-safe, performant translations.
- **Source of Truth**: `src/messages/en.json`
- **Supported Locales**: `en` (default), `vi`
- **Context**: `src/contexts/I18nContext.tsx`

## 2. Namespace Structure
Translations MUST be grouped by feature/page namespace to avoid key collisions and improve maintainability.

### ✅ Correct
```json
{
  "Dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back"
  },
  "Trade": {
    "buy": "Buy",
    "sell": "Sell"
  }
}
```

### ❌ Incorrect (Flat Structure)
```json
{
  "dashboard_title": "Dashboard",
  "trade_buy": "Buy"
}
```

## 3. Usage Rules

### Component Usage
Always use the `useTranslations` hook with a specific namespace.

```typescript
// ✅ Good
const t = useTranslations('Dashboard');
return <h1>{t('title')}</h1>;

// ❌ Bad (No namespace)
const t = useTranslations();
return <h1>{t('Dashboard.title')}</h1>;
```

### Missing Keys
- **Development**: Console warning `[I18n] Missing translation for key: "Namespace.key"`
- **Production**: Fallback to key string (e.g., "Dashboard.title")
- **Policy**: A missing key is a P1 bug.

## 4. Workflow
1. **Add Feature**: Create UI component.
2. **Define Keys**: Add keys to `en.json` immediately.
3. **Translate**: Add keys to `vi.json` (use AI or ask team).
4. **Verify**: Check UI in both locales.

## 5. Common Namespaces
- `Common`: Shared buttons (Save, Cancel), states (Loading, Error).
- `Auth`: Login, Signup, MFA.
- `Sidebar`: Navigation items.
- `Admin`: Admin-specific terms.

---
**Status**: Active
**Last Updated**: 2025-11-24
