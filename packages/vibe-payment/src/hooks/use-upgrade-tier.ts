'use client';

/**
 * Parameterized tier-upgrade hook — accepts supabaseClient instead of importing getSupabaseClientSide.
 */

import { useState } from 'react';
import type { TierId, UseUpgradeTierParams } from '../types/billing-types';

export function useUpgradeTier({ supabaseClient }: UseUpgradeTierParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const upgradeToTier = async (userId: string, targetTier: TierId) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!supabaseClient) {
        throw new Error(
          'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local',
        );
      }

      const mockTxId = `tx_${Math.random().toString(36).substring(7)}`;

      const { data, error: funcError } = await supabaseClient.functions.invoke('upgrade-tier', {
        body: {
          user_id: userId,
          tier: targetTier,
          tx_id: mockTxId,
        },
      });

      if (funcError) throw funcError;

      if (!data?.success) {
        throw new Error(data?.message || 'Upgrade failed');
      }

      setSuccess(true);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upgrade';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { upgradeToTier, isLoading, error, success };
}
