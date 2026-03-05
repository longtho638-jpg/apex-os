# Phase 1: Extract Billing Package

## Context Links
- [Plan overview](./plan.md)
- [unified-tiers.ts](/Users/macbookprom1/mekong-cli/apps/apex-os/src/config/unified-tiers.ts) -- 311 lines, ~30 consumers
- [useUserTier.ts](/Users/macbookprom1/mekong-cli/apps/apex-os/src/hooks/useUserTier.ts) -- 123 lines, 20+ consumers
- [nowpayments-client.ts](/Users/macbookprom1/mekong-cli/apps/apex-os/src/lib/payments/nowpayments-client.ts) -- 172 lines

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Create `packages/vibe-billing/` workspace package. Move 8 billing files. Update ~35 consumer imports. Delete originals + backward-compat wrapper.

## Key Insights

1. **unified-tiers.ts is the hub** -- 30+ files import from it. All types, constants, and helpers live here. Moving this file cleanly is the critical path.
2. **Hooks have app-internal deps** -- `useSubscription` uses `AuthContext` + `@/lib/api/client`. `useUserTier` uses `AuthContext` + `getApiUrl()`. `useUpgradeTier` uses `getSupabaseClientSide()`. These must be parameterized to decouple from app.
3. **payment-tiers.ts is pure re-export** -- Can be eliminated; merge `PAYMENT_TIER_IDS` into unified-tiers exports.
4. **No build step needed** -- Next.js 16 `transpilePackages` compiles raw TS from workspace packages.

## Requirements

### Functional
- All billing types, config, hooks, and payment clients accessible via `@apex-os/vibe-billing`
- Hooks accept auth/fetcher dependencies as parameters (no app-internal imports)
- Backward-compatible type exports (`PaymentTier`, `LegacyTierId`, `PAYMENT_TIER_IDS`)

### Non-Functional
- Zero runtime behavior change
- All files under 200 lines
- kebab-case filenames
- `npm run build` passes

## Architecture

### Dependency Inversion for Hooks

**Before (coupled to app):**
```
useSubscription -> AuthContext -> fetchBillingInfo -> @/lib/api/client
```

**After (decoupled):**
```
// Package exports a factory or parameterized hook
useSubscription({ userId, token, fetcher }) -> RaaSBillingInfo

// App wrapper in src/hooks/ provides AuthContext glue:
import { useSubscription as useBillingSubscription } from '@apex-os/vibe-billing';
import { useAuth } from '@/contexts/AuthContext';

export function useSubscription() {
  const { user, token } = useAuth();
  return useBillingSubscription({ userId: user?.id, token });
}
```

Same pattern for `useUserTier` and `useUpgradeTier`.

### Package Resolution

```
apex-os/package.json
  "workspaces": ["packages/*"]
  "dependencies": { "@apex-os/vibe-billing": "workspace:*" }

next.config.mjs
  transpilePackages: ['@apex-os/vibe-billing']
```

## Related Code Files

### Files to CREATE
| File | Purpose |
|------|---------|
| `packages/vibe-billing/package.json` | Package manifest |
| `packages/vibe-billing/tsconfig.json` | TypeScript config |
| `packages/vibe-billing/src/index.ts` | Barrel export |
| `packages/vibe-billing/src/types/billing-types.ts` | Shared types/interfaces |
| `packages/vibe-billing/src/config/unified-tiers.ts` | Tier config + helpers |
| `packages/vibe-billing/src/hooks/use-subscription.ts` | Parameterized subscription hook |
| `packages/vibe-billing/src/hooks/use-user-tier.ts` | Parameterized tier hook |
| `packages/vibe-billing/src/hooks/use-upgrade-tier.ts` | Parameterized upgrade hook |
| `packages/vibe-billing/src/clients/polar-client.ts` | Polar SDK client |
| `packages/vibe-billing/src/clients/nowpayments-client.ts` | NOWPayments client |
| `packages/vibe-billing/src/api/billing.ts` | fetchBillingInfo (accepts fetcher) |

