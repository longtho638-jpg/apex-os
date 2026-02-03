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
   * Track usage of a paid feature (e.g. signal)
   * If user is on Pay-Per-Signal tier, this creates a charge.
   */
  trackSignalUsage: async (userId: string, signalId: string) => {
    const supabase = getSupabaseClient();

    // Check user tier
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (user?.subscription_tier === 'PAY_PER_SIGNAL' || user?.subscription_tier === 'pay_per_signal') {
      // Create a charge
      const { error } = await supabase.from('usage_charges').insert({
        user_id: userId,
        charge_type: 'signal_used',
        amount: 5.0,
        signal_id: signalId,
        charged_at: new Date().toISOString(),
      });

      if (error) {
          logger.error('Failed to create usage charge:', error);
          return;
      }

      // Track event
      await trackEvent({
        event_name: 'usage_charge_created',
        user_id: userId,
        metadata: { amount: 5, type: 'signal', signalId },
      });
    }
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
  }
};
