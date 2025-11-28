export const PRICING_VARIANTS = {
  control: {
    id: 'control',
    monthly: 67,
    annual: 670,
    name: 'Pro',
    features: [
      'Unlimited AI signals',
      'Real-time alerts',
      'Portfolio tracking',
      'Premium support',
    ],
  },
  variant_a: {
    id: 'variant_a',
    monthly: 49,
    annual: 490,
    name: 'Pro',
    features: [
      'Unlimited AI signals',
      'Real-time alerts',
      'Portfolio tracking',
      'Email support',
    ],
  },
  variant_b: {
    id: 'variant_b',
    monthly: 99,
    annual: 990,
    name: 'Premium',
    features: [
      'Unlimited AI signals',
      'Real-time alerts',
      'Portfolio tracking',
      'Priority support',
      'Advanced analytics',
      'API access',
    ],
  },
} as const;

export type PricingVariant = keyof typeof PRICING_VARIANTS;
