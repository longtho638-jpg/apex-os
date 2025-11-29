/**
 * UNIFIED PRICING TIERS - SINGLE SOURCE OF TRUTH
 * 
 * This config consolidates:
 * - PricingModal tiers (FREE, PRO, TRADER, ELITE)
 * - Viral Economics commission structure (L1-L4)
 * - Payment gateway configs (Polar, NOWPayments)
 * - AI rate limits
 */

export const UNIFIED_TIERS = {
    FREE: {
        id: 'FREE',
        name: 'Free',
        price: 0,
        monthlyPrice: 0,
        annualPrice: 0,
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: 10,
        tradingSignalsPerMonth: 3,

        // Commission Rates (Viral Economics L1-L4)
        commissionRates: {
            l1: 0,    // 0% direct referrals
            l2: 0,    // 0% second level
            l3: 0,    // 0% third level
            l4: 0,    // 0% fourth level
            total: 0, // 0% total - FREE users don't earn commissions
        },

        // Features
        features: [
            'Basic trading features',
            '10 AI requests per day',
            '3 trading signals per month',
            'Basic technical analysis',
            'Community support (3-5 days)',
        ],

        // Payment Gateway Configs
        polar: null,
        nowPayments: null,

        // Binh Pháp: 試探 (Probe) - Free tier để user thử nghiệm
    },

    PRO: {
        id: 'PRO',
        name: 'Pro',
        price: 29,
        monthlyPrice: 29,
        annualPrice: 290, // ~17% discount (10 months price)
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: 100,
        tradingSignalsPerMonth: Infinity, // Unlimited

        // Commission Rates (Viral Economics L1-L4)
        commissionRates: {
            l1: 0.20,   // 20% direct referrals
            l2: 0.10,   // 10% second level
            l3: 0.05,   // 5% third level
            l4: 0,      // 0% fourth level
            total: 0.35 // 35% total commission potential
        },

        // Features
        features: [
            '🚀 100 AI requests per day',
            '✨ Unlimited trading signals',
            '📊 Advanced technical analysis',
            '🔔 Real-time price alerts',
            '📈 Portfolio tracking',
            '💬 Priority support (24h response)',
            '🎯 AI-powered trade recommendations',
            '📱 Mobile app access',
        ],

        highlight: 'Most Popular',

        // Payment Gateway Configs
        polar: {
            productPriceId: process.env.POLAR_PRO_PRICE_ID || 'price_pro_monthly',
        },
        nowPayments: {
            price_amount: 29,
            price_currency: 'usd',
            cryptoDiscount: 10, // 10% discount for crypto
        },

        // Binh Pháp: 集中兵力 (Concentrate Forces) - Focus tier for most users
    },

    TRADER: {
        id: 'TRADER',
        name: 'Trader',
        price: 97,
        monthlyPrice: 97,
        annualPrice: 970, // ~17% discount
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: 500,
        tradingSignalsPerMonth: Infinity, // Unlimited

        // Commission Rates (Viral Economics L1-L4)
        commissionRates: {
            l1: 0.25,   // 25% direct referrals
            l2: 0.15,   // 15% second level
            l3: 0.10,   // 10% third level
            l4: 0.05,   // 5% fourth level
            total: 0.55 // 55% total commission potential
        },

        // Features
        features: [
            '⚡ 500 AI requests per day',
            '✨ Everything in Pro',
            '🧠 DeepSeek Quant Analysis (Daily)',
            '🤖 AI-powered auto-trading',
            '📊 Advanced portfolio analytics',
            '🔥 Copy trading from top traders',
            '💎 Exclusive trading strategies',
            '🎓 1-on-1 trading coaching',
            '⏰ Instant support (1h response)',
        ],

        highlight: 'Best Value',

        // Payment Gateway Configs
        polar: {
            productPriceId: process.env.POLAR_TRADER_PRICE_ID || 'price_trader_monthly',
        },
        nowPayments: {
            price_amount: 97,
            price_currency: 'usd',
            cryptoDiscount: 15, // 15% discount for crypto
        },

        // Binh Pháp: 以戰養戰 (War Feeds War) - Commission starts earning significantly
    },

    ELITE: {
        id: 'ELITE',
        name: 'Elite',
        price: 297,
        monthlyPrice: 297,
        annualPrice: 2970, // ~17% discount
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: Infinity, // Unlimited
        tradingSignalsPerMonth: Infinity, // Unlimited

        // Commission Rates (Viral Economics L1-L4)
        commissionRates: {
            l1: 0.30,   // 30% direct referrals
            l2: 0.20,   // 20% second level
            l3: 0.15,   // 15% third level
            l4: 0.10,   // 10% fourth level (maximum depth)
            total: 0.75 // 75% total commission potential (capped by 90% pool)
        },

        // Features
        features: [
            '♾️ Unlimited AI requests',
            '✨ Everything in Trader',
            '🧠 Real-time DeepSeek Signals',
            '🏆 Dedicated account manager',
            '🔐 Private trading signals',
            '💰 Revenue share on referrals (30%)',
            '🎯 Custom AI models trained on your data',
            '📞 Direct phone support',
            '🌟 VIP community access',
        ],

        highlight: 'Premium',

        // Payment Gateway Configs
        polar: {
            productPriceId: process.env.POLAR_ELITE_PRICE_ID || 'price_elite_monthly',
        },
        nowPayments: {
            price_amount: 297,
            price_currency: 'usd',
            cryptoDiscount: 20, // 20% discount for crypto
        },

        // Binh Pháp: 致人而不致於人 (Control Without Being Controlled) - Maximum leverage
    },

    PAY_PER_SIGNAL: {
        id: 'PAY_PER_SIGNAL',
        name: 'Pay Per Signal',
        price: 0,
        monthlyPrice: 0,
        annualPrice: 0,
        currency: 'USD',
        pricePerSignal: 5,

        // AI Limits
        aiRequestsPerDay: 10,
        tradingSignalsPerMonth: Infinity, // Unlimited access, pay per use

        // Commission Rates
        commissionRates: {
            l1: 0, l2: 0, l3: 0, l4: 0, total: 0
        },

        features: [
            'No monthly commitment',
            'Pay only $5 per signal used',
            'Access to all signal types',
            'Cancel anytime',
            'Perfect for casual traders'
        ],

        highlight: 'Flexible',
        polar: null,
        nowPayments: null,
    },
} as const;

