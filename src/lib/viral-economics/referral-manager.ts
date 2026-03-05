import { nanoid } from 'nanoid';
import { getSupabaseClient } from '@/lib/supabase';

export async function createReferralLink(userId: string, orgId?: string): Promise<string> {
  const supabase = getSupabaseClient();

  // Check existing code in referral_codes table
  const { data } = await supabase.from('referral_codes').select('code').eq('user_id', userId).limit(1).single();

  if (data?.code) {
    return `https://apex.trade/join/${data.code}`;
  }

  // Generate and persist new code
  const code = nanoid(8).toUpperCase();
  await supabase.from('referral_codes').insert({
    code,
    user_id: userId,
    org_id: orgId || null,
  });

  return `https://apex.trade/join/${code}`;
}

export async function processReferralSignup(referralCode: string, newUserId: string): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. Identify direct referrer
  // Assuming a table or lookup exists.
  // For MVP, let's assumes `referralCode` maps to a user ID via lookup.
  const { data: referrer } = await supabase
    .from('referral_codes') // Hypothetical table
    .select('user_id')
    .eq('code', referralCode)
    .single();

  if (!referrer) return; // Invalid code

  const directReferrerId = referrer.user_id;

  // 2. Insert Direct Link (L1)
  await supabase.from('referral_network').insert({
    referrer_id: directReferrerId,
    referee_id: newUserId,
    level: 1,
    status: 'active',
  });

  // 3. Find ancestors to build the network (L2, L3, L4)
  // Find who referred the direct referrer?
  // Query `referral_network` where referee_id = directReferrerId AND level = 1
  // That is the L2 referrer (Grandparent).

  // Recursive or iterative search up to 3 more levels
  let currentChildId = directReferrerId;
  for (let level = 2; level <= 4; level++) {
    const { data: parentLink } = await supabase
      .from('referral_network')
      .select('referrer_id')
      .eq('referee_id', currentChildId)
      .eq('level', 1) // Get direct parent
      .single();

    if (!parentLink) break; // No more ancestors

    const ancestorId = parentLink.referrer_id;

    // Insert Network Link
    await supabase.from('referral_network').insert({
      referrer_id: ancestorId,
      referee_id: newUserId,
      level: level,
      status: 'active',
    });

    currentChildId = ancestorId; // Move up
  }

  // 4. Update Metrics for direct referrer (Referral Count)
  // Increment total_referrals in user_tiers
  await updateReferrerMetrics(directReferrerId);
}

async function updateReferrerMetrics(userId: string) {
  const supabase = getSupabaseClient();

  // Count active direct referrals
  const { count } = await supabase
    .from('referral_network')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('level', 1)
    .eq('status', 'active');

  await supabase
    .from('user_tiers')
    .update({
      active_referrals: count || 0,
    })
    .eq('user_id', userId);
}

interface ReferralEntry {
  referee_id: string;
  referee_volume: number;
  commission_earned: number;
}

export async function getReferralsAtLevel(userId: string, level: number): Promise<ReferralEntry[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('referral_network')
    .select('referee_id, referee_volume, commission_earned')
    .eq('referrer_id', userId)
    .eq('level', level);

  return data || [];
}

export async function calculateNetworkDepth(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  // Find max level where this user is a referrer?
  // No, network depth usually means how deep *my* downline goes.
  // We query referral_network where referrer_id = me, order by level desc.

  const { data } = await supabase
    .from('referral_network')
    .select('level')
    .eq('referrer_id', userId)
    .order('level', { ascending: false })
    .limit(1)
    .single();

  return data?.level || 0;
}

export async function updateRefereeMetrics(userId: string): Promise<void> {
  // When a user trades, update 'referee_volume' in all rows where they are the referee
  // This propagates volume up the tree
  const supabase = getSupabaseClient();

  // Get user's current monthly volume (assumed updated elsewhere)
  const { data: tierData } = await supabase.from('user_tiers').select('monthly_volume').eq('user_id', userId).single();

  if (!tierData) return;

  // Update all network links
  await supabase.from('referral_network').update({ referee_volume: tierData.monthly_volume }).eq('referee_id', userId);
}
