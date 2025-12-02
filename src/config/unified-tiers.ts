/**
 * UNIFIED PRICING TIERS - SINGLE SOURCE OF TRUTH
 * 
 * STRATEGY: VIRAL 4-LEVEL "GOLDEN HANDCUFFS"
 * 
 * Logic:
 * - Base tiers (FREE) get a taste of L1 commission to incentivize sharing.
 * - Middle tiers (PRO, TRADER) unlock deeper levels (L2, L3).
 * - Top tiers (ELITE, WHALE) unlock full depth (L4) and maximum Self-Rebate.
 * 
 * This structure creates a "Lock-in" effect where leaders MUST maintain 
 * their subscription to keep earning from their deep downline.
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

        // FINANCIAL ENGINE (The Hook)
        selfRebateRate: 0.05, // 5% of Apex share returned to user
        commissionRates: {
            l1: 0.10,    // 10% direct referrals (Teaser)
            l2: 0,       // Locked
            l3: 0,       // Locked
            l4: 0,       // Locked
            total: 0.15, // Total Payout
        },

        // Features
        features: [
            'Basic trading features',
            '10 AI requests per day',
            '3 trading signals per month',
            'Earn 10% commission on referrals',
            '5% Self-Rebate on trades',
        ],

        polar: null,
        nowPayments: null,
    },

    PRO: {
        id: 'PRO',
        name: 'Pro',
        price: 29,
        monthlyPrice: 29,
        annualPrice: 290,
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: 100,
        tradingSignalsPerMonth: Infinity,

        // FINANCIAL ENGINE (The Builder)
        selfRebateRate: 0.10, // 10% Self-Rebate
        commissionRates: {
            l1: 0.20,   // 20% direct (Double the Free tier)
            l2: 0.05,   // Unlocks Level 2
            l3: 0,      // Locked
            l4: 0,      // Locked
            total: 0.35
        },

        features: [
            '🚀 100 AI requests per day',
            '✨ Unlimited trading signals',
            '🔓 Unlocks Level 2 Commissions',
            '💰 10% Self-Rebate',
            '📊 Advanced technical analysis',
            '🔔 Real-time price alerts',
            '📱 Mobile app access',
        ],

        highlight: 'Starter',

        polar: {
            productPriceId: process.env.POLAR_PRO_PRICE_ID || 'price_pro_monthly',
        },
        nowPayments: {
            price_amount: 29,
            price_currency: 'usd',
            cryptoDiscount: 10,
        },
    },

    TRADER: {
        id: 'TRADER',
        name: 'Trader',
        price: 97,
        monthlyPrice: 97,
        annualPrice: 970,
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: 500,
        tradingSignalsPerMonth: Infinity,

        // FINANCIAL ENGINE (The Sweet Spot)
        selfRebateRate: 0.20, // 20% Self-Rebate
        commissionRates: {
            l1: 0.25,   // 25% Direct
            l2: 0.10,   // 10% L2
            l3: 0.05,   // Unlocks Level 3
            l4: 0,      // Locked
            total: 0.60
        },

        features: [
            '⚡ 500 AI requests per day',
            '🔓 Unlocks Level 3 Commissions',
            '💰 20% Self-Rebate (Double Pro)',
            '🧠 DeepQuant Neural Core',
            '🤖 AI-powered auto-trading',
            '🔥 Copy trading from top traders',
            '💎 Exclusive trading strategies',
            '⏰ Instant support (1h response)',
        ],

        highlight: 'Best Value',

        polar: {
            productPriceId: process.env.POLAR_TRADER_PRICE_ID || 'price_trader_monthly',
        },
        nowPayments: {
            price_amount: 97,
            price_currency: 'usd',
            cryptoDiscount: 15,
        },
    },

    ELITE: {
        id: 'ELITE',
        name: 'Elite',
        price: 297,
        monthlyPrice: 297,
        annualPrice: 2970,
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: Infinity,
        tradingSignalsPerMonth: Infinity,

        // FINANCIAL ENGINE (The Leader)
        selfRebateRate: 0.30, // 30% Self-Rebate
        commissionRates: {
            l1: 0.30,   // 30% Direct
            l2: 0.15,   // 15% L2
            l3: 0.10,   // 10% L3
            l4: 0.05,   // Unlocks Level 4 (Full Depth)
            total: 0.90 // High payout to attract leaders
        },

        features: [
            '♾️ Unlimited AI requests',
            '👑 Unlocks Full Level 4 Commissions',
            '💰 30% Self-Rebate',
            '🧠 Real-time DeepQuant Signals',
            '🏆 Dedicated account manager',
            '🔐 Private trading signals',
            '🎯 Custom AI models',
            '🌟 VIP community access',
        ],

        highlight: 'For Leaders',

        polar: {
            productPriceId: process.env.POLAR_ELITE_PRICE_ID || 'price_elite_monthly',
        },
        nowPayments: {
            price_amount: 297,
            price_currency: 'usd',
            cryptoDiscount: 20,
        },
    },

    WHALE: {
        id: 'WHALE',
        name: 'Whale',
        price: 997,
        monthlyPrice: 997,
        annualPrice: 9997,
        currency: 'USD',

        // AI Limits
        aiRequestsPerDay: Infinity,
        tradingSignalsPerMonth: Infinity,

        // FINANCIAL ENGINE (God Mode)
        selfRebateRate: 0.35, // 35% Self-Rebate
        commissionRates: {
            l1: 0.35,   // 35% Direct
            l2: 0.20,   // 20% L2
            l3: 0.15,   // 15% L3
            l4: 0.10,   // 10% L4
            total: 1.15 // Burn Strategy: We pay out > 100% of our share to grow fast
        },

        features: [
            '👑 GOD MODE ACCESS',
            '💰 Max Comms & Rebates',
            '🏛️ Governance Voting Power (10x)',
            '🤝 Direct Access to Core Team',
            '💼 White Label Solutions',
            '🌐 Global Partner Status',
            '🔑 API Limit Bypass',
        ],

        highlight: 'Legendary',

        polar: null,
        nowPayments: null,
    },

    PAY_PER_SIGNAL: {
        id: 'PAY_PER_SIGNAL',
        name: 'Pay Per Signal',
        price: 0,
        monthlyPrice: 0,
        annualPrice: 0,
        currency: 'USD',
        pricePerSignal: 5,

        aiRequestsPerDay: 10,
        tradingSignalsPerMonth: Infinity,

        selfRebateRate: 0,
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
    FOUNDERS: UNIFIED_TIERS.WHALE,
    PREMIUM: UNIFIED_TIERS.TRADER,
    PAY_PER_SIGNAL: UNIFIED_TIERS.PAY_PER_SIGNAL
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

export function getSelfRebateRate(tierId: TierId): number {
    return UNIFIED_TIERS[tierId].selfRebateRate || 0;
}

export function getAILimit(tierId: TierId): number {
    return UNIFIED_TIERS[tierId].aiRequestsPerDay;
}

export const TIER_ORDER: TierId[] = ['FREE', 'PRO', 'TRADER', 'ELITE', 'WHALE'];

export function canUpgrade(currentTier: TierId, targetTier: TierId): boolean {
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const targetIndex = TIER_ORDER.indexOf(targetTier);
    return targetIndex > currentIndex;
}