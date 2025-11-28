# Implementation Plan - Polar.sh + Binance Pay Integration

**Version**: 1.0.0  
**Date**: 2025-11-26  
**Assignee**: Gemini CLI 3.0 Pro  
**Reviewer**: Claude (Debug & QA)

---

## Goal Description

Implement dual payment gateway system for ApexOS using:
- **Polar.sh** as primary Merchant of Record (fiat payments)
- **Binance Pay** as secondary gateway (crypto payments)

This provides comprehensive payment options while maintaining fintech-grade compliance and minimizing transaction fees.

---

## User Review Required

> [!IMPORTANT]
> **Breaking Changes**: 
> - New payment flow will replace any existing payment system
> - Database schema changes required for transaction tracking
> - Environment variables needed for both Polar and Binance Pay APIs

> [!WARNING]
> **Security Considerations**:
> - Binance Pay API keys must be stored securely (use `.env.local`, never commit)
> - Webhook endpoints must validate signatures
> - PCI DSS compliance required for Polar integration

---

## Proposed Changes

### Phase 1: Foundation Setup (Day 1-2)

#### 1.1 Environment Configuration

##### [NEW] `.env.local` (DO NOT COMMIT)
Add payment gateway credentials:
```bash
# Polar.sh Configuration
POLAR_ACCESS_TOKEN=polar_sk_xxxxx
POLAR_ORGANIZATION_ID=org_xxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxx

# Binance Pay Configuration
BINANCE_PAY_API_KEY=xxxxx
BINANCE_PAY_SECRET_KEY=xxxxx
BINANCE_PAY_WEBHOOK_SECRET=xxxxx

# Payment URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=${NEXT_PUBLIC_APP_URL}/dashboard?payment=success
PAYMENT_CANCEL_URL=${NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled
```

##### [MODIFY] `.env.example`
Add template for payment env vars (without actual values).

---

#### 1.2 Package Installation

##### Install Dependencies
```bash
npm install @polar-sh/sdk zod
npm install -D @types/node
```

**Packages**:
- `@polar-sh/sdk`: Official Polar.sh SDK
- `zod`: Schema validation for webhooks
- `@types/node`: TypeScript types for crypto module

---

### Phase 2: Database Schema (Day 2)

#### 2.1 Supabase Migrations

##### [NEW] `supabase/migrations/20251126_payment_system.sql`

```sql
-- Payment Gateways Enum
CREATE TYPE payment_gateway AS ENUM ('polar', 'binance_pay');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- Payment Transactions Table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Gateway Info
  gateway payment_gateway NOT NULL,
  gateway_transaction_id TEXT NOT NULL, -- Polar checkout ID or Binance order ID
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Product Info
  product_id TEXT, -- Polar product ID or tier name
  product_name TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT unique_gateway_transaction UNIQUE(gateway, gateway_transaction_id)
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Info
  tier TEXT NOT NULL, -- 'FREE', 'FOUNDERS', 'PREMIUM'
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Gateway Info
  gateway payment_gateway,
  gateway_subscription_id TEXT, -- Polar subscription ID or Binance recurring order ID
  
  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  
  CONSTRAINT unique_user_active_subscription UNIQUE(user_id, status) WHERE status = 'active'
);

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all (future enhancement)
-- CREATE POLICY "Admins can view all transactions"
--   ON payment_transactions FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Indexes
CREATE INDEX idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_transactions_gateway ON payment_transactions(gateway);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_transactions_updated_at 
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Phase 3: Payment Configuration (Day 3)

#### 3.1 Payment Tiers Configuration

##### [NEW] `src/config/payment-tiers.ts`

```typescript
export const PAYMENT_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      'Basic trading features',
      '5 positions max',
      'Community support'
    ],
    polar: null,
    binancePay: null
  },
  FOUNDERS: {
    name: 'Founders',
    price: 49,
    currency: 'USD',
    features: [
      'All Free features',
      'Unlimited positions',
      'Priority support',
      'Advanced analytics'
    ],
    polar: {
      productPriceId: 'price_xxxxx', // Replace with actual Polar price ID
    },
    binancePay: {
      amount: 49,
      cryptoDiscount: 10 // 10% discount for crypto
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: 99,
    currency: 'USD',
    features: [
      'All Founders features',
      'AI trading signals',
      'Multi-exchange support',
      'API access',
      'White-glove support'
    ],
    polar: {
      productPriceId: 'price_yyyyy', // Replace with actual Polar price ID
    },
    binancePay: {
      amount: 99,
      cryptoDiscount: 15 // 15% discount for crypto
    }
  }
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;
```

---

### Phase 4: Polar Integration (Day 3-4)

#### 4.1 Polar Client Setup

##### [NEW] `src/lib/payments/polar-client.ts`

```typescript
import { Polar } from '@polar-sh/sdk';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  tier: PaymentTier;
}

