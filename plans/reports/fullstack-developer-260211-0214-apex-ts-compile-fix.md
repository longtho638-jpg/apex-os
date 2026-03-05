# TypeScript Compile Error Fixes - apex-os

**Date:** 2026-02-11
**Status:** Completed
**Before:** 166 error lines (60+ unique errors across 30+ files)
**After:** 0 production errors (1 test file error remains, acceptable per spec)

## Root Cause

Previous `any` type elimination was too aggressive:
1. Logger functions (`src/lib/logger.ts`, `backend/utils/logger.ts`) had `Record<string, unknown>` params but callers passed strings, Error objects, ErrorInfo, etc.
2. State types used `Record<string, unknown>` instead of proper interfaces
3. Type casts used direct assertions where `unknown` intermediate was needed
4. Binance API data arrays typed as `(string | number)[]` but passed directly to `parseFloat(string)`

## Files Modified

| File | Change |
|------|--------|
| `backend/utils/logger.ts` | Convert `unknown` error to proper Record in error() method |
| `src/lib/logger.ts` | Broaden `info/warn/error/debug` meta params from `Record<string, unknown>` to `unknown`; fix `maskSensitiveData` indexing |
| `src/lib/audit.ts` | Allow `oldValue/newValue` to be `string \| Record` |
| `src/types/finance.ts` | Add `COMMISSION`, `REFERRAL_REWARD` to TransactionType union |
| `src/app/[locale]/admin/providers/components/ProviderImportModal.tsx` | Cast Papa Parse rows from `unknown` to `Record<string, string>`; use `String()` for ReactNode rendering |
| `src/app/[locale]/dashboard/affiliate/page.tsx` | Create `AffiliateStats` interface, replace `Record<string, unknown>` |
| `src/app/[locale]/dashboard/reports/page.tsx` | Add explicit `: string` return type to `formatMetadata`, wrap values with `String()` |
| `src/app/[locale]/dashboard/signals/[id]/page.tsx` | Create `Signal` interface with typed fields |
| `src/app/[locale]/trade/page.tsx` | Create `MarketData` and `Trade` interfaces |
| `src/app/api/ai/deepseek/analyze/route.ts` | Create `DeepSeekStrategy` interface, use `as unknown as` cast |
| `src/app/api/auth/recover/route.ts` | Fixed by logger broadening |
| `src/app/api/cron/upsell-tenure/route.ts` | Handle Supabase join result as array or single object |
| `src/app/api/v1/admin/audit-logs/route.ts` | Import `AuditLog` type, use instead of `Record<string, unknown>[]` |
| `src/app/api/v1/admin/providers/route.ts` | Remove `as Record<string, unknown>` casts, use `payload.sub` directly |
| `src/app/api/v1/public/check-link/route.ts` | Import `SupabaseClient`, use as parameter type |
| `src/app/api/v1/wolf-pack/status/route.ts` | Handle `wallets` as array or single object |
| `src/app/api/webhooks/polar/route.ts` | Type-assert `metadata` as `{ userId?: string; tier?: string }`, wrap `amount` with `Number()` |
| `src/components/providers/NotificationsProvider.tsx` | Cast `payload.new` as `NotificationPayload` |
| `src/components/pwa/InstallPrompt.tsx` | Cast `Event` to `BeforeInstallPromptEvent` |
| `src/components/settings/exchange/ExchangeLinkAccountForm.tsx` | Use `??` operators for optional string values |
| `src/components/testing/TestConsole.tsx` | Explicitly type `results` array as `TestResult[]` |
| `src/hooks/useUserPortfolio.ts` | Cast supabase client to `any` for realtime channel subscription |
| `src/lib/algo/backtest-engine.ts` | Allow `label?` optional, `params?: Record<string, unknown>`, handle `condition` undefined |
| `src/lib/binance-feed.ts` | Wrap `parseFloat` args with `String()`, `candle[0]` with `Number()` |
| `src/lib/trading/data-pipeline.ts` | Wrap `parseFloat` args with `String()` |
| `src/lib/trading/binance-client.ts` | Convert `Record<string, string\|number>` to `Record<string, string>` before URLSearchParams |
| `src/lib/payments/polar-client.ts` | Use `as unknown as` for Polar CheckoutCreate cast |

## Verification

```
npx tsc --noEmit 2>&1 | grep -v '__tests__\|\.test\.' | grep 'error TS'
# Output: (empty) - 0 production errors
```