### Files to MODIFY (import updates)
| File | Change |
|------|--------|
| `src/hooks/useSubscription.ts` | Thin wrapper importing from `@apex-os/vibe-billing` |
| `src/hooks/useUserTier.ts` | Thin wrapper importing from `@apex-os/vibe-billing` |
| `src/hooks/useUpgradeTier.ts` | Thin wrapper importing from `@apex-os/vibe-billing` |
| `src/lib/api/billing.ts` | Re-export from `@apex-os/vibe-billing` |
| ~20 page files importing `useUserTier` | Change to `@apex-os/vibe-billing` OR keep existing import (wrapper) |
| ~30 files importing from `unified-tiers` | Change `@/config/unified-tiers` -> `@apex-os/vibe-billing` |
| `src/app/api/checkout/route.ts` | Update imports for payment clients + tier config |
| `src/lib/agents/execution-agent.ts` | Update nowpayments import |
| `package.json` | Add `workspaces`, add `@apex-os/vibe-billing` dep |
| `next.config.mjs` | Add `transpilePackages` |

### Files to DELETE
| File | Reason |
|------|--------|
| `src/config/payment-tiers.ts` | Wrapper eliminated; exports merged into unified-tiers |

## Implementation Steps

### Step 1: Create package scaffold (5 min)

1. Create `packages/vibe-billing/` directory structure:
   ```
   packages/vibe-billing/
     src/
       types/
       config/
       hooks/
       clients/
       api/
   ```

2. Create `packages/vibe-billing/package.json`:
   ```json
   {
     "name": "@apex-os/vibe-billing",
     "version": "0.1.0",
     "private": true,
     "main": "src/index.ts",
     "types": "src/index.ts",
     "dependencies": {
       "@polar-sh/sdk": "^0.41.5"
     },
     "peerDependencies": {
       "react": "^19.0.0"
     }
   }
   ```

3. Create `packages/vibe-billing/tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2017",
       "lib": ["dom", "dom.iterable", "esnext"],
       "strict": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "react-jsx",
       "noEmit": true,
       "skipLibCheck": true
     },
     "include": ["src/**/*.ts", "src/**/*.tsx"],
     "exclude": ["node_modules"]
   }
   ```

### Step 2: Move types (10 min)

1. Create `packages/vibe-billing/src/types/billing-types.ts`:
   - Extract from `unified-tiers.ts`: `TierId`, `LegacyTierId`, `AnyTierId`, `UnifiedTier`, `PaymentTier`
   - Extract from `billing.ts`: `RaaSBillingInfo` interface
   - Extract from `payment-tiers.ts`: `PAYMENT_TIER_IDS`
   - Extract from `polar-client.ts`: `CreateCheckoutParams`
   - Extract from `nowpayments-client.ts`: `NOWPaymentsInvoiceResponse`, `CreateInvoiceParams`, `CreatePayoutParams`, `PayoutResult`, `PayoutStatus`

### Step 3: Move config (15 min)

1. Copy `src/config/unified-tiers.ts` -> `packages/vibe-billing/src/config/unified-tiers.ts`
2. Remove type definitions (now in `billing-types.ts`), import them instead
3. Merge the `PAYMENT_TIER_IDS` constant from `payment-tiers.ts` into this file
4. Merge the `PAYMENT_TIERS` legacy mapping (already in unified-tiers, just ensure `PAYMENT_TIER_IDS` is there too)
5. All helper functions stay: `getTierById`, `getTierPrice`, `getCommissionRate`, `getSelfRebateRate`, `getSpreadBps`, `getAILimit`, `getAgentSlots`, `getTierByVolume`, `canUpgrade`

### Step 4: Move payment clients (15 min)

1. Copy `src/lib/payments/polar-client.ts` -> `packages/vibe-billing/src/clients/polar-client.ts`
   - Change import: use types from `../types/billing-types`
   - Change import: use tier config from `../config/unified-tiers`

