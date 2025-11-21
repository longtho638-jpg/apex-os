import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if env vars are present
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function useUpgradeTier() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const upgradeToFounders = async (userId: string) => {
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

            // 2. Call Edge Function
            const { data, error: funcError } = await supabase.functions.invoke('upgrade-to-founders', {
                body: {
                    user_id: userId,
                    tx_id: mockTxId,
                    amount: 99
                }
            });

            if (funcError) throw funcError;

            if (!data?.success) {
                throw new Error(data?.message || 'Upgrade failed');
            }

            setSuccess(true);

            // 3. Force refresh user session/data if needed
            // In a real app, you might want to invalidate React Query cache or refresh Supabase session
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
        upgradeToFounders,
        isLoading,
        error,
        success
    };
}
