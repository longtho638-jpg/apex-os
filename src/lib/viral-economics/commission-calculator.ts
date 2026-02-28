import { getSupabaseClient } from '@/lib/supabase';
import { EXCHANGE_AVG_REBATE_RATE } from './tier-manager';
import { getCommissionRate, TierId } from '@/config/unified-tiers';

interface CommissionResult {
  totalDistributed: number;
  companyRetained: number;
  scalingFactor: number;
  transactionsCount: number;
}

interface UserCommission {
  userId: string;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  bonus: number;
  total: number;
}

interface PoolValidation {
  isValid: boolean;
  totalPayoutRatio: number;
  requiredScaling: number;
}

export async function calculateMonthlyCommissions(month: string): Promise<CommissionResult> {
  const supabase = getSupabaseClient();

  // 1. Get total rebate pool for the month
  // This assumes there's a way to aggregate total trading fees/rebates available for distribution
  // For now, we'll simulate by summing up 'monthly_volume' * average_fee_rate or similar from a source
  // Or fetch from commission_pool if it's already populated with raw rebate data

  const { data: poolData } = await supabase
    .from('commission_pool')
    .select('*')
    .eq('month', month)
    .single();

  if (!poolData) {
    throw new Error('Commission pool not initialized for month ' + month);
  }

  const totalRebateAvailable = poolData.total_rebate;

  // 2. Calculate theoretical commissions for everyone
  // In a real scenario, we'd iterate through all active users or process in batches
  // For MVP, let's assume we process all 'user_tiers' which tracks active referral metrics
  // We need detailed referral network data to calculate L1-L4

  // Fetch all active users to process
  // Note: In production, use a cursor/batch process
  const { data: users } = await supabase.from('user_tiers').select('user_id, tier');

  let totalTheoreticalPayout = 0;
  const userCommissions: UserCommission[] = [];

  if (users) {
    for (const user of users) {
      const comm = await calculateUserCommission(user.user_id, month);
      if (comm.total > 0) {
        userCommissions.push(comm);
        totalTheoreticalPayout += comm.total;
      }
    }
  }

  // 3. Validate against pool cap (100%)
  // RaaS model: company monetizes via exchange spread, rebate pool is fully distributable
  const maxPayout = totalRebateAvailable * 1.0;
  let scalingFactor = 1.0;

  if (totalTheoreticalPayout > maxPayout) {
    scalingFactor = maxPayout / totalTheoreticalPayout;
  }

  // 4. Apply scaling and save transactions
  let totalPaid = 0;

  for (const comm of userCommissions) {
    const finalTotal = comm.total * scalingFactor;

    await supabase.from('commission_transactions').insert({
      user_id: comm.userId,
      month,
      tier: (users?.find(u => u.user_id === comm.userId)?.tier) || 'EXPLORER',
      l1_commission: comm.l1 * scalingFactor,
      l2_commission: comm.l2 * scalingFactor,
      l3_commission: comm.l3 * scalingFactor,
      l4_commission: comm.l4 * scalingFactor,
      bonus_commission: comm.bonus * scalingFactor,
      total_commission: finalTotal,
      multiplier: scalingFactor,
      status: 'pending'
    });

    totalPaid += finalTotal;
  }

  // 5. Update pool
  await supabase.from('commission_pool').update({
    total_commission_allocated: totalPaid,
    scaling_factor: scalingFactor,
    updated_at: new Date().toISOString()
  }).eq('month', month);

  return {
    totalDistributed: totalPaid,
    companyRetained: totalRebateAvailable - totalPaid,
    scalingFactor,
    transactionsCount: userCommissions.length
  };
}

export async function calculateUserCommission(userId: string, _month: string): Promise<UserCommission> {
  const supabase = getSupabaseClient();

  // Logic:
  // 1. Get Direct Referrals (L1) and their volume
  // 2. Get L2, L3, L4 referrals
  // 3. Apply rates based on User's Tier

  const { data: tierData } = await supabase
    .from('user_tiers')
    .select('tier, current_commission_rate')
    .eq('user_id', userId)
    .single();

  if (!tierData) return { userId, l1: 0, l2: 0, l3: 0, l4: 0, bonus: 0, total: 0 };

  let l1 = 0, l2 = 0, l3 = 0, l4 = 0;

  const { data: network } = await supabase
    .from('referral_network')
    .select('referee_volume, level')
    .eq('referrer_id', userId)
    .in('level', [1, 2, 3, 4]);

  if (network) {
    for (const ref of network) {
      // Revenue estimation from referee volume — monthly aggregate uses avg rate.
      // Zero-fee pairs are excluded at trade-time (realtime-commission.ts handles this).
      // Monthly calc is an approximation; realtime is source of truth.
      const refereeVolume = Number(ref.referee_volume) || 0;
      if (refereeVolume <= 0) continue;
      const revenueGenerated = refereeVolume * EXCHANGE_AVG_REBATE_RATE;

      // Get rate for this specific level based on user's tier
      const userTier = (tierData.tier || 'EXPLORER').toUpperCase() as TierId;

      // CRITICAL FIX: Use explicit rate from unified-tiers.ts
      const rate = getCommissionRate(userTier, ref.level as 1 | 2 | 3 | 4) || 0;

      // Commission = Revenue * Rate
      // Note: We do NOT deduct the referee's self-rebate here because the rates in unified-tiers
      // are designed as % of Revenue (e.g. 20% of revenue), not % of Remainder.
      const commission = revenueGenerated * rate;

      if (ref.level === 1) l1 += commission;
      if (ref.level === 2) l2 += commission;
      if (ref.level === 3) l3 += commission;
      if (ref.level === 4) l4 += commission;
    }
  }

  // Bonuses (e.g., from badges or streaks) - Simplified for now
  const bonus = 0;

  return {
    userId,
    l1, l2, l3, l4, bonus,
    total: l1 + l2 + l3 + l4 + bonus
  };
}

export async function validateCommissionPool(month: string): Promise<PoolValidation> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('commission_pool')
    .select('*')
    .eq('month', month)
    .single();

  if (!data) return { isValid: false, totalPayoutRatio: 0, requiredScaling: 0 };

  const ratio = data.total_commission_allocated / data.total_rebate;

  return {
    isValid: ratio <= 0.9,
    totalPayoutRatio: ratio,
    requiredScaling: ratio > 0.9 ? (0.9 / ratio) : 1.0
  };
}

export async function scaleCommissions(month: string, scaleFactor: number): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. Update all pending transactions
  // Note: PostgREST doesn't support update with arithmetic expression easily on self directly without RPC
  // We might need to use a raw query or RPC.
  // Or fetch, calc, update batch.
  // For strictness, we assume `calculateMonthlyCommissions` handles the scaling BEFORE inserting.
  // This function is for "emergency manual scaling" or re-scaling.

  // Let's implemented it via RPC ideally, but here we mock fetch-update loop for safety in Node
  // WARNING: Slow for large datasets. In prod, use SQL `UPDATE ... SET total = total * x`

  const { data: txs } = await supabase
    .from('commission_transactions')
    .select('id, total_commission')
    .eq('month', month);

  if (!txs) return;

  for (const tx of txs) {
    await supabase
      .from('commission_transactions')
      .update({
        total_commission: tx.total_commission * scaleFactor,
        multiplier: scaleFactor
      })
      .eq('id', tx.id);
  }

  // Update pool
  await supabase.from('commission_pool').update({
    scaling_factor: scaleFactor
  }).eq('month', month);
}
