import { logger } from '@/lib/logger';
import { calculateMonthlyCommissions } from './commission-calculator';
import { promoteTier } from './tier-manager';
import { updateRefereeMetrics } from './referral-manager';
import { checkBadgeEligibility } from './gamification';
import { getSupabaseClient } from '@/lib/supabase';

export async function monthlyCommissionCalculation() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  logger.info(`Starting monthly commission calculation for ${month}...`);
  const result = await calculateMonthlyCommissions(month);
  logger.info('Commission calculation complete:', result);
}

export async function dailyTierCheck() {
  const supabase = getSupabaseClient();
  const { data: users } = await supabase.from('user_tiers').select('user_id');
  
  if (users) {
    let promotedCount = 0;
    for (const user of users) {
      const promoted = await promoteTier(user.user_id);
      if (promoted) promotedCount++;
      
      // Also check badges
      await checkBadgeEligibility(user.user_id);
    }
    logger.info(`Daily tier check complete. Promoted ${promotedCount} users.`);
  }
}

export async function hourlyMetricsUpdate() {
  // Update referee volume if we had a source of recent trades
  // For MVP, assuming trade engine calls updateRefereeMetrics directly or we scan active traders
  logger.info('Hourly metrics sync skipped (event-driven preferred).');
}
