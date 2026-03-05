import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

// import { trackEvent } from '@/lib/analytics';

// Simple wrapper for trackEvent
async function trackEvent(params: any) {
  if (process.env.NODE_ENV === 'development') {
    logger.info('[Analytics Track]', params);
  }
}

export const usageTracker = {
  /**
   * Track signal usage — RaaS model: signals included in tier, tracked for analytics
   */
  trackSignalUsage: async (userId: string, signalId: string) => {
    const supabase = getSupabaseClient();

    // Check user tier for AI request limits
    const { data: tierData } = await supabase.from('user_tiers').select('tier').eq('user_id', userId).single();

    // Log usage for analytics (RaaS: no per-signal charges)
    await supabase.from('usage_charges').insert({
      user_id: userId,
      charge_type: 'signal_used',
      amount: 0,
      signal_id: signalId,
      charged_at: new Date().toISOString(),
    });

    await trackEvent({
      event_name: 'signal_used',
      user_id: userId,
      metadata: { tier: tierData?.tier || 'EXPLORER', signalId },
    });
  },

  /**
   * Get total unpaid charges for a user
   */
  getUnpaidCharges: async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('usage_charges')
      .select('amount')
      .eq('user_id', userId)
      .eq('paid', false);

    if (error || !data) return 0;

    return data.reduce((sum, charge) => sum + Number(charge.amount), 0);
  },
};
