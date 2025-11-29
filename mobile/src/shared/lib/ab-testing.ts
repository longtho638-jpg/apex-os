// A/B Testing temporarily disabled during pricing migration
// Will be re-enabled with unified tiers

export type PricingVariant = 'control' | 'variant_a' | 'variant_b';

// Always return control until unified pricing is ready
export function getPricingVariant(userId?: string): PricingVariant {
  return 'control';
}

export function getPricingForVariant(variant: PricingVariant) {
  // Return default Pro tier pricing
  return {
    id: 'control',
    monthly: 29,
    annual: 290,
    name: 'Pro',
    features: [
      'Unlimited AI signals',
      'Real-time alerts',
      'Portfolio tracking',
      'Premium support',
    ],
  };
}