// Type exports
export type TierId = keyof typeof UNIFIED_TIERS;
export type UnifiedTier = typeof UNIFIED_TIERS[TierId];

// Backward compatibility aliases
export const PAYMENT_TIERS = {
    FREE: UNIFIED_TIERS.FREE,
    FOUNDERS: UNIFIED_TIERS.PRO,    // Map old FOUNDERS → PRO
    PREMIUM: UNIFIED_TIERS.TRADER,  // Map old PREMIUM → TRADER
    PAY_PER_SIGNAL: {
        // Keep pay-per-signal for legacy support
        id: 'PAY_PER_SIGNAL',
        name: 'Pay Per Signal',
        price: 0,
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
        nowPayments: null,
    },
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;

// Helper functions
export function getTierById(tierId: string): UnifiedTier | null {
    const normalized = tierId.toUpperCase() as TierId;
    return UNIFIED_TIERS[normalized] || null;
}

export function getTierPrice(tierId: TierId, billingPeriod: 'monthly' | 'annual' = 'monthly'): number {
    const tier = UNIFIED_TIERS[tierId];
    return billingPeriod === 'annual' ? tier.annualPrice : tier.monthlyPrice;
}

export function getCommissionRate(tierId: TierId, level: 1 | 2 | 3 | 4): number {
    const tier = UNIFIED_TIERS[tierId];
    const key = `l${level}` as keyof typeof tier.commissionRates;
    return tier.commissionRates[key];
}

export function getAILimit(tierId: TierId): number {
    return UNIFIED_TIERS[tierId].aiRequestsPerDay;
}

// Tier order for upgrades
export const TIER_ORDER: TierId[] = ['FREE', 'PRO', 'TRADER', 'ELITE'];

export function canUpgrade(currentTier: TierId, targetTier: TierId): boolean {
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const targetIndex = TIER_ORDER.indexOf(targetTier);
    return targetIndex > currentIndex;
}
