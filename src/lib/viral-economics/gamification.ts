import { getSupabaseClient } from '@/lib/supabase';

export const BADGES = {
  ROOKIE_RECRUITER: { refs: 1, icon: '🌱', name: 'Rookie Recruiter' },
  TALENT_SCOUT: { refs: 10, icon: '🔍', name: 'Talent Scout' },
  NETWORK_BUILDER: { refs: 50, icon: '🏗️', name: 'Network Builder' },
  COMMUNITY_LEADER: { refs: 100, icon: '👑', name: 'Community Leader' },
  EMPIRE_ARCHITECT: { refs: 500, icon: '🏰', name: 'Empire Architect' },
};

export interface LeaderboardEntry {
  user_id: string;
  username?: string; // Optional, from user profile
  total_referrals: number;
  monthly_volume: number;
  rank: number;
}

export async function checkBadgeEligibility(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase.from('user_tiers').select('active_referrals, badges').eq('user_id', userId).single();

  if (!data) return [];

  const currentBadges = (data.badges as string[]) || [];
  const newBadges: string[] = [];

  // Check referral milestones
  Object.entries(BADGES).forEach(([id, req]) => {
    if (data.active_referrals >= req.refs && !currentBadges.includes(id)) {
      newBadges.push(id);
    }
  });

  // Save if any new
  if (newBadges.length > 0) {
    const updatedBadges = [...currentBadges, ...newBadges];
    await supabase.from('user_tiers').update({ badges: updatedBadges }).eq('user_id', userId);

    // Notification dispatch can be wired here via notificationService.send() when badge system is live
  }

  return newBadges;
}

export async function getLeaderboard(_month: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();

  // Ranking by monthly volume (or commission, or referrals)
  // Let's rank by referrals count for "Viral" leaderboard
  const { data } = await supabase
    .from('user_tiers')
    .select('user_id, active_referrals, monthly_volume')
    .order('active_referrals', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((entry, index) => ({
    user_id: entry.user_id,
    total_referrals: entry.active_referrals,
    monthly_volume: Number(entry.monthly_volume),
    rank: index + 1,
  }));
}

export async function trackProgress(userId: string): Promise<{ nextTier: string; progress: number }> {
  const supabase = getSupabaseClient();
  const { data: tierData } = await supabase
    .from('user_tiers')
    .select('tier, monthly_volume')
    .eq('user_id', userId)
    .single();

  if (!tierData) return { nextTier: 'OPERATOR', progress: 0 };

  const volumeThresholds: Record<string, number> = {
    EXPLORER: 10_000,
    OPERATOR: 100_000,
    ARCHITECT: 1_000_000,
    SOVEREIGN: Infinity,
  };

  const currentTier = tierData.tier || 'EXPLORER';
  const nextThreshold = volumeThresholds[currentTier] || 10_000;
  const progress = Math.min(100, Math.round((Number(tierData.monthly_volume) / nextThreshold) * 100));

  const tierOrder = ['EXPLORER', 'OPERATOR', 'ARCHITECT', 'SOVEREIGN'];
  const currentIdx = tierOrder.indexOf(currentTier);
  const nextTier = currentIdx < tierOrder.length - 1 ? tierOrder[currentIdx + 1] : 'SOVEREIGN';

  return { nextTier, progress };
}
