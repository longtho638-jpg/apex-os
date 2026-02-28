/**
 * UNIFIED TIERS — RaaS AGI MODEL (Revenue-as-a-Service)
 *
 * PARADIGM SHIFT: Zero subscription fees. Revenue from exchange spread.
 *
 * How it works:
 * 1. Users trade for FREE — no monthly/annual subscription
 * 2. Apex earns from exchange spread (0.05% - 0.3% per trade)
 * 3. Users earn rebates on THEIR OWN spread (self-rebate)
 * 4. Referral commissions paid from Apex's spread share
 * 5. Higher volume = higher tier (auto-upgrade via agentic system)
 *
 * Tier progression is VOLUME-BASED, not payment-based:
 * - EXPLORER: 0 - $10K monthly volume
 * - OPERATOR: $10K - $100K monthly volume
 * - ARCHITECT: $100K - $1M monthly volume
 * - SOVEREIGN: $1M+ monthly volume
 */

export const RAAS_CONFIG = {
  /** Base exchange spread Apex charges on every trade */
  baseSpreadBps: 30, // 0.30% (30 basis points)
  /** Minimum spread (floor) */
  minSpreadBps: 5, // 0.05%
  /** Crypto payment gate supported chains */
  cryptoGate: {
    chains: ['ethereum', 'bsc', 'polygon', 'solana', 'tron'] as const,
    stablecoins: ['USDT', 'USDC', 'DAI', 'BUSD'] as const,
    nativeTokens: ['ETH', 'BNB', 'SOL', 'MATIC', 'TRX'] as const,
    settlementTime: '< 30s',
  },
  /** Agentic onboarding config */
  agenticOnboarding: {
    steps: ['profile', 'risk-assessment', 'agent-config', 'funding'] as const,
    autoTierDetection: true,
    aiRiskProfiling: true,
  },
  /** Multi-org config */
  multiOrg: {
    enabled: true,
    maxOrgsPerUser: 5,
    volumePooling: true, // Org members' volume contributes to org tier
    sharedAgents: true, // Org members can share agent slots
  },
} as const;

export const UNIFIED_TIERS = {
  EXPLORER: {
    id: 'EXPLORER',
    name: 'Explorer',
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',

    // Volume threshold for auto-upgrade
    volumeThreshold: 0, // Entry level
    monthlyVolumeMax: 10_000, // Up to $10K/mo

    // AI Limits
    aiRequestsPerDay: 25,
    tradingSignalsPerMonth: 10,

    // RaaS FINANCIAL ENGINE
    spreadBps: 30, // 0.30% spread
    selfRebateRate: 0.10, // 10% of spread returned
    commissionRates: {
      l1: 0.10,
      l2: 0,
      l3: 0,
      l4: 0,
      total: 0.20,
    },

    // Agent allocation
    agentSlots: 1, // 1 trading agent
    agentTypes: ['signal-follower'] as const,

    features: [
      'Zero trading fees — spread only (0.3%)',
      '25 AI requests per day',
      '10 trading signals per month',
      '1 AI trading agent',
      '10% spread rebate on your trades',
      'Earn 10% referral commission',
      'Crypto deposits & withdrawals',
    ],

    polar: null,
    nowPayments: null,
  },

  OPERATOR: {
    id: 'OPERATOR',
    name: 'Operator',
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',

    volumeThreshold: 10_000,
    monthlyVolumeMax: 100_000,

    aiRequestsPerDay: 200,
    tradingSignalsPerMonth: Infinity,

    // Tighter spread for higher volume
    spreadBps: 20, // 0.20%
    selfRebateRate: 0.20,
    commissionRates: {
      l1: 0.20,
      l2: 0.05,
      l3: 0,
      l4: 0,
      total: 0.45,
    },

    agentSlots: 3,
    agentTypes: ['signal-follower', 'dca-bot', 'grid-trader'] as const,

    features: [
      'Reduced spread (0.2%)',
      '200 AI requests per day',
      'Unlimited trading signals',
      '3 AI trading agents',
      '20% spread rebate',
      'Level 2 referral commissions',
      'Advanced technical analysis',
      'Real-time price alerts',
    ],

    highlight: 'Auto-Unlock',

    polar: null,
    nowPayments: null,
  },

  ARCHITECT: {
    id: 'ARCHITECT',
    name: 'Architect',
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',

    volumeThreshold: 100_000,
    monthlyVolumeMax: 1_000_000,

    aiRequestsPerDay: 1000,
    tradingSignalsPerMonth: Infinity,

    spreadBps: 12, // 0.12%
    selfRebateRate: 0.30,
    commissionRates: {
      l1: 0.25,
      l2: 0.10,
      l3: 0.05,
      l4: 0,
      total: 0.70,
    },

    agentSlots: 7,
    agentTypes: ['signal-follower', 'dca-bot', 'grid-trader', 'arbitrage', 'copy-leader', 'market-maker', 'portfolio-rebalancer'] as const,

    features: [
      'Low spread (0.12%)',
      '1,000 AI requests per day',
      '7 AI trading agents',
      '30% spread rebate',
      'Level 3 referral commissions',
      'DeepQuant Neural Core',
      'AI-powered auto-trading',
      'Copy trading leader status',
    ],

    highlight: 'Best Value',

    polar: null,
    nowPayments: null,
  },

  SOVEREIGN: {
    id: 'SOVEREIGN',
    name: 'Sovereign',
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',

    volumeThreshold: 1_000_000,
    monthlyVolumeMax: Infinity,

    aiRequestsPerDay: Infinity,
    tradingSignalsPerMonth: Infinity,

    spreadBps: 5, // 0.05% — near-zero
    selfRebateRate: 0.50, // 50% of spread back
    commissionRates: {
      l1: 0.30,
      l2: 0.15,
      l3: 0.10,
      l4: 0.05,
      total: 1.10, // Burn strategy for growth
    },

    agentSlots: Infinity,
    agentTypes: ['signal-follower', 'dca-bot', 'grid-trader', 'arbitrage', 'copy-leader', 'market-maker', 'portfolio-rebalancer', 'custom-strategy'] as const,

    features: [
      'Near-zero spread (0.05%)',
      'Unlimited AI requests & agents',
      '50% spread rebate',
      'Full Level 4 commissions',
      'Custom AI models',
      'White-label exchange',
      'Governance voting power',
      'Direct access to core team',
    ],

    highlight: 'Legendary',

    polar: null,
    nowPayments: null,
  },
} as const;

