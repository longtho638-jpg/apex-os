import 'server-only';
import { getSupabaseClient } from '@/lib/supabase';
import { TierId } from '@/config/unified-tiers';

// Simplified tiered commission structure
// L1 = Direct Referral
const COMMISSION_RATES: Record<TierId, number> = {
  'FREE': 0,
  'PRO': 0.20,    // 20%
  'TRADER': 0.25, // 25%
  'ELITE': 0.30,  // 30%
  'WHALE': 0.40,  // 40%
  'PAY_PER_SIGNAL': 0
};

function getCommissionRate(tier: TierId): number {
  return COMMISSION_RATES[tier] || 0;
}

export async function calculateCommission(
  referredUserId: string,
  subscriptionAmount: number
) {
  const supabase = getSupabaseClient();

  // 1. Find direct referrer via conversion table
  const { data: conversion } = await supabase
    .from('referral_conversions')
    .select('*, referrer:referrer_id(subscription_tier)') // Join manually if needed or fetch separate
    .eq('referred_user_id', referredUserId)
    .single();

  if (!conversion) return null;

  // Fetch referrer tier separately if join syntax varies or simple relation
  const { data: referrerUser } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', conversion.referrer_id)
    .single();

  const referrerTier = (referrerUser?.subscription_tier || 'FREE').toUpperCase() as TierId;

  // 2. Calculate L1 Commission
  const rate = getCommissionRate(referrerTier);
  const commissionAmount = subscriptionAmount * rate;

  // 3. Update conversion record
  if (commissionAmount > 0) {
    await supabase
      .from('referral_conversions')
      .update({
        subscription_revenue: subscriptionAmount,
        commission_amount: commissionAmount,
      })
      .eq('id', conversion.id);

    // Credit Wallet (Realtime)
    await supabase.rpc('credit_user_balance_realtime', {
      p_user_id: conversion.referrer_id,
      p_amount: commissionAmount,
      p_source: 'referral_l1',
      p_metadata: { referred_user: referredUserId }
    });
  }

  return { referrerId: conversion.referrer_id, commissionAmount };
}
