/**
 * Polar.sh SDK client — card/PayPal checkout for paid tiers.
 * Server-side only (uses process.env for API keys).
 */

import { Polar } from '@polar-sh/sdk';
import { getTierById } from '../config/unified-tiers';
import type { CreateCheckoutParams } from '../types/billing-types';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
});

export async function createPolarCheckout({ userId, userEmail, tier }: CreateCheckoutParams) {
  const tierConfig = getTierById(tier);

  if (!tierConfig) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const polarConfig = tierConfig.polar as { productPriceId: string } | null;
  if (!polarConfig) {
    throw new Error(`Tier ${tier} does not support Polar payments`);
  }

  const checkout = await polarClient.checkouts.create({
    product_price_id: polarConfig.productPriceId,
    customer_email: userEmail,
    success_url: `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`,
    metadata: {
      userId,
      tier,
      source: 'apexos',
    },
  });

  return checkout;
}

export async function getPolarCheckout(checkoutId: string) {
  return await polarClient.checkouts.get({ id: checkoutId });
}

export { polarClient };
