import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';
import { UNIFIED_TIERS } from '@apex-os/vibe-payment';

// RaaS tier config — volume-based auto-upgrade (no subscription required)
const TIER_CONFIG = {
  EXPLORER: {
    commission: UNIFIED_TIERS.EXPLORER.commissionRates.total,
    rebate: UNIFIED_TIERS.EXPLORER.selfRebateRate,
    requirements: { referrals: 0, volume: 0 }
  },
  OPERATOR: {
    commission: UNIFIED_TIERS.OPERATOR.commissionRates.total,
    rebate: UNIFIED_TIERS.OPERATOR.selfRebateRate,
    requirements: { referrals: 5, volume: 10000 }
  },
  ARCHITECT: {
    commission: UNIFIED_TIERS.ARCHITECT.commissionRates.total,
    rebate: UNIFIED_TIERS.ARCHITECT.selfRebateRate,
    requirements: { referrals: 20, volume: 100000 }
  },
  SOVEREIGN: {
    commission: UNIFIED_TIERS.SOVEREIGN.commissionRates.total,
    rebate: UNIFIED_TIERS.SOVEREIGN.selfRebateRate,
    requirements: { referrals: 50, volume: 1000000 }
  },
} as const;

export const EXCHANGE_AVG_REBATE_RATE = 0.0008;
export const TIERS = TIER_CONFIG;

const TIER_ORDER = ['EXPLORER', 'OPERATOR', 'ARCHITECT', 'SOVEREIGN'];

export async function calculateUserTier(userId: string): Promise<string> {
  const supabase = getSupabaseClient();

  // Get user metrics
  const { data: tierData, error } = await supabase
    .from('user_tiers')
    .select('active_referrals, monthly_volume, tier')
    .eq('user_id', userId)
    .single();

  if (error || !tierData) {
    logger.error('Error fetching user metrics for tier calc', error);
    return 'EXPLORER';
  }

  const { active_referrals, monthly_volume } = tierData;
  let newTier = 'EXPLORER';

  // Find highest eligible tier
  for (const tier of TIER_ORDER) {
    const req = TIER_CONFIG[tier as keyof typeof TIER_CONFIG].requirements;
    if (active_referrals >= req.referrals && monthly_volume >= req.volume) {
      newTier = tier;
    }
  }

  return newTier;
}

export async function checkTierRequirements(userId: string, tier: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: tierData, error } = await supabase
    .from('user_tiers')
    .select('active_referrals, monthly_volume')
    .eq('user_id', userId)
    .single();

  if (error || !tierData) return false;

  const req = TIER_CONFIG[tier as keyof typeof TIER_CONFIG].requirements;
  return tierData.active_referrals >= req.referrals && tierData.monthly_volume >= req.volume;
}

export async function promoteTier(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const calculatedTier = await calculateUserTier(userId);

  // Get current tier to check if upgrade needed
  const { data: currentData } = await supabase
    .from('user_tiers')
    .select('tier')
    .eq('user_id', userId)
    .single();

  const currentTier = currentData?.tier || 'EXPLORER';

  // Only update if tier changed
  if (calculatedTier !== currentTier) {
    // Check if it's actually an upgrade (index check)
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const newIndex = TIER_ORDER.indexOf(calculatedTier);

    if (newIndex > currentIndex) {
      const { error } = await supabase
        .from('user_tiers')
        .update({
          tier: calculatedTier,
          current_commission_rate: TIER_CONFIG[calculatedTier as keyof typeof TIER_CONFIG].commission,
          tier_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('Error promoting tier', error);
        return false;
      }
      return true;
    }
  }

  return false;
}