2. Copy `src/lib/payments/nowpayments-client.ts` -> `packages/vibe-billing/src/clients/nowpayments-client.ts`
   - Same import changes
   - Move interfaces to `billing-types.ts`

### Step 5: Move API client (10 min)

1. Create `packages/vibe-billing/src/api/billing.ts`
   - **Parameterize the fetcher.** Instead of importing `get` from `@/lib/api/client`, accept a generic fetch function:
   ```ts
   export type BillingFetcher = <T>(endpoint: string, options?: { params?: Record<string, string>; token?: string }) => Promise<T>;

   export function createBillingApi(fetcher: BillingFetcher) {
     return {
       fetchBillingInfo(userId: string, token?: string): Promise<RaaSBillingInfo> {
         return fetcher<RaaSBillingInfo>('/billing/tier-info', { params: { user_id: userId }, token });
       }
     };
   }
   ```

2. Update `src/lib/api/billing.ts` to become a thin wrapper:
   ```ts
   import { createBillingApi, type RaaSBillingInfo } from '@apex-os/vibe-billing';
   import { get } from './client';
   export type { RaaSBillingInfo };
   const billingApi = createBillingApi(get);
   export const fetchBillingInfo = billingApi.fetchBillingInfo;
   ```

### Step 6: Move hooks (parameterized) (20 min)

1. **`use-subscription.ts`** -- parameterize to accept `{ userId, token, fetchBillingInfo }`:
   ```ts
   "use client";
   import { useEffect, useState } from 'react';
   import type { RaaSBillingInfo } from '../types/billing-types';

   interface UseSubscriptionParams {
     userId?: string;
     token?: string;
     fetchBillingInfo: (userId: string, token?: string) => Promise<RaaSBillingInfo>;
   }

   export function useSubscription({ userId, token, fetchBillingInfo }: UseSubscriptionParams) {
     // ... same logic but uses params instead of useAuth()
   }
   ```

2. **`use-user-tier.ts`** -- parameterize to accept `{ isAuthenticated, token, apiBaseUrl }`:
   - Remove `useAuth()` import
   - Accept auth state as params
   - Accept `apiBaseUrl` string instead of calling `getApiUrl()`
   - Keep `normalizeTier`, `canViewMenu`, `isAtLeast` logic intact
   - Export `MenuId` type from here (or from billing-types)

3. **`use-upgrade-tier.ts`** -- parameterize to accept `{ supabaseClient }`:
   - Remove `getSupabaseClientSide()` import
   - Accept a Supabase-like client object via params
   - Keep upgrade logic intact

4. Update original hook files in `src/hooks/` to become thin wrappers that inject app dependencies:
   ```ts
   // src/hooks/useSubscription.ts
   "use client";
   import { useAuth } from '@/contexts/AuthContext';
   import { useSubscription as useBillingSubscription } from '@apex-os/vibe-billing';
   import { fetchBillingInfo } from '@/lib/api/billing';

   export function useSubscription() {
     const { user, token } = useAuth();
     return useBillingSubscription({
       userId: user?.id,
       token: token ?? undefined,
       fetchBillingInfo
     });
   }
   ```

   Similar thin wrappers for `useUserTier` and `useUpgradeTier`.

### Step 7: Create barrel export (5 min)

1. Create `packages/vibe-billing/src/index.ts`:
   ```ts
   // Types
   export type { TierId, LegacyTierId, AnyTierId, UnifiedTier, PaymentTier,
     RaaSBillingInfo, CreateCheckoutParams, ... } from './types/billing-types';

   // Config
   export { UNIFIED_TIERS, RAAS_CONFIG, PAYMENT_TIERS, PAYMENT_TIER_IDS,
     TIER_ORDER, getTierById, getTierPrice, getCommissionRate,
     getSelfRebateRate, getSpreadBps, getAILimit, getAgentSlots,
     getTierByVolume, canUpgrade } from './config/unified-tiers';

   // Hooks
   export { useSubscription } from './hooks/use-subscription';
   export { useUserTier, type MenuId } from './hooks/use-user-tier';
   export { useUpgradeTier } from './hooks/use-upgrade-tier';

   // Clients
   export { createPolarCheckout, getPolarCheckout, polarClient } from './clients/polar-client';
   export { createNOWPaymentsInvoice, nowPayments } from './clients/nowpayments-client';

   // API
   export { createBillingApi, type BillingFetcher } from './api/billing';
   ```

