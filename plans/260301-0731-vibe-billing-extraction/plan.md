---
title: "Extract billing code into @apex-os/vibe-billing package"
description: "Move billing hooks, tier config, payment clients, and API client into a reusable workspace package"
status: pending
priority: P2
effort: 2h
branch: main
tags: [refactor, billing, package-extraction, monorepo]
created: 2026-03-01
---

# vibe-billing Package Extraction

## Summary

Extract all billing-related code (hooks, config, payment clients, types) from `src/` into `packages/vibe-billing/` as `@apex-os/vibe-billing`. API routes and webhooks stay in the app; only imports change.

## Current State

| Category | File | Lines | Consumers |
|----------|------|-------|-----------|
| Hook | `src/hooks/useSubscription.ts` | 47 | 1 (billing.ts) |
| Hook | `src/hooks/useUserTier.ts` | 123 | 20 pages + sidebar |
| Hook | `src/hooks/useUpgradeTier.ts` | 70 | minimal |
| Config | `src/config/unified-tiers.ts` | 311 | ~30 files (pages, components, API routes, libs) |
| Config | `src/config/payment-tiers.ts` | 28 | 3 (polar-client, nowpayments, checkout route) |
| Client | `src/lib/payments/polar-client.ts` | 48 | 1 (checkout route) |
| Client | `src/lib/payments/nowpayments-client.ts` | 172 | 2 (checkout route, execution-agent) |
| API | `src/lib/api/billing.ts` | 37 | 1 (useSubscription) |

**Total: 8 files, ~836 lines, ~35 unique consumers**

## Key Dependencies (Inward)

The billing files import from these app-internal modules:
- `@/contexts/AuthContext` -- used by useSubscription, useUserTier (auth hook)
- `@/lib/api/client` -- used by billing.ts (`get()` helper)
- `@/lib/api/config` -- used by useUserTier (`getApiUrl()`)
- `@/lib/supabase` -- used by useUpgradeTier (`getSupabaseClientSide()`)
- `@/lib/logger` -- used by useUserTier, useUpgradeTier

**Decision:** Hooks that depend on app-specific AuthContext/Supabase will accept dependencies via parameters or re-export from the package with the understanding that consumers must provide the context. Config + types + payment clients have no app dependencies and move cleanly.

## Architecture Decision

**Approach: Local workspace package with TypeScript source imports (no build step)**

- Next.js `transpilePackages` handles compilation
- No separate `tsc` build step needed
- Package exports raw `.ts` files via `src/index.ts`
- Simplest path; add build step later only if needed (YAGNI)

## Target Structure

```
packages/vibe-billing/
  package.json              # @apex-os/vibe-billing, main: src/index.ts
  tsconfig.json             # extends app tsconfig, strict
  src/
    index.ts                # Barrel export
    types/
      billing-types.ts      # All shared interfaces + type exports
    config/
      unified-tiers.ts      # UNIFIED_TIERS, RAAS_CONFIG, helpers, TIER_ORDER
    hooks/
      use-subscription.ts   # useSubscription (parameterized: no AuthContext dep)
      use-user-tier.ts      # useUserTier (parameterized: no AuthContext dep)
      use-upgrade-tier.ts   # useUpgradeTier (parameterized: no Supabase dep)
    clients/
      polar-client.ts       # Polar SDK checkout
      nowpayments-client.ts # NOWPayments invoice + payout
    api/
      billing.ts            # fetchBillingInfo (parameterized: accepts fetcher)
```

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [Extract billing package](./phase-01-extract-billing-package.md) | pending | 2h |

Single phase -- the extraction is straightforward and best done atomically.

## Success Criteria

- [ ] `npm run build` passes with zero errors
- [ ] All 35+ consumers compile with new `@apex-os/vibe-billing` imports
- [ ] No duplicate type definitions (single source of truth)
- [ ] `payment-tiers.ts` wrapper removed (inlined into unified-tiers exports)
- [ ] Package has no dependency on `@/contexts/*`, `@/lib/supabase`, `@/lib/logger`, `@/lib/api/client`
- [ ] Existing tests still pass (`vitest run`)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Circular import from app-internal deps | High | Parameterize hooks to accept auth/fetcher via args |
| 30+ files need import updates | Medium | Bulk find-replace `@/config/unified-tiers` -> `@apex-os/vibe-billing` |
| Next.js transpilePackages quirk | Low | Verified: Next.js 16 supports this natively |
| Hooks losing `"use client"` directive | Medium | Ensure barrel re-export preserves directive |

## Unresolved Questions

1. **Should `useUserTier` keep its `MenuId` type?** Currently it defines menu-specific gating inside the hook. This ties billing to UI navigation. Consider splitting `MenuId` out or keeping it for now (KISS).
2. **`payment-tiers.ts` backward compat wrapper** -- the scout says to remove it, but `checkout/route.ts` imports from it. Plan: merge `PAYMENT_TIER_IDS` into unified-tiers exports, then delete the file.
3. **`@/lib/api/client` dependency** -- `billing.ts` uses the shared `get()` helper. Options: (a) accept a generic fetcher function param, (b) copy the minimal fetch logic into the package. Plan uses (a).
