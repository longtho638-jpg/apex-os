# Payment System Testing Checklist

## 1. Configuration
- [ ] `.env.local` has all keys from `.env.example`
- [ ] `src/config/payment-tiers.ts` has correct Product/Price IDs for Polar
- [ ] NOWPayments API Key and IPN Secret are set

## 2. Polar Integration (Card)
- [ ] **Checkout Creation**: 
    - Go to `/pricing` (or wherever CheckoutModal is used).
    - Select "Card / PayPal".
    - Verify redirect to Polar Checkout URL.
- [ ] **Webhook**:
    - Use localtunnel or ngrok to expose localhost: `lt --port 3000`.
    - Add webhook URL to Polar dashboard: `https://<subdomain>.loca.lt/api/webhooks/polar`.
    - Complete a test purchase.
    - Verify `payment_transactions` table entry.
    - Verify `subscriptions` table entry.

## 3. NOWPayments Integration (Crypto)
- [ ] **Invoice Creation**:
    - Select "Crypto".
    - Verify redirect to NOWPayments Invoice/Payment page.
- [ ] **Webhook (IPN)**:
    - Add webhook URL to NOWPayments dashboard: `https://<subdomain>.loca.lt/api/webhooks/nowpayments`.
    - Simulate a payment (Sandbox mode if available, or small amount).
    - Verify `payment_transactions` table entry.
    - Verify `subscriptions` table entry.
- [ ] **Signature Validation**:
    - Ensure `x-nowpayments-sig` matches calculated HMAC.

## 4. Database
- [ ] Check `payment_gateway` enum includes `polar` and `nowpayments`.
- [ ] Check `payment_transactions` has correct `gateway` and `gateway_transaction_id`.

## 5. UI/UX
- [ ] PaymentMethodSelector toggles correctly.
- [ ] Discount logic for Crypto works (displays correct price).
- [ ] Loading states (button disabled during API call).
