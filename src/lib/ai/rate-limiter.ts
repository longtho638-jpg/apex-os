import { UNIFIED_TIERS } from '@apex-os/vibe-payment';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

// Get AI limits from unified tiers (RaaS model)
const TIER_LIMITS: Record<string, number> = {
  explorer: UNIFIED_TIERS.EXPLORER.aiRequestsPerDay,
  operator: UNIFIED_TIERS.OPERATOR.aiRequestsPerDay,
  architect: UNIFIED_TIERS.ARCHITECT.aiRequestsPerDay,
  sovereign: UNIFIED_TIERS.SOVEREIGN.aiRequestsPerDay === Infinity ? 999999 : UNIFIED_TIERS.SOVEREIGN.aiRequestsPerDay,
  // Legacy tier mappings
  free: UNIFIED_TIERS.EXPLORER.aiRequestsPerDay,
  pro: UNIFIED_TIERS.OPERATOR.aiRequestsPerDay,
  trader: UNIFIED_TIERS.ARCHITECT.aiRequestsPerDay,
  elite: UNIFIED_TIERS.SOVEREIGN.aiRequestsPerDay === Infinity ? 999999 : UNIFIED_TIERS.SOVEREIGN.aiRequestsPerDay,
};

export class RateLimiter {
  /**
   * Check if user has exceeded daily limit
   * 兵法: 上兵伐謀 (Use limits to force upgrade)
   */
  static async checkLimit(
    userId: string,
    userTier: keyof typeof TIER_LIMITS,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
  }> {
    const supabase = getSupabaseClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('ai_usage')
      .select('request_count')
      .eq('user_id', userId)
      .eq('request_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "Result contains 0 rows"
      logger.error('[RateLimiter] Error checking limit:', error);
    }

    const currentCount = data?.request_count || 0;
    const limit = TIER_LIMITS[userTier] || TIER_LIMITS.free;
    const remaining = Math.max(0, limit - currentCount);

    return {
      allowed: currentCount < limit,
      remaining,
      limit,
    };
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(
    userId: string,
    tokens: number,
    cost: number,
    model: string = 'unknown',
    provider: string = 'unknown',
  ): Promise<number> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_tokens: tokens,
      p_cost: cost,
      p_model: model,
      p_provider: provider,
    });

    if (error) {
      logger.error('[RateLimiter] Error incrementing usage:', error);
      return 0;
    }

    return data as number;
  }

  /**
   * Get usage stats for today
   */
  static async getUsageStats(userId: string) {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('request_date', today)
      .single();

    return {
      requests: data?.request_count || 0,
      tokens: data?.total_tokens || 0,
      cost: parseFloat(data?.total_cost || '0'),
    };
  }
}
