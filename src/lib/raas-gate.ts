/**
 * RaaS Gate — Premium Feature Access Control
 *
 * Gates premium trading signals and advanced analytics behind subscription tier checks.
 * Admin-only features are gated separately.
 *
 * @module lib/raas-gate
 */

import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// License key for RaaS gateway (set in environment)
export const RAAS_LICENSE_KEY = process.env.RAAS_LICENSE_KEY;

// Tier hierarchy (lower index = lower tier)
const TIER_ORDER = ['EXPLORER', 'OPERATOR', 'ARCHITECT', 'SOVEREIGN'] as const;
type TierId = typeof TIER_ORDER[number];

// Feature access configuration by tier
const FEATURE_ACCESS = {
  // Free tier — basic features only
  EXPLORER: {
    tradingSignals: false,
    advancedAnalytics: false,
    aiChat: false,
    exportData: false,
    customAlerts: false,
  },
  // Pro tier — signals + basic analytics
  OPERATOR: {
    tradingSignals: true,
    advancedAnalytics: false,
    aiChat: true,
    exportData: false,
    customAlerts: false,
  },
  // Trader tier — full analytics
  ARCHITECT: {
    tradingSignals: true,
    advancedAnalytics: true,
    aiChat: true,
    exportData: true,
    customAlerts: false,
  },
  // Elite tier — everything
  SOVEREIGN: {
    tradingSignals: true,
    advancedAnalytics: true,
    aiChat: true,
    exportData: true,
    customAlerts: true,
  },
} as const;

export interface FeatureAccess {
  tradingSignals: boolean;
  advancedAnalytics: boolean;
  aiChat: boolean;
  exportData: boolean;
  customAlerts: boolean;
}

export interface GateResult {
  allowed: boolean;
  tier: TierId;
  requiredTier?: TierId;
  reason: string;
}

/**
 * Get user's current tier from database
 */
export async function getUserTier(userId: string): Promise<TierId> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_tiers')
    .select('tier')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    logger.error('Error fetching user tier', error);
    return 'EXPLORER';
  }

  const tier = data.tier as TierId;
  return TIER_ORDER.includes(tier) ? tier : 'EXPLORER';
}

/**
 * Check if user's tier meets minimum requirement
 */
export function isTierSufficient(userTier: TierId, requiredTier: TierId): boolean {
  const userIndex = TIER_ORDER.indexOf(userTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier);
  return userIndex >= requiredIndex;
}

/**
 * Get feature access for user's tier
 */
export function getFeatureAccess(tier: TierId): FeatureAccess {
  return FEATURE_ACCESS[tier];
}

/**
 * Gate function for trading signals
 * Returns GateResult with allowed status and reason
 */
export async function gateTradingSignals(userId: string): Promise<GateResult> {
  const tier = await getUserTier(userId);
  const access = getFeatureAccess(tier);

  if (access.tradingSignals) {
    return {
      allowed: true,
      tier,
      reason: 'Tier includes trading signals access',
    };
  }

  return {
    allowed: false,
    tier,
    requiredTier: 'OPERATOR',
    reason: 'Trading signals require OPERATOR tier or higher',
  };
}

/**
 * Gate function for advanced analytics
 */
export async function gateAdvancedAnalytics(userId: string): Promise<GateResult> {
  const tier = await getUserTier(userId);
  const access = getFeatureAccess(tier);

  if (access.advancedAnalytics) {
    return {
      allowed: true,
      tier,
      reason: 'Tier includes advanced analytics access',
    };
  }

  return {
    allowed: false,
    tier,
    requiredTier: 'ARCHITECT',
    reason: 'Advanced analytics require ARCHITECT tier or higher',
  };
}

/**
 * Gate function for AI chat
 */
export async function gateAiChat(userId: string): Promise<GateResult> {
  const tier = await getUserTier(userId);
  const access = getFeatureAccess(tier);

  if (access.aiChat) {
    return {
      allowed: true,
      tier,
      reason: 'Tier includes AI chat access',
    };
  }

  return {
    allowed: false,
    tier,
    requiredTier: 'OPERATOR',
    reason: 'AI chat requires OPERATOR tier or higher',
  };
}

/**
 * Gate function for data export
 */
export async function gateExportData(userId: string): Promise<GateResult> {
  const tier = await getUserTier(userId);
  const access = getFeatureAccess(tier);

  if (access.exportData) {
    return {
      allowed: true,
      tier,
      reason: 'Tier includes data export access',
    };
  }

  return {
    allowed: false,
    tier,
    requiredTier: 'ARCHITECT',
    reason: 'Data export requires ARCHITECT tier or higher',
  };
}

/**
 * Gate function for custom alerts
 */
export async function gateCustomAlerts(userId: string): Promise<GateResult> {
  const tier = await getUserTier(userId);
  const access = getFeatureAccess(tier);

  if (access.customAlerts) {
    return {
      allowed: true,
      tier,
      reason: 'Tier includes custom alerts access',
    };
  }

  return {
    allowed: false,
    tier,
    requiredTier: 'SOVEREIGN',
    reason: 'Custom alerts require SOVEREIGN tier',
  };
}

/**
 * Admin-only feature gate
 * Checks if user has admin role in addition to tier
 */
export async function gateAdminFeature(userId: string): Promise<GateResult> {
  const supabase = getSupabaseClient();

  // Check for admin role
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    return {
      allowed: false,
      tier: 'EXPLORER',
      reason: 'Admin access required',
    };
  }

  if (userData.role !== 'admin') {
    return {
      allowed: false,
      tier: 'EXPLORER',
      reason: 'Admin access required',
    };
  }

  return {
    allowed: true,
    tier: 'EXPLORER',
    reason: 'Admin access granted',
  };
}

/**
 * Middleware helper for API routes
 * Throws error if feature not allowed
 */
export function requireFeature(result: GateResult): asserts result is GateResult & { allowed: true } {
  if (!result.allowed) {
    throw new Error(`ACCESS_DENIED: ${result.reason}`);
  }
}

/**
 * Get upgrade prompt message for blocked features
 */
export function getUpgradePrompt(result: GateResult): string {
  if (result.allowed) return '';

  const tierNames: Record<TierId, string> = {
    EXPLORER: 'Explorer',
    OPERATOR: 'Operator',
    ARCHITECT: 'Architect',
    SOVEREIGN: 'Sovereign',
  };

  if (result.requiredTier) {
    return `Upgrade to ${tierNames[result.requiredTier]} to access this feature`;
  }

  return 'Contact support for access';
}
