# Prompt for Gemini CLI 3.0 Pro - Payment Integration Task

## 📋 Task Assignment

You are **Gemini CLI 3.0 Pro**, assigned to implement Polar.sh + Binance Pay dual payment gateway integration for ApexOS.

## 🎯 Objective

Execute the implementation plan in `payment_integration_plan.md` (artifact) to create a production-ready payment system with:
- Polar.sh for fiat payments (Merchant of Record)
- Binance Pay for crypto payments
- Database schema for transactions tracking
- Webhook handlers for both gateways
- Frontend checkout UI

## 📚 Required Reading (MANDATORY - Read FIRST)

1. **Project Context**: `.gemini/DAILY_UPDATE.md`
2. **Implementation Plan**: Artifact `payment_integration_plan.md`
3. **Agents to Consult**:
   - `.ai/agents/code-reviewer.md` - For security review
   - `.ai/agents/database-admin.md` - For SQL schema
   - `.ai/agents/tester.md` - For test strategy
   - `.ai/agents/ui-ux-designer.md` - For checkout UI

## 🚀 Execution Instructions

### Phase 1: Setup (30 min)
```bash
# 1. Install dependencies
npm install @polar-sh/sdk zod
npm install -D @types/node

# 2. Create directory structure
mkdir -p src/lib/payments
mkdir -p src/app/api/webhooks/{polar,binance-pay}
mkdir -p src/components/payments
mkdir -p src/config
mkdir -p supabase/migrations
```

### Phase 2: Configuration (1 hour)
Create files in this order:
1. **Environment Setup**:
   - Update `.env.example` with template
   - Document required env vars

2. **Payment Config**:
   - Create `src/config/payment-tiers.ts`
   - Define PAYMENT_TIERS constant

3. **Database Migration**:
   - Create `supabase/migrations/20251126_payment_system.sql`
   - Include all tables, RLS policies, indexes

### Phase 3: Backend Integration (3 hours)

#### Polar Integration
1. **Client**: `src/lib/payments/polar-client.ts`
   - Export `createPolarCheckout()`
   - Export `getPolarCheckout()`

2. **Webhook**: `src/app/api/webhooks/polar/route.ts`
   - Implement signature verification
   - Handle `checkout.completed` event
   - Create transaction + subscription records

#### Binance Pay Integration
1. **Client**: `src/lib/payments/binance-pay-client.ts`
   - Export `createBinancePayOrder()`
   - Export `queryBinancePayOrder()`
   - Implement HMAC-SHA512 signature

2. **Webhook**: `src/app/api/webhooks/binance-pay/route.ts`
   - Implement signature verification
   - Handle `PAY_SUCCESS` event
   - Create transaction + subscription records

#### API Routes
1. **Checkout**: `src/app/api/checkout/route.ts`
   - Validate input with Zod
   - Route to appropriate gateway
   - Return checkout URL

### Phase 4: Frontend (2 hours)

1. **PaymentMethodSelector**: `src/components/payments/PaymentMethodSelector.tsx`
   - Radio buttons for Polar vs Binance Pay
   - Show crypto discount badge

2. **CheckoutModal**: `src/components/payments/CheckoutModal.tsx`
   - Display pricing with discount
   - Handle checkout flow
   - Loading states

### Phase 5: Testing (1 hour)

Create test files:
```bash
src/lib/payments/__tests__/polar-client.test.ts
src/lib/payments/__tests__/binance-pay-client.test.ts
src/app/api/webhooks/__tests__/polar.test.ts
src/app/api/webhooks/__tests__/binance-pay.test.ts
```

Test coverage:
- Signature generation/verification
- Webhook event handling
- Database inserts
- Error cases

## ⚠️ Critical Requirements

### Security
- [ ] NEVER commit `.env.local` with real API keys
- [ ] ALWAYS validate webhook signatures
- [ ] Use `SUPABASE_SERVICE_ROLE_KEY` for server-side only
- [ ] Implement rate limiting on checkout endpoint

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] All functions have JSDoc comments
- [ ] Error handling for all external API calls
- [ ] Logging for debugging (use `console.error`)

### Database
- [ ] Enable RLS on all tables
- [ ] Create indexes for query performance
- [ ] Add `updated_at` triggers
- [ ] Test RLS policies

### Compliance
- [ ] Log all transactions
- [ ] Store webhook payloads in metadata
- [ ] Implement idempotency (check duplicate transactions)

## 📊 Deliverables

After completion, you should have created:

1. **Files Created** (20 files):
   - 2 payment clients (`polar-client.ts`, `binance-pay-client.ts`)
   - 2 webhook handlers (Polar, Binance Pay)
   - 1 checkout API route
   - 2 React components (PaymentMethodSelector, CheckoutModal)
   - 1 payment config (`payment-tiers.ts`)
   - 1 database migration
   - 4+ test files
   - Updated `.env.example`

2. **Tests**:
   - >80% coverage for payment modules
   - All webhook handlers tested
   - Database integration tests

3. **Documentation**:
   - JSDoc comments on all functions
   - README update with setup instructions
   - API documentation for webhooks

## 🔍 Self-Check Before Completion

Run these commands to verify:

```bash
# 1. TypeScript compilation
npm run build

# 2. Tests
npm test

# 3. Linting
npm run lint

# 4. Check for hardcoded secrets
grep -r "polar_sk_" src/
grep -r "binance" .env.local
```

Expected results:
- ✅ Build succeeds
- ✅ All tests pass
- ✅ No lint errors
- ✅ No secrets in code

## 💬 Commit Messages

Use conventional commit format:

```bash
feat(payment): add Polar.sh integration
feat(payment): add Binance Pay integration
feat(payment): create checkout API endpoint
feat(payment): add payment UI components
feat(db): create payment transactions schema
test(payment): add webhook handler tests
docs(payment): update setup instructions
```

## 🆘 If You Get Stuck

1. **Consult agents** in `.ai/agents/` for specific guidance
2. **Check implementation plan** for detailed code examples
3. **Review project conventions** in `.gemini/DAILY_UPDATE.md`
4. **Ask for clarification** if requirements are unclear

## ✅ Definition of Done

The task is complete when:

- [ ] All 20+ files created and working
- [ ] Database migration runs successfully
- [ ] Tests pass (>80% coverage)
- [ ] TypeScript compiles without errors
- [ ] No hardcoded secrets in code
- [ ] Webhook signature verification implemented
- [ ] Frontend components render correctly
- [ ] All commits follow conventional format
- [ ] README updated with setup instructions

---

**Start by confirming you have read:**
1. ✅ `.gemini/DAILY_UPDATE.md`
2. ✅ `payment_integration_plan.md` (artifact)
3. ✅ All 4 agents in `.ai/agents/`

Then execute Phase 1: Setup.

**Estimated Time**: 7-8 hours total
**Priority**: P0 (Critical for monetization)

Good luck! 🚀
