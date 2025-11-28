import { Polar } from '@polar-sh/sdk';
import { PAYMENT_TIERS, PaymentTier } from '@/config/payment-tiers';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || 'polar_sk_placeholder',
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
});

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  tier: PaymentTier;
}

/**
 * Creates a Polar.sh checkout session for a subscription
 * @param params - Checkout parameters including userId and tier
 * @returns Checkout session object
 * @throws {Error} If tier does not support Polar payments
 * @throws {Error} If Polar API request fails
 */
export async function createPolarCheckout({
  userId,
  userEmail,
  tier
}: CreateCheckoutParams) {
  const tierConfig = PAYMENT_TIERS[tier];
  
  if (!tierConfig.polar) {
    throw new Error(`Tier ${tier} does not support Polar payments`);
  }

  const successUrl = process.env.PAYMENT_SUCCESS_URL 
    ? `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`
    : `http://localhost:3000/dashboard?payment=success&tier=${tier}`;

  const checkout = await (polarClient.checkouts as any).custom.create({
    productPriceId: tierConfig.polar.productPriceId,
    customerEmail: userEmail,
    successUrl,
    metadata: {
      userId,
      tier,
      source: 'apexos'
    }
  });

  return checkout;
}

/**
 * Retrieves a Polar.sh checkout session by ID
 * @param checkoutId - The ID of the checkout session
 * @returns Checkout session object
 * @throws {Error} If Polar API request fails
 */
export async function getPolarCheckout(checkoutId: string) {
  return await (polarClient.checkouts as any).custom.get({ id: checkoutId });
}

export { polarClient };