export async function createPolarCheckout({
  userId,
  userEmail,
  tier
}: CreateCheckoutParams) {
  const tierConfig = PAYMENT_TIERS[tier];
  
  if (!tierConfig.polar) {
    throw new Error(`Tier ${tier} does not support Polar payments`);
  }

  const checkout = await polarClient.checkouts.custom.create({
    product_price_id: tierConfig.polar.productPriceId,
    customer_email: userEmail,
    success_url: `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`,
    metadata: {
      userId,
      tier,
      source: 'apexos'
    }
  });

  return checkout;
}

export async function getPolarCheckout(checkoutId: string) {
  return await polarClient.checkouts.custom.get({ id: checkoutId });
}

export { polarClient };
```

---

#### 4.2 Polar Webhook Handler

##### [NEW] `src/app/api/webhooks/polar/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyPolarWebhook(payload: string, signature: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-polar-signature');

    if (!signature || !verifyPolarWebhook(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    switch (event.type) {
      case 'checkout.created':
        await handleCheckoutCreated(event.data);
        break;
      
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Polar webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(data: any) {
  const { id, customer_email, metadata, amount, currency } = data;
  
  // Create transaction record
  await supabase.from('payment_transactions').insert({
    user_id: metadata.userId,
    gateway: 'polar',
    gateway_transaction_id: id,
    amount: amount / 100, // Convert cents to dollars
    currency,
    status: 'completed',
    product_name: `${metadata.tier} Plan`,
    metadata: { checkout_data: data },
    completed_at: new Date().toISOString()
  });

  // Update user subscription
  await supabase.from('subscriptions').upsert({
    user_id: metadata.userId,
    tier: metadata.tier,
    status: 'active',
    gateway: 'polar',
    gateway_subscription_id: id,
    current_period_start: new Date().toISOString(),
    current_period_end: getNextBillingDate()
  });
}

function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

// Implement other handlers...
async function handleCheckoutCreated(data: any) { /* ... */ }
async function handleSubscriptionCreated(data: any) { /* ... */ }
async function handleSubscriptionUpdated(data: any) { /* ... */ }
```

---

### Phase 5: Binance Pay Integration (Day 4-5)

#### 5.1 Binance Pay Client

##### [NEW] `src/lib/payments/binance-pay-client.ts`

```typescript
import crypto from 'crypto';

interface BinancePayOrderParams {
  userId: string;
  userEmail: string;
  tier: PaymentTier;
}

export async function createBinancePayOrder({
  userId,
  userEmail,
  tier
}: BinancePayOrderParams) {
  const tierConfig = PAYMENT_TIERS[tier];
  
  if (!tierConfig.binancePay) {
    throw new Error(`Tier ${tier} does not support Binance Pay`);
  }

  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Apply crypto discount
  const discountedAmount = tierConfig.binancePay.amount * 
    (1 - tierConfig.binancePay.cryptoDiscount / 100);
  
  const body = {
    env: {
      terminalType: 'WEB'
    },
    merchantTradeNo: `APEX-${userId}-${timestamp}`,
    orderAmount: discountedAmount.toFixed(2),
    currency: 'USDT',
    goods: {
      goodsType: '02', // Virtual goods
      goodsCategory: 'Z000', // Software/Digital content
      referenceGoodsId: tier,
      goodsName: `ApexOS ${tier} Plan`,
      goodsDetail: `Monthly subscription to ApexOS ${tier} tier`
    },
    buyer: {
      buyerEmail: userEmail
    },
    returnUrl: process.env.PAYMENT_SUCCESS_URL + `&tier=${tier}`,
    cancelUrl: process.env.PAYMENT_CANCEL_URL
  };

  const signature = generateBinanceSignature(
    JSON.stringify(body),
    timestamp,
    nonce
  );

  const response = await fetch(
    'https://bpay.binanceapi.com/binancepay/openapi/v2/order',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': process.env.BINANCE_PAY_API_KEY!,
        'BinancePay-Signature': signature
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    throw new Error(`Binance Pay API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.status !== 'SUCCESS') {
    throw new Error(`Binance Pay order creation failed: ${result.errorMessage}`);
  }

  return {
    checkoutUrl: result.data.checkoutUrl,
    prepayId: result.data.prepayId,
    orderId: body.merchantTradeNo
  };
}

function generateBinanceSignature(
  body: string,
  timestamp: number,
  nonce: string
): string {
  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  const secret = process.env.BINANCE_PAY_SECRET_KEY!;
  
  return crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex')
    .toUpperCase();
}

export async function queryBinancePayOrder(prepayId: string) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const body = { prepayId };
  const signature = generateBinanceSignature(
    JSON.stringify(body),
    timestamp,
    nonce
  );

  const response = await fetch(
    'https://bpay.binanceapi.com/binancepay/openapi/v2/order/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': process.env.BINANCE_PAY_API_KEY!,
        'BinancePay-Signature': signature
      },
      body: JSON.stringify(body)
    }
  );

  return await response.json();
}
```

---

#### 5.2 Binance Pay Webhook

##### [NEW] `src/app/api/webhooks/binance-pay/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyBinanceWebhook(body: string, signature: string): boolean {
  const secret = process.env.BINANCE_PAY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha512', secret);
  const digest = hmac.update(body).digest('hex').toUpperCase();
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('binancepay-signature');

    if (!signature || !verifyBinanceWebhook(body, signature)) {
      return NextResponse.json(
        { returnCode: 'FAIL', returnMessage: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    if (event.bizType === 'PAY' && event.bizStatus === 'PAY_SUCCESS') {
      await handlePaymentSuccess(event);
    }

    return NextResponse.json({
      returnCode: 'SUCCESS',
      returnMessage: null
    });
  } catch (error) {
    console.error('Binance Pay webhook error:', error);
    return NextResponse.json(
      { returnCode: 'FAIL', returnMessage: 'Internal error' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(event: any) {
  const { merchantTradeNo, totalFee, currency, transactionId } = event.data;
  
  // Extract userId from merchantTradeNo (format: APEX-{userId}-{timestamp})
  const [, userId] = merchantTradeNo.split('-');
  
  // Get tier from order metadata (would need to store this separately)
  const tier = await getTierFromMerchantTradeNo(merchantTradeNo);

  // Create transaction record
  await supabase.from('payment_transactions').insert({
    user_id: userId,
    gateway: 'binance_pay',
    gateway_transaction_id: transactionId,
    amount: parseFloat(totalFee),
    currency,
    status: 'completed',
    product_name: `${tier} Plan`,
    metadata: { webhook_data: event.data },
    completed_at: new Date().toISOString()
  });

  // Update subscription
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    tier,
    status: 'active',
    gateway: 'binance_pay',
    gateway_subscription_id: merchantTradeNo,
    current_period_start: new Date().toISOString(),
    current_period_end: getNextBillingDate()
  });
}

async function getTierFromMerchantTradeNo(tradeNo: string): Promise<string> {
  // Implementation: query pending orders or use Redis cache
  return 'FOUNDERS'; // Placeholder
}

function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}
```

---

### Phase 6: API Routes (Day 5)

#### 6.1 Checkout API

##### [NEW] `src/app/api/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createPolarCheckout } from '@/lib/payments/polar-client';
import { createBinancePayOrder } from '@/lib/payments/binance-pay-client';
import { z } from 'zod';

const checkoutSchema = z.object({
  tier: z.enum(['FOUNDERS', 'PREMIUM']),
  gateway: z.enum(['polar', 'binance_pay']),
  userEmail: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, gateway, userEmail } = checkoutSchema.parse(body);
    
    // Get userId from session (implement proper auth)
    const userId = request.headers.get('x-user-id'); // Placeholder
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (gateway === 'polar') {
      const checkout = await createPolarCheckout({
        userId,
        userEmail,
        tier
      });
      
      return NextResponse.json({
        checkoutUrl: checkout.url,
        checkoutId: checkout.id
      });
    } else {
      const order = await createBinancePayOrder({
        userId,
        userEmail,
        tier
      });
      
      return NextResponse.json({
        checkoutUrl: order.checkoutUrl,
        orderId: order.orderId,
        prepayId: order.prepayId
      });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
```

---

### Phase 7: Frontend Components (Day 6-7)

#### 7.1 Payment Method Selector

##### [NEW] `src/components/payments/PaymentMethodSelector.tsx`

```typescript
'use client';

import { useState } from 'react';
import { CreditCard, Bitcoin } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'polar' | 'binance_pay';
  onChange: (method: 'polar' | 'binance_pay') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        type="button"
        onClick={() => onChange('polar')}
        className={`
          p-6 rounded-xl border-2 transition-all
          ${value === 'polar' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <CreditCard className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-semibold">Card / PayPal</div>
        <div className="text-sm text-gray-600 mt-1">
          Powered by Polar
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('binance_pay')}
        className={`
          p-6 rounded-xl border-2 transition-all relative
          ${value === 'binance_pay' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Save 15%
        </div>
        <Bitcoin className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-semibold">Crypto</div>
        <div className="text-sm text-gray-600 mt-1">
          BTC, ETH, USDT, BNB
        </div>
      </button>
    </div>
  );
}
```

---

#### 7.2 Checkout Modal

##### [NEW] `src/components/payments/CheckoutModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PAYMENT_TIERS, PaymentTier } from '@/config/payment-tiers';

interface CheckoutModalProps {
  tier: PaymentTier;
  userEmail: string;
  onClose: () => void;
}

export function CheckoutModal({ tier, userEmail, onClose }: CheckoutModalProps) {
  const [gateway, setGateway] = useState<'polar' | 'binance_pay'>('polar');
  const [loading, setLoading] = useState(false);
  
  const tierConfig = PAYMENT_TIERS[tier];
  const price = gateway === 'binance_pay' && tierConfig.binancePay
    ? tierConfig.price * (1 - tierConfig.binancePay.cryptoDiscount / 100)
    : tierConfig.price;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, gateway, userEmail })
      });
      
      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          Subscribe to {tierConfig.name}
        </h2>
        
        <PaymentMethodSelector value={gateway} onChange={setGateway} />
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>Monthly Price</span>
            <span className="font-semibold">${tierConfig.price}</span>
          </div>
          
          {gateway === 'binance_pay' && tierConfig.binancePay && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Crypto Discount ({tierConfig.binancePay.cryptoDiscount}%)</span>
              <span>-${(tierConfig.price - price).toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${price.toFixed(2)}/mo</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ${gateway === 'polar' ? 'with Card' : 'with Crypto'}`}
          </button>
          
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Verification Plan

### Automated Tests

#### Unit Tests
```bash
npm test src/lib/payments/__tests__/
```

**Test Coverage**:
- [ ] Polar client checkout creation
- [ ] Binance Pay signature generation
- [ ] Webhook signature validation
- [ ] Payment tier configuration

#### Integration Tests
```bash
npm test src/__tests__/integration/payment-flow.test.ts
```

**Test Scenarios**:
- [ ] Polar webhook handling (checkout.completed)
- [ ] Binance Pay webhook handling (PAY_SUCCESS)
- [ ] Database transaction creation
- [ ] Subscription status updates

### Manual Verification

#### Polar Integration
- [ ] Create test checkout on Polar dashboard
- [ ] Complete test payment
- [ ] Verify webhook received and processed
- [ ] Check database: transaction + subscription created

#### Binance Pay Integration
- [ ] Create test order (use testnet if available)
- [ ] Complete test crypto payment
- [ ] Verify webhook received
- [ ] Check database: transaction + subscription created

#### Frontend
- [ ] Payment method toggle works
- [ ] Crypto discount displayed correctly
- [ ] Checkout redirects to correct gateway
- [ ] Success/cancel URLs work

---

## Success Metrics

- [ ] **Payment Success Rate**: >95%
- [ ] **Webhook Processing**: <500ms p99
- [ ] **Database Writes**: All transactions logged
- [ ] **Error Rate**: <1%
- [ ] **Transaction Reconciliation**: 100% match

---

## Rollback Plan

If critical issues occur:

1. **Disable payment routes**:
   ```typescript
   // src/app/api/checkout/route.ts
   export async function POST() {
     return NextResponse.json(
       { error: 'Payment system temporarily unavailable' },
       { status: 503 }
     );
   }
   ```

2. **Revert database migrations**:
   ```bash
   psql $DATABASE_URL < supabase/migrations/rollback_payment_system.sql
   ```

3. **Remove environment variables**
4. **Deploy previous version**

---

## Post-Implementation Tasks

- [ ] Setup monitoring (Sentry for errors, Datadog for metrics)
- [ ] Create admin dashboard for transaction review
- [ ] Implement refund flow
- [ ] Add email notifications for successful payments
- [ ] Setup reconciliation cron job
- [ ] Document API for customer support
