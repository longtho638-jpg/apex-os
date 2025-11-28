# Debug Checklist - Payment Integration

**Reviewer**: Claude  
**Date**: Post-Gemini Implementation  
**Priority**: P0 (Critical Review)

---

## 🔍 Phase 1: Code Review Checklist

### Security Audit (CRITICAL)

#### Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` has NO real values
- [ ] All API keys accessed via `process.env`
- [ ] No secrets hardcoded in source files

**Command to check**:
```bash
grep -r "polar_sk_" src/ backend/
grep -r "binance.*key" src/ backend/
git log --all --full-history --source --oneline -- .env.local
```

**Expected**: No results (secrets not committed)

---

#### Webhook Signature Verification

**Polar Webhook** (`src/app/api/webhooks/polar/route.ts`):
- [ ] Signature header extracted: `x-polar-signature`
- [ ] HMAC-SHA256 implementation correct
- [ ] Timing-safe comparison used (`crypto.timingSafeEqual`)
- [ ] Returns 401 for invalid signatures

**Binance Pay Webhook** (`src/app/api/webhooks/binance-pay/route.ts`):
- [ ] Signature header extracted: `binancepay-signature`
- [ ] HMAC-SHA512 implementation correct
- [ ] Uppercase digest matching
- [ ] Returns 401 for invalid signatures

**Test command**:
```bash
npm test src/app/api/webhooks/__tests__/
```

---

#### Database Security (RLS Policies)

Check migration file:
- [ ] `payment_transactions` has RLS enabled
- [ ] `subscriptions` has RLS enabled
- [ ] Users can ONLY view own transactions
- [ ] Admin policy commented but ready
- [ ] No public access policies

**SQL to verify**:
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('payment_transactions', 'subscriptions');
```

---

### Code Quality

#### TypeScript Compliance
```bash
npx tsc --noEmit
```
- [ ] No TypeScript errors
- [ ] Strict mode enabled in `tsconfig.json`
- [ ] No `any` types (except justified with `// @ts-expect-error` comment)

#### Linting
```bash
npm run lint
```
- [ ] No ESLint errors
- [ ] No ESLint warnings in critical files

#### Test Coverage
```bash
npm test -- --coverage
```
- [ ] Overall coverage >80%
- [ ] Payment modules coverage >90%
- [ ] All webhook handlers tested

---

## 🔧 Phase 2: Functional Testing

### Database Schema

**Run migration**:
```bash
psql $DATABASE_URL < supabase/migrations/20251126_payment_system.sql
```

**Verify tables exist**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('payment_transactions', 'subscriptions');
```
- [ ] Both tables exist
- [ ] Columns match schema
- [ ] Indexes created
- [ ] Triggers installed

**Check RLS**:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('payment_transactions', 'subscriptions');
```
- [ ] `rowsecurity = true` for both tables

---

### API Endpoints

#### Checkout API

**Test Polar checkout**:
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "tier": "FOUNDERS",
    "gateway": "polar",
    "userEmail": "test@example.com"
  }'
```

**Expected response**:
```json
{
  "checkoutUrl": "https://polar.sh/checkout/...",
  "checkoutId": "checkout_..."
}
```

- [ ] Returns 200 status
- [ ] `checkoutUrl` is valid Polar URL
- [ ] `checkoutId` matches pattern

**Test Binance Pay checkout**:
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "tier": "PREMIUM",
    "gateway": "binance_pay",
    "userEmail": "test@example.com"
  }'
```

**Expected response**:
```json
{
  "checkoutUrl": "https://pay.binance.com/...",
  "orderId": "APEX-test-user-123-...",
  "prepayId": "..."
}
```

- [ ] Returns 200 status
- [ ] `checkoutUrl` is valid Binance Pay URL
- [ ] `orderId` follows format `APEX-{userId}-{timestamp}`

**Error cases**:
```bash
# Missing auth
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier": "FOUNDERS", "gateway": "polar", "userEmail": "test@example.com"}'
```
- [ ] Returns 401 Unauthorized

```bash
# Invalid tier
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{"tier": "INVALID", "gateway": "polar", "userEmail": "test@example.com"}'
```
- [ ] Returns 400 Bad Request (Zod validation)

---

### Webhook Handlers

#### Polar Webhook

**Test with sample payload**:
```bash
# Generate test signature
WEBHOOK_SECRET="your_polar_webhook_secret"
PAYLOAD='{"type":"checkout.completed","data":{"id":"checkout_123","customer_email":"test@example.com","metadata":{"userId":"user-123","tier":"FOUNDERS"},"amount":4900,"currency":"USD"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:3000/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -H "x-polar-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Expected**:
- [ ] Returns 200 with `{"received": true}`
- [ ] Transaction created in `payment_transactions`
- [ ] Subscription created/updated in `subscriptions`

**Check database**:
```sql
SELECT * FROM payment_transactions
WHERE gateway_transaction_id = 'checkout_123';

SELECT * FROM subscriptions
WHERE user_id = 'user-123';
```

---

#### Binance Pay Webhook

**Test with sample payload**:
```bash
WEBHOOK_SECRET="your_binance_webhook_secret"
PAYLOAD='{"bizType":"PAY","bizStatus":"PAY_SUCCESS","data":{"merchantTradeNo":"APEX-user-123-1234567890","totalFee":"44.10","currency":"USDT","transactionId":"txn_abc123"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha512 -hmac "$WEBHOOK_SECRET" | tr '[:lower:]' '[:upper:]')

curl -X POST http://localhost:3000/api/webhooks/binance-pay \
  -H "Content-Type: application/json" \
  -H "binancepay-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Expected**:
