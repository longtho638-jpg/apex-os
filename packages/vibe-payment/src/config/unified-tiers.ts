/**
 * UNIFIED TIERS — RaaS AGI MODEL (Revenue-as-a-Service)
 *
 * Zero subscription fees. Revenue from exchange spread.
 * Tier progression is VOLUME-BASED, not payment-based.
 */

import type { TierId, UnifiedTier } from '../types/billing-types';

export const RAAS_CONFIG = {
  baseSpreadBps: 30,
  minSpreadBps: 5,
  cryptoGate: {
    chains: ['ethereum', 'bsc', 'polygon', 'solana', 'tron'] as const,
    stablecoins: ['USDT', 'USDC', 'DAI', 'BUSD'] as const,
    nativeTokens: ['ETH', 'BNB', 'SOL', 'MATIC', 'TRX'] as const,
    settlementTime: '< 30s',
  },
  agenticOnboarding: {
    steps: ['profile', 'risk-assessment', 'agent-config', 'funding'] as const,
    autoTierDetection: true,
    aiRiskProfiling: true,
  },
  multiOrg: {
    enabled: true,
    maxOrgsPerUser: 5,
    volumePooling: true,
    sharedAgents: true,
  },
} as const;

export const UNIFIED_TIERS: Record<TierId, UnifiedTier> = {
  EXPLORER: {
    id: 'EXPLORER',
    name: 'Explorer',
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'USD',
    volumeThreshold: 0,
    monthlyVolumeMax: 10_000,
    aiRequestsPerDay: 25,
    tradingSignalsPerMonth: 10,
    spreadBps: 30,
    selfRebateRate: 0.10,
    commissionRates: { l1: 0.10, l2: 0, l3: 0, l4: 0, total: 0.20 },
    agentSlots: 1,
    agentTypes: ['signal-follower'],
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
    spreadBps: 20,
    selfRebateRate: 0.20,
    commissionRates: { l1: 0.20, l2: 0.05, l3: 0, l4: 0, total: 0.45 },
    agentSlots: 3,
    agentTypes: ['signal-follower', 'dca-bot', 'grid-trader'],
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
    spreadBps: 12,
    selfRebateRate: 0.30,
    commissionRates: { l1: 0.25, l2: 0.10, l3: 0.05, l4: 0, total: 0.70 },
    agentSlots: 7,
    agentTypes: ['signal-follower', 'dca-bot', 'grid-trader', 'arbitrage', 'copy-leader', 'market-maker', 'portfolio-rebalancer'],
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
    spreadBps: 5,
    selfRebateRate: 0.50,
    commissionRates: { l1: 0.30, l2: 0.15, l3: 0.10, l4: 0.05, total: 1.10 },
    agentSlots: Infinity,
    agentTypes: ['signal-follower', 'dca-bot', 'grid-trader', 'arbitrage', 'copy-leader', 'market-maker', 'portfolio-rebalancer', 'custom-strategy'],
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
};

/** Legacy compatibility — map old tier names to RaaS tiers */
export const PAYMENT_TIERS = {
  FREE: UNIFIED_TIERS.EXPLORER,
  FOUNDERS: UNIFIED_TIERS.SOVEREIGN,
  PREMIUM: UNIFIED_TIERS.ARCHITECT,
  PAY_PER_SIGNAL: UNIFIED_TIERS.EXPLORER,
} as const;

export const TIER_ORDER: TierId[] = ['EXPLORER', 'OPERATOR', 'ARCHITECT', 'SOVEREIGN'];

// ---- Helper Functions ----

export function getTierById(tierId: string): UnifiedTier | null {
  const normalized = tierId.toUpperCase();

  if (normalized in UNIFIED_TIERS) {
    return UNIFIED_TIERS[normalized as TierId];
  }

  if (normalized in PAYMENT_TIERS) {
    return PAYMENT_TIERS[normalized as keyof typeof PAYMENT_TIERS];
  }

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

export function canUpgrade(currentTier: TierId, targetTier: TierId): boolean {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const targetIndex = TIER_ORDER.indexOf(targetTier);
  return targetIndex > currentIndex;
}