### Step 8: Wire up workspace (10 min)

1. Update root `package.json`:
   ```json
   {
     "workspaces": ["packages/*"],
     "dependencies": {
       "@apex-os/vibe-billing": "workspace:*",
       ...
     }
   }
   ```

2. Update `next.config.mjs` -- add to the config object:
   ```js
   const nextConfig = {
     transpilePackages: ['@apex-os/vibe-billing'],
     // ... existing config
   };
   ```

3. Run `npm install` to link the workspace package.

### Step 9: Update consumer imports (30 min)

**Batch 1: Direct config consumers (~30 files)**

Replace all `@/config/unified-tiers` imports with `@apex-os/vibe-billing`:
```
Find:    from '@/config/unified-tiers'
Replace: from '@apex-os/vibe-billing'
```

Files (from grep):
- `src/lib/financial/viral-engine.ts`
- `src/lib/viral-economics/commission-calculator.ts`
- `src/lib/viral-economics/tier-manager.ts`
- `src/lib/viral-economics/realtime-commission.ts`
- `src/lib/referral-commission.ts`
- `src/lib/ai/rate-limiter.ts`
- `src/components/onboarding/agentic-onboarding-wizard.tsx`
- `src/components/defi/SwapInterface.tsx`
- `src/components/pricing/PricingModal.tsx`
- `src/components/os/sidebar.tsx`
- `src/components/dashboard/agentic-workflow-panel.tsx`
- `src/components/dashboard/CommissionDashboard.tsx`
- `src/components/payments/CheckoutModal.tsx`
- `src/app/[locale]/billing/page.tsx`
- `src/app/[locale]/pricing/page.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/dashboard/affiliate/page.tsx`
- `src/app/[locale]/offer/page.tsx`
- `src/app/[locale]/dashboard/payment/page.tsx`
- `src/app/[locale]/dashboard/org/page.tsx`
- `src/app/api/admin/analytics/revenue/route.ts`
- `src/app/api/admin/simulate-payout/route.ts`
- `src/app/api/debug/simulate-payout/route.ts`
- `src/app/api/v1/user/tier/route.ts`
- `src/app/api/v1/billing/subscription/route.ts`
- `src/app/api/v1/org/workflows/route.ts`
- `src/app/api/v1/crypto-gate/route.ts`
- `src/app/api/ai/deepseek/analyze/route.ts`
- `src/app/api/ai/chat/route.ts`
- `src/app/api/cron/upsell-tenure/route.ts`
- `src/app/api/admin/users/[id]/portfolio/route.ts`

**Batch 2: payment-tiers consumers (3 files)**

Replace `@/config/payment-tiers` imports:
- `src/app/api/checkout/route.ts` -> import from `@apex-os/vibe-billing`
- The two payment clients are now inside the package (no action)

**Batch 3: payment client consumers (2 files)**

- `src/app/api/checkout/route.ts` -> `from '@apex-os/vibe-billing'`
- `src/lib/agents/execution-agent.ts` -> `from '@apex-os/vibe-billing'`

**Batch 4: Hook consumers (20 files)**

The `src/hooks/useUserTier.ts` wrapper remains in place, so these 20 page files keep importing from `@/hooks/useUserTier`. **No changes needed** for these consumers. Same for `useSubscription` consumers.

### Step 10: Delete originals + clean up (5 min)

1. Delete `src/config/payment-tiers.ts` (wrapper eliminated)
2. Delete `src/config/unified-tiers.ts` (moved to package)
3. Delete `src/lib/payments/polar-client.ts` (moved to package)
4. Delete `src/lib/payments/nowpayments-client.ts` (moved to package)
5. Keep `src/hooks/useSubscription.ts` as thin wrapper
6. Keep `src/hooks/useUserTier.ts` as thin wrapper
7. Keep `src/hooks/useUpgradeTier.ts` as thin wrapper
8. Keep `src/lib/api/billing.ts` as thin wrapper

### Step 11: Verify (10 min)

1. `npm run build` -- must pass with 0 errors
2. `npx vitest run` -- all tests pass
3. `grep -r "from '@/config/unified-tiers'" src/` -- must return 0 results
4. `grep -r "from '@/config/payment-tiers'" src/` -- must return 0 results
5. `grep -r "from '@/lib/payments/" src/` -- must return 0 results (except thin wrappers if kept)

## Todo List

- [ ] Create `packages/vibe-billing/` directory scaffold
- [ ] Create `package.json` and `tsconfig.json`
- [ ] Extract types into `billing-types.ts`
- [ ] Move `unified-tiers.ts` config + merge `payment-tiers.ts` exports
- [ ] Move `polar-client.ts` to `clients/`
- [ ] Move `nowpayments-client.ts` to `clients/`
- [ ] Create parameterized `billing.ts` API (factory pattern)
- [ ] Create parameterized `use-subscription.ts` hook
- [ ] Create parameterized `use-user-tier.ts` hook
- [ ] Create parameterized `use-upgrade-tier.ts` hook
- [ ] Create barrel `index.ts`
- [ ] Add `workspaces` to root `package.json`
- [ ] Add `transpilePackages` to `next.config.mjs`
- [ ] Run `npm install` to link workspace
- [ ] Batch update ~30 `unified-tiers` imports
- [ ] Update 3 `payment-tiers` imports
- [ ] Update 2 payment client imports
- [ ] Convert original hook files to thin wrappers
- [ ] Convert `src/lib/api/billing.ts` to thin wrapper
- [ ] Delete `src/config/payment-tiers.ts`
- [ ] Delete `src/config/unified-tiers.ts`
- [ ] Delete `src/lib/payments/polar-client.ts`
- [ ] Delete `src/lib/payments/nowpayments-client.ts`
- [ ] `npm run build` passes
- [ ] `npx vitest run` passes
- [ ] Verify no stale imports remain

## Success Criteria

- `npm run build` exit code 0
- `npx vitest run` all passing
- `grep -r "@/config/unified-tiers\|@/config/payment-tiers\|@/lib/payments/" src/` returns 0 matches
- Package `@apex-os/vibe-billing` importable from any file
- No app-internal dependencies inside `packages/vibe-billing/src/`

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `"use client"` directive lost in barrel | Medium | High (SSR crash) | Mark hook files with `"use client"` at top, test SSR build |
| Circular dependency via thin wrappers | Low | High | Wrappers only import from package, never vice versa |
| `transpilePackages` not picking up TS | Low | High | Verified Next.js 16 supports this; fallback: add `tsconfig.paths` alias |
| Test mocks break with new import paths | Medium | Medium | Update test mocks to match new `@apex-os/vibe-billing` paths |
| npm workspace resolution fails | Low | Medium | Ensure `workspace:*` syntax; run `npm install` after setup |

## Security Considerations

- Payment client files contain API key references via `process.env` -- these are server-only. Moving to package doesn't change security posture since they're still only called in API routes.
- No secrets are hardcoded in any billing file (verified during review).

## Next Steps

- After extraction, consider adding unit tests specific to the package (`packages/vibe-billing/__tests__/`)
- Future: if other apps in the monorepo need billing, they import `@apex-os/vibe-billing` directly
- Future: add a build step (tsup/tsconfig emit) if the package is published to npm