// Type exports
export type TierId = keyof typeof UNIFIED_TIERS;
export type LegacyTierId = 'FREE' | 'PRO' | 'TRADER' | 'ELITE' | 'WHALE' | 'PAY_PER_SIGNAL';
export type AnyTierId = TierId | LegacyTierId;
export type UnifiedTier = typeof UNIFIED_TIERS[TierId];

// Legacy compatibility — map old names to new
export const PAYMENT_TIERS = {
  FREE: UNIFIED_TIERS.EXPLORER,
  FOUNDERS: UNIFIED_TIERS.SOVEREIGN,
  PREMIUM: UNIFIED_TIERS.ARCHITECT,
  PAY_PER_SIGNAL: UNIFIED_TIERS.EXPLORER,
} as const;

export type PaymentTier = keyof typeof PAYMENT_TIERS;

// Helper functions
export function getTierById(tierId: string): UnifiedTier | null {
  const normalized = tierId.toUpperCase();

  if (normalized in UNIFIED_TIERS) {
    return UNIFIED_TIERS[normalized as TierId];
  }

  if (normalized in PAYMENT_TIERS) {
    return PAYMENT_TIERS[normalized as keyof typeof PAYMENT_TIERS];
  }

  // Legacy tier name mapping (backward compatibility)
  const legacyMap: Record<string, TierId> = {
    PRO: 'OPERATOR',
    TRADER: 'ARCHITECT',
    ELITE: 'SOVEREIGN',
    WHALE: 'SOVEREIGN',
  };

  if (normalized in legacyMap) {
    return UNIFIED_TIERS[legacyMap[normalized]];
  }

  return null;
}

export function getTierPrice(_tierId: TierId, _billingPeriod: 'monthly' | 'annual' = 'monthly'): number {
  return 0; // RaaS = zero subscription fees
}

export function getCommissionRate(tierId: TierId, level: 1 | 2 | 3 | 4): number {
  const tier = UNIFIED_TIERS[tierId];
  const key = `l${level}` as keyof typeof tier.commissionRates;
  return tier.commissionRates[key];
}

export function getSelfRebateRate(tierId: TierId): number {
  return UNIFIED_TIERS[tierId].selfRebateRate || 0;
}

export function getSpreadBps(tierId: TierId): number {
  return UNIFIED_TIERS[tierId].spreadBps;
}

export function getAILimit(tierId: TierId): number {
  return UNIFIED_TIERS[tierId].aiRequestsPerDay;
}

export function getAgentSlots(tierId: TierId): number {
  return UNIFIED_TIERS[tierId].agentSlots;
}

/** Determine tier based on 30-day trading volume */
export function getTierByVolume(monthlyVolume: number): TierId {
  if (monthlyVolume >= 1_000_000) return 'SOVEREIGN';
  if (monthlyVolume >= 100_000) return 'ARCHITECT';
  if (monthlyVolume >= 10_000) return 'OPERATOR';
  return 'EXPLORER';
}

export const TIER_ORDER: TierId[] = ['EXPLORER', 'OPERATOR', 'ARCHITECT', 'SOVEREIGN'];

export function canUpgrade(currentTier: TierId, targetTier: TierId): boolean {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const targetIndex = TIER_ORDER.indexOf(targetTier);
  return targetIndex > currentIndex;
}
