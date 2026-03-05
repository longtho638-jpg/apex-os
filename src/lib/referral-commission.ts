import 'server-only';
import type { TierId } from '@apex-os/vibe-payment';
import { getSupabaseClient } from '@/lib/supabase';

// RaaS commission structure — L1 = Direct Referral
const COMMISSION_RATES: Record<TierId, number> = {
  EXPLORER: 0.1, // 10%
  OPERATOR: 0.2, // 20%
  ARCHITECT: 0.25, // 25%
  SOVEREIGN: 0.3, // 30%
};

function getCommissionRate(tier: TierId): number {
  return COMMISSION_RATES[tier] || 0;
}

export async function calculateCommission(referredUserId: string, tradeRevenue: number) {
  const supabase = getSupabaseClient();

  // 1. Find direct referrer via conversion table
  const { data: conversion } = await supabase
    .from('referral_conversions')
    .select('*')
    .eq('referred_user_id', referredUserId)
    .single();

  if (!conversion) return null;

  // Fetch referrer tier (RaaS volume-based)
  const { data: referrerTier } = await supabase
    .from('user_tiers')
    .select('tier')
    .eq('user_id', conversion.referrer_id)
    .single();

  const tier = (referrerTier?.tier || 'EXPLORER').toUpperCase() as TierId;

  // 2. Calculate L1 Commission from trade revenue (spread-based)
  const rate = getCommissionRate(tier);
  const commissionAmount = tradeRevenue * rate;

  // 3. Update conversion record
  if (commissionAmount > 0) {
    await supabase
      .from('referral_conversions')
      .update({
        trade_revenue: tradeRevenue,
        commission_amount: commissionAmount,
      })
      .eq('id', conversion.id);

    // Credit Wallet (Realtime)
    await supabase.rpc('credit_user_balance_realtime', {
      p_user_id: conversion.referrer_id,
      p_amount: commissionAmount,
      p_source: 'referral_l1',
      p_metadata: { referred_user: referredUserId },
    });
  }

  return { referrerId: conversion.referrer_id, commissionAmount };
}
