import { getSupabaseClient } from '@/lib/supabase';
import { TIERS, EXCHANGE_AVG_REBATE_RATE } from './tier-manager';

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

  // 3. Validate against pool cap (90%)
  const maxPayout = totalRebateAvailable * 0.90;
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
      tier: (users?.find(u => u.user_id === comm.userId)?.tier) || 'FREE',
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

export async function calculateUserCommission(userId: string, month: string): Promise<UserCommission> {
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
    
  if (!tierData) return { userId, l1:0, l2:0, l3:0, l4:0, bonus:0, total:0 };

  // Base rates multipliers for levels (configurable)
  // L1: 100% of rate, L2: 50%, L3: 25%, L4: 12.5%
  const LEVEL_MULTIPLIERS = [1.0, 0.5, 0.25, 0.125];
  const baseRate = Number(tierData.current_commission_rate);

  let l1 = 0, l2 = 0, l3 = 0, l4 = 0;

  // Fetch referrals from referral_network
  // Note: "level" in referral_network is relative to the referrer for that specific link?
  // Actually schema says: referrer_id, referee_id, level.
  // If I am the referrer, I find entries where referrer_id = myId.
  // But "level" usually means relative depth from root? Or relative to me?
  // The schema comment says "1=direct, 2-4=network". This likely implies relative to the referrer_id stored in that row?
  // Or does it mean the referee's global level?
  // Let's assume `referral_network` stores edges. 
  // Wait, the schema: `referrer_id, referee_id, level`.
  // If it stores specific relationships for commission tracking, it might pre-calculate "User A refers User B (L1)", "User A refers User C (L2 via B)".
  // If the table only stores direct invites, then `level` column is redundant or means something else.
  // If it stores the flattened graph for User A, then:
  // Row: referrer=A, referee=B, level=1
  // Row: referrer=A, referee=C, level=2
  // This "Flattened" approach makes querying fast. Let's assume this structure.

  const { data: network } = await supabase
    .from('referral_network')
    .select('referee_volume, level')
    .eq('referrer_id', userId)
    .in('level', [1, 2, 3, 4]);

  if (network) {
    for (const ref of network) {
      // Calculate commission from this referee's volume
      // Volume * Fee_Rate (approx 0.1%?) * Commission_Rate * Level_Multiplier
      // We need the generated rebate amount, often stored or calc from volume.
      // Let's assume `referee_volume` is the raw volume.
      // Commission = Volume * 0.0005 (avg fee rebate portion) * baseRate * Level_Mult
      
      const rebateAmount = Number(ref.referee_volume) * EXCHANGE_AVG_REBATE_RATE;
      
      const commission = rebateAmount * baseRate * (LEVEL_MULTIPLIERS[ref.level - 1] || 0);
      
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
