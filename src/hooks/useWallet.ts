import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClientSide } from '@/lib/supabase';

export interface WalletState {
    total: number;
    available: number;
    locked: number;
    profit: number;
    loading: boolean;
}

export function useWallet() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState<WalletState>({
        total: 0,
        available: 0,
        locked: 0,
        profit: 0,
        loading: true
    });

    const supabase = getSupabaseClientSide();

    const fetchWallet = async () => {
        if (!user) return;

        try {
            // 1. Get Balance
            const { data: walletData, error } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching wallet:', error);
            }

            // 2. Calculate Total Profit from closed positions
            const { data: closedPositions } = await supabase
                .from('positions')
                .select('unrealized_pnl')
                .eq('user_id', user.id)
                .eq('status', 'CLOSED');

            const totalProfit = closedPositions?.reduce((sum, pos) =>
                sum + (Number(pos.unrealized_pnl) || 0), 0) || 0;

            if (walletData) {
                setWallet({
                    total: walletData.balance, // + locked if we track it
                    available: walletData.balance,
                    locked: 0, // TODO: Calculate from open orders
                    profit: totalProfit,
                    loading: false
                });
            } else {
                // Handle case where wallet doesn't exist yet (maybe create one?)
                setWallet(prev => ({ ...prev, loading: false }));
            }

        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            setWallet(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchWallet();

        // Optional: Subscribe to changes
        const channel = supabase
            .channel('wallet_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'wallets',
                filter: `user_id=eq.${user?.id}`
            }, () => {
                fetchWallet();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return { ...wallet, refresh: fetchWallet };
}
