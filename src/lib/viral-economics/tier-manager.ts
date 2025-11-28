import { getSupabaseClient } from '@/lib/supabase';

export const EXCHANGE_AVG_REBATE_RATE = 0.0008;

export const TIERS = {
  FREE: { commission: 0.05, rebate: 0.60, requirements: { referrals: 0, volume: 0 } },
  BASIC: { commission: 0.10, rebate: 0.60, requirements: { referrals: 5, volume: 10000 } },
  TRADER: { commission: 0.20, rebate: 0.55, requirements: { referrals: 20, volume: 50000 } },
  PRO: { commission: 0.30, rebate: 0.50, requirements: { referrals: 50, volume: 200000 } },
  ELITE: { commission: 0.40, rebate: 0.45, requirements: { referrals: 100, volume: 1000000 } },
  APEX: { commission: 0.50, rebate: 0.40, requirements: { referrals: 500, volume: 5000000 } }
};

const TIER_ORDER = ['FREE', 'BASIC', 'TRADER', 'PRO', 'ELITE', 'APEX'];

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
    const req = TIERS[tier as keyof typeof TIERS].requirements;
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

  const req = TIERS[tier as keyof typeof TIERS].requirements;
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
          current_commission_rate: TIERS[calculatedTier as keyof typeof TIERS].commission,
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