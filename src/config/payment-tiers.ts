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
    nowPayments: null
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
    nowPayments: {
      price_amount: 49,
      price_currency: 'usd',
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
    nowPayments: {
      price_amount: 99,
      price_currency: 'usd',
      cryptoDiscount: 15 // 15% discount for crypto
    }
  },
  PAY_PER_SIGNAL: {
    name: 'Pay Per Signal',
    price: 0, // No monthly fee
    currency: 'USD',
    pricePerSignal: 5,
    features: [
      'No monthly commitment',
      'Pay only $5 per signal used',
      'Access to all signal types',
      'Cancel anytime',
      'Perfect for casual traders'
    ],
    polar: null,
    nowPayments: null
  }
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;