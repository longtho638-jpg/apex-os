/**
 * NOWPayments crypto payment + payout client.
 * Server-side only (uses process.env for API keys).
 */

import type {
  CreateInvoiceParams,
  NOWPaymentsInvoiceResponse,
  CreatePayoutParams,
  PayoutResult,
  PayoutStatus,
} from '../types/billing-types';
import { PAYMENT_TIERS } from '../config/unified-tiers';

// ---- Checkout / Invoices ----

export async function createNOWPaymentsInvoice({
  userId,
  tier,
  amountOverride
}: CreateInvoiceParams): Promise<NOWPaymentsInvoiceResponse> {
  const tierConfig = PAYMENT_TIERS[tier];

  const npConfig = tierConfig.nowPayments as { price_amount: number; price_currency: string; cryptoDiscount?: number } | null;
  if (!npConfig) {
    throw new Error(`Tier ${tier} does not support NOWPayments`);
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('NOWPAYMENTS_API_KEY is not configured');
  }

  let discountedPrice: number;

  if (amountOverride !== undefined) {
    discountedPrice = amountOverride;
  } else {
    const originalPrice = npConfig.price_amount;
    const discountPercent = npConfig.cryptoDiscount || 0;
    discountedPrice = originalPrice * (1 - discountPercent / 100);
  }

  const body = {
    price_amount: discountedPrice,
    price_currency: npConfig.price_currency,
    order_id: `${tier}_${userId}_${Date.now()}`,
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

async function createPayout(params: CreatePayoutParams): Promise<PayoutResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
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
          ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments-payout`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `API Error: ${err}` };
    }

    const data = await response.json();
    return { success: true, payout_id: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getPayoutStatus(payoutId: string): Promise<PayoutStatus> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('NOWPAYMENTS_API_KEY is required for payout status check');
  }

  const response = await fetch(`https://api.nowpayments.io/v1/payout/${payoutId}`, {
    headers: { 'x-api-key': apiKey }
  });

  const data = await response.json();
  return {
    status: data.status,
    tx_hash: data.hash,
    fee: data.fee
  };
}

export const nowPayments = {
  createPayout,
  getPayoutStatus
};
