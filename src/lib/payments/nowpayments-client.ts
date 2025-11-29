import { PAYMENT_TIERS, PaymentTier } from '@/config/payment-tiers';

interface CreateInvoiceParams {
  userId: string;
  tier: PaymentTier;
  amountOverride?: number;
}

interface NOWPaymentsInvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  pay_currency: string | null;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
}

// ---- Checkout / Invoices ----

export async function createNOWPaymentsInvoice({
  userId,
  tier,
  amountOverride
}: CreateInvoiceParams): Promise<NOWPaymentsInvoiceResponse> {
  const tierConfig = PAYMENT_TIERS[tier];

  if (!tierConfig.nowPayments) {
    throw new Error(`Tier ${tier} does not support NOWPayments`);
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('NOWPAYMENTS_API_KEY is not configured');
  }

  // Apply discount or use override
  let discountedPrice: number;

  if (amountOverride !== undefined) {
    discountedPrice = amountOverride;
  } else {
    const originalPrice = tierConfig.nowPayments.price_amount;
    const discountPercent = tierConfig.nowPayments.cryptoDiscount || 0;
    discountedPrice = originalPrice * (1 - discountPercent / 100);
  }

  const body = {
    price_amount: discountedPrice,
    price_currency: tierConfig.nowPayments.price_currency,
    order_id: `${tier}_${userId}_${Date.now()}`, // Unique order ID
    order_description: `Subscription to ${tierConfig.name} (User: ${userId})`,
    ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
    success_url: `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`,
    cancel_url: process.env.PAYMENT_CANCEL_URL
  };

  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NOWPayments API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// ---- Payouts (For Withdrawals) ----

interface CreatePayoutParams {
  address: string;
  amount: number;
  currency: string;
  withdrawal_id: string;
}

interface PayoutResult {
  success: boolean;
  payout_id?: string;
  error?: string;
}

interface PayoutStatus {
  status: string;
  tx_hash?: string;
  fee?: number;
}

async function createPayout(params: CreatePayoutParams): Promise<PayoutResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) return { success: false, error: 'Missing API Key' };

  // PRODUCTION SAFETY: Always require API key - fail fast if missing
  // No mock mode to prevent accidental exposure in production
  if (!apiKey) {
    throw new Error(
      'NOWPAYMENTS_API_KEY is required for payout operations. ' +
      'Set this environment variable in production.'
    );
  }

  try {
    const response = await fetch('https://api.nowpayments.io/v1/payout', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        withdrawals: [{
          address: params.address,
          currency: params.currency,
          amount: params.amount,
          ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments-payout` // Different webhook?
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `API Error: ${err}` };
    }

    const data = await response.json();
    // NOWPayments returns an id for the batch, or list of withdrawals
    return { success: true, payout_id: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getPayoutStatus(payoutId: string): Promise<PayoutStatus> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error('Missing API Key');

  // No mock mode - all payouts must be real
  // Fail fast if API key missing
  if (!apiKey) {
    throw new Error('NOWPAYMENTS_API_KEY is required for payout status check');
  }

  const response = await fetch(`https://api.nowpayments.io/v1/payout/${payoutId}`, {
    headers: { 'x-api-key': apiKey }
  });

  const data = await response.json();
  // Transform data to match interface
  return {
    status: data.status,
    tx_hash: data.hash, // check actual field name
    fee: data.fee
  };
}

export const nowPayments = {
  createPayout,
  getPayoutStatus
};