- [ ] Returns 200 with `{"returnCode": "SUCCESS"}`
- [ ] Transaction created
- [ ] Subscription updated

---

### Frontend Components

**Start dev server**:
```bash
npm run dev
```

**Navigate to pricing page** (create if needed):
```
http://localhost:3000/pricing
```

**Check PaymentMethodSelector**:
- [ ] Two options visible: "Card/PayPal" and "Crypto"
- [ ] Crypto option shows "Save 15%" badge
- [ ] Clicking toggles selection
- [ ] Selected state shows blue border

**Check CheckoutModal**:
- [ ] Opens when "Subscribe" clicked
- [ ] Shows correct tier name
- [ ] Displays price with/without discount
- [ ] Gateway selector works
- [ ] "Pay with Card" or "Pay with Crypto" button correct text
- [ ] Loading state during checkout
- [ ] Redirects to checkout URL

---

## 🐛 Phase 3: Common Issues & Fixes

### Issue 1: Webhook Signature Validation Fails

**Symptoms**:
- Webhooks return 401
- Logs show "Invalid signature"

**Debug**:
```typescript
// Add debug logging in webhook handler
console.log('Received signature:', signature);
console.log('Expected signature:', expectedSignature);
console.log('Payload:', payload);
```

**Common causes**:
- Wrong secret in `.env.local`
- Signature algorithm mismatch (SHA256 vs SHA512)
- Payload not raw string (JSON.parse before verification)
- Case sensitivity (Binance uses uppercase)

**Fix**:
- Verify secret matches Polar/Binance dashboard
- Ensure raw body used for verification
- Check algorithm (Polar: SHA256, Binance: SHA512)

---

### Issue 2: Database Insert Fails

**Symptoms**:
- Webhook returns 500
- Error: "RLS policy violation" or "foreign key constraint"

**Debug**:
```sql
-- Check if user exists
SELECT id FROM auth.users WHERE id = 'user-123';

-- Test insert manually
INSERT INTO payment_transactions (user_id, gateway, gateway_transaction_id, amount, currency, status)
VALUES ('user-123', 'polar', 'test-123', 49.00, 'USD', 'completed');
```

**Common causes**:
- User ID doesn't exist in `auth.users`
- RLS policy blocking service role
- Wrong column types

**Fix**:
- Use `SUPABASE_SERVICE_ROLE_KEY` for webhooks
- Ensure user exists before creating transaction
- Check column types match schema

---

### Issue 3: TypeScript Errors

**Symptoms**:
- `tsc` fails to compile
- Missing type definitions

**Debug**:
```bash
npx tsc --noEmit --listFiles | grep polar
```

**Common causes**:
- Missing `@types/node` for crypto module
- Polar SDK not properly typed
- Wrong import paths

**Fix**:
```bash
npm install -D @types/node
```

Add ambient types if needed:
```typescript
// src/types/polar.d.ts
declare module '@polar-sh/sdk' {
  export class Polar {
    constructor(config: { accessToken: string });
    checkouts: {
      custom: {
        create(params: any): Promise<any>;
        get(params: any): Promise<any>;
      };
    };
  }
}
```

---

### Issue 4: Checkout Redirect Fails

**Symptoms**:
- Button click does nothing
- Console shows network error

**Debug**:
```typescript
// Add try-catch in CheckoutModal
try {
  const response = await fetch('/api/checkout', {...});
  console.log('Response:', response);
  console.log('Data:', await response.json());
} catch (error) {
  console.error('Fetch error:', error);
}
```

**Common causes**:
- API endpoint not running
- CORS issues (unlikely on same domain)
- Missing auth header

**Fix**:
- Verify dev server running
- Check Network tab in DevTools
- Add proper auth header

---

## ✅ Phase 4: Final Verification

### Pre-Production Checklist

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No lint errors: `npm run lint`
- [ ] No secrets in code: `grep -r "polar_sk_" src/`
- [ ] Database migration tested on staging
- [ ] Webhooks verified with Polar/Binance test mode
- [ ] Frontend components render correctly
- [ ] Error handling tested (invalid signatures, missing data)
- [ ] Logging implemented for debugging

### Performance Checks

- [ ] Webhook response time <500ms
- [ ] No N+1 queries in database operations
- [ ] Proper indexes on `user_id`, `gateway`, `status`
- [ ] API rate limiting configured

### Security Final Check

- [ ] RLS policies active on all tables
- [ ] Webhook signatures always validated
- [ ] No sensitive data in logs
- [ ] HTTPS enforced in production
- [ ] Service role key never exposed to client

---

## 📊 Debugging Tools

### Useful Commands

```bash
# Check running processes
lsof -i :3000

# Watch database logs
tail -f /var/log/postgresql/postgresql.log

# Test webhook locally (use ngrok for external access)
ngrok http 3000

# Check env vars loaded
node -e "console.log(process.env.POLAR_ACCESS_TOKEN)"

# Database query performance
EXPLAIN ANALYZE SELECT * FROM payment_transactions WHERE user_id = 'xxx';
```

### Monitoring

Setup alerts for:
- Webhook failures (>1% error rate)
- Database connection errors
- Payment success rate <95%
- Gemini response time >1s on checkout API

---

## 🎯 Success Criteria

Implementation is production-ready when:

- [x] All security checks pass
- [x] Test coverage >80%
- [x] No critical bugs found
- [x] Webhooks handle all event types
- [x] Frontend UX smooth and responsive
- [x] Database schema optimized
- [x] Documentation complete

**Next Step**: Deploy to staging and test with real Polar/Binance test API keys.
