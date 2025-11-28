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
      productPriceId: process.env.POLAR_FOUNDERS_PRICE_ID || 'price_PLACEHOLDER_FOUNDERS',
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
      productPriceId: process.env.POLAR_PREMIUM_PRICE_ID || 'price_PLACEHOLDER_PREMIUM',
    },
    binancePay: {
      amount: 99,
      cryptoDiscount: 15 // 15% discount for crypto
    }
  }
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;
