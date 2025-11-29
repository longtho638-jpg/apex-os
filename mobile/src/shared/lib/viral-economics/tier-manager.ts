import { getSupabaseClient } from '@/lib/supabase';
import { UNIFIED_TIERS } from '@/config/unified-tiers';

// Tier configuration with commission rates from UNIFIED_TIERS
const TIER_CONFIG = {
  FREE: {
    commission: UNIFIED_TIERS.FREE.commissionRates.total, // 0
    rebate: 0.60,
    requirements: { referrals: 0, volume: 0 }
  },
  PRO: {
    commission: UNIFIED_TIERS.PRO.commissionRates.total, // 0.35
    rebate: 0.60,
    requirements: { referrals: 0, volume: 0 }
  },
  TRADER: {
    commission: UNIFIED_TIERS.TRADER.commissionRates.total, // 0.55
    rebate: 0.55,
    requirements: { referrals: 20, volume: 50000 }
  },
  ELITE: {
    commission: UNIFIED_TIERS.ELITE.commissionRates.total, // 0.75
    rebate: 0.50,
    requirements: { referrals: 100, volume: 500000 }
  },
} as const;

export const EXCHANGE_AVG_REBATE_RATE = 0.0008;
export const TIERS = TIER_CONFIG; // Backward compatibility alias

const TIER_ORDER = ['FREE', 'PRO', 'TRADER', 'ELITE'];

export async function calculateUserTier(userId: string): Promise<string> {
  const supabase = getSupabaseClient();

  // Get user metrics
  const { data: tierData, error } = await supabase
    .from('user_tiers')
    .select('active_referrals, monthly_volume, tier')
    .eq('user_id', userId)
    .single();

  if (error || !tierData) {
    console.error('Error fetching user metrics for tier calc', error);
    return 'FREE';
  }

  const { active_referrals, monthly_volume, tier: currentTier } = tierData;
  let newTier = 'FREE';

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

  const currentTier = currentData?.tier || 'FREE';

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
        console.error('Error promoting tier', error);
        return false;
      }
      return true;
    }
  }

  return false;
}