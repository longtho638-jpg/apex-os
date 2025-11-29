import { useState } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { TierId } from '@/config/unified-tiers';

// Get singleton client instance
let supabase: ReturnType<typeof getSupabaseClientSide> | null = null;
if (typeof window !== 'undefined') {
    supabase = getSupabaseClientSide();
}

export function useUpgradeTier() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const upgradeToTier = async (userId: string, targetTier: TierId) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Check if Supabase is configured
            if (!supabase) {
                throw new Error('Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
            }

            // 1. Simulate Payment (In production, integrate Stripe here)
            const mockTxId = `tx_${Math.random().toString(36).substring(7)}`;

            // 2. Call Edge Function (Generic upgrade function)
            // Assuming we have a generic upgrade function or we use the checkout API
            // For now, let's assume we call the checkout API or a similar logic
            // But since this hook was calling 'upgrade-to-founders', we should probably point it to 'create-checkout-session' or similar
            // However, to keep it simple and compatible with the previous logic pattern:

            const { data, error: funcError } = await supabase.functions.invoke('upgrade-tier', {
                body: {
                    user_id: userId,
                    tier: targetTier,
                    tx_id: mockTxId,
                }
            });

            if (funcError) throw funcError;

            if (!data?.success) {
                throw new Error(data?.message || 'Upgrade failed');
            }

            setSuccess(true);
            return data;

        } catch (err: any) {
            console.error('Upgrade error:', err);
            setError(err.message || 'Failed to upgrade');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        upgradeToTier,
        isLoading,
        error,
        success
    };
}
