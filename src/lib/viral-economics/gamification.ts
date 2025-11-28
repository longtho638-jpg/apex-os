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
  
  const { data } = await supabase
    .from('user_tiers')
    .select('active_referrals, badges')
    .eq('user_id', userId)
    .single();
    
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
    await supabase
      .from('user_tiers')
      .update({ badges: updatedBadges })
      .eq('user_id', userId);
      
    // TODO: Send notification
  }
  
  return newBadges;
}

export async function getLeaderboard(month: string, limit: number = 10): Promise<LeaderboardEntry[]> {
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
    rank: index + 1
  }));
}

export async function trackProgress(userId: string): Promise<any> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from('user_tiers').select('*').eq('user_id', userId).single();
  
  // Logic to calculate % to next tier/badge
  // Placeholder
  return {
    nextTier: 'BASIC',
    progress: 45 // %
  };
}
