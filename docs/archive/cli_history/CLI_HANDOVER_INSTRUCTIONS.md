# CLI HANDOVER INSTRUCTIONS
**Date:** 2025-11-28
**Project:** ApexOS (Next.js 16 + Supabase + AI Dual-Core)
**Status:** Phase 7 Complete (Retention Fortress)

This document contains specific, line-by-line commands to synchronize the development environment, apply database changes, and verify recent features.

---

## 1. 🛑 CRITICAL: Environment Synchronization

Before running the app, ensure your `.env.local` has these **NEW** keys added during Phases 2-7:

```bash
# 1. Check for missing keys (Compare with example)
diff .env.example .env.local

# 2. Required New Keys Checklist:
# - OPENROUTER_API_KEY
# - GOOGLE_CLOUD_PROJECT / GOOGLE_CLOUD_LOCATION (Vertex AI)
# - POLAR_ACCESS_TOKEN / POLAR_WEBHOOK_SECRET
# - NOWPAYMENTS_API_KEY / NOWPAYMENTS_IPN_SECRET
# - CRON_SECRET (For win-back/drip campaigns)
```

---

## 2. 🗄️ Database Synchronization (Supabase)

We have created multiple migration files. You must apply them in this order to ensure the schema supports Payment, AI, and Retention features.

### Option A: Copy-Paste to SQL Editor (Recommended)
Run this command to generate a single block of SQL to copy into your Supabase SQL Editor:

```bash
cat supabase/migrations/20251126_payment_system.sql \
    supabase/migrations/20251128_ai_usage_tracking.sql \
    supabase/migrations/20251128_competitor_tracking.sql \
    supabase/migrations/20251128_complete_payment_system.sql \
    supabase/migrations/20251128_discount_codes.sql \
    supabase/migrations/20251128_onboarding_progress.sql \
    supabase/migrations/20251128_pending_vault.sql \
    supabase/migrations/20251128_usage_charges.sql > full_migration.sql

# Then open full_migration.sql and copy content to Supabase
code full_migration.sql
```

### Option B: Local Supabase CLI (If installed)
```bash
supabase db reset
```

---

## 3. 🧪 Verification & Testing Commands

Run these commands line-by-line to verify system integrity.

### 3.1 Build Verification (TypeScript Strict Mode)
Ensure no type errors exist after recent complex merges.
```bash
npm run build
```

### 3.2 Feature: AI Smart Router & Rate Limiting
Test if the AI endpoint handles the request and rate limits correctly.
```bash
# Requires server running: npm run dev
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{ "userId": "user_123", "messages": [{"role": "user", "content": "Hello"}] }'
```

### 3.3 Feature: Onboarding Status
Check if the onboarding API returns the new structure.
```bash
curl "http://localhost:3000/api/user/onboarding?userId=user_123"
```

### 3.4 Feature: Win-Back Cron Job
Trigger the win-back email campaign manually.
```bash
# Replace <CRON_SECRET> with value from .env.local
curl -H "Authorization: Bearer <CRON_SECRET>" \
     http://localhost:3000/api/cron/winback-campaign
```

---

## 4. 🚀 Next Task Trigger

To proceed to the next phase (Content Strategy or Viral Mechanics), run:

```bash
# View Phase 5 Instructions
cat CLI_PHASE5_CONTENT.txt

# OR View Phase 6 Instructions
cat CLI_PHASE6_VIRAL.txt
```

---

## 5. 🧩 Project Structure Snapshot

Key files created/modified in recent sessions:

*   **AI Core**: `src/lib/ai/smart-router.ts`, `src/lib/ai/rate-limiter.ts`
*   **Payments**: `src/app/api/checkout/route.ts`, `src/lib/payments/nowpayments-client.ts`
*   **Retention**: `src/components/onboarding/OnboardingChecklist.tsx`, `src/components/dashboard/MissedCommissionBanner.tsx`
*   **Finance**: `src/lib/finance/vault-manager.ts`, `src/lib/discount-engine.ts`

---

**End of Instructions.**
