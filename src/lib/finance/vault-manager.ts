import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';
import { upgradeTriggers } from '@/lib/upgrade-triggers';

export const vaultManager = {
  /**
   * Capture a commission that the user missed due to tier limits.
   * This is the "Catcher" logic.
   */
  captureMissedCommission: async (userId: string, amount: number, source: string) => {
    const supabase = getSupabaseClient();

    // 24 Hour Grace Period
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('pending_vault').insert({
      user_id: userId,
      amount,
      source,
      expires_at: expiresAt,
      status: 'pending',
    });

    if (error) {
      logger.error('Failed to capture missed commission:', error);
      return null;
    }

    // Return the upgrade trigger payload to show to the user immediately if needed
    return upgradeTriggers.missedCommission(amount);
  },

  /**
   * Release funds from vault to wallet.
   * Call this when user upgrades.
   */
  releaseFunds: async (userId: string) => {
    const supabase = getSupabaseClient();

    // Call the DB function to handle transaction atomically
    const { data, error } = await supabase.rpc('claim_pending_vault_funds', {
      p_user_id: userId,
    });

    if (error) {
      logger.error('Failed to release vault funds:', error);
      return 0;
    }

    return data as number; // Returns total amount claimed
  },

  /**
   * Get current pending amount for UI
   */
  getPendingAmount: async (userId: string) => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('pending_vault')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error || !data) return 0;

    return data.reduce((sum, record) => sum + Number(record.amount), 0);
  },
};
