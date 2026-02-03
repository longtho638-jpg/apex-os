import { Polar } from '@polar-sh/sdk';
import { getTierById, PaymentTier } from '@/config/payment-tiers';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  tier: PaymentTier | string;
}

export async function createPolarCheckout({
  userId,
  userEmail,
  tier
}: CreateCheckoutParams) {
  const tierConfig = getTierById(tier);

  if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
  }

  if (!tierConfig.polar) {
    throw new Error(`Tier ${tier} does not support Polar payments`);
  }

  const checkout = await polarClient.checkouts.create({
    product_price_id: tierConfig.polar.productPriceId,
    customer_email: userEmail,
    success_url: `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`,
    metadata: {
      userId,
      tier,
      source: 'apexos'
    }
  } as any);

  return checkout;
}

export async function getPolarCheckout(checkoutId: string) {
  return await polarClient.checkouts.get({ id: checkoutId } as any);
}

export { polarClient };