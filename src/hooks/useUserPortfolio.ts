import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClientSide } from '@/lib/supabase';

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  size: number;
  leverage: number;
  unrealizedPnl: number;
  status: 'OPEN' | 'CLOSED';
}

export function useUserPortfolio() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClientSide();

  const fetchPortfolio = async () => {
    if (!user) return;

    // 1. Get Balance
    const { data: wallet } = await supabase.from('user_wallets').select('balance').eq('user_id', user.id).single();

    if (wallet) setBalance(wallet.balance);

    // 2. Get Positions
    const { data: posData } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (posData) {
      setPositions(
        posData.map((p) => ({
          id: p.id,
          symbol: p.symbol,
          side: p.side,
          entryPrice: p.entry_price,
          size: p.size,
          leverage: p.leverage,
          unrealizedPnl: p.unrealized_pnl, // This needs real-time update in a real app
          status: p.status,
        })),
      );
    }
    setLoading(false);
  };

  // Initial Fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Realtime Subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('portfolio_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          setBalance(payload.new.balance);
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions', filter: `user_id=eq.${user.id}` },
        () => {
          fetchPortfolio(); // Refresh positions on change
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPortfolio, supabase.channel, supabase.removeChannel]);

  return { balance, positions, loading, refresh: fetchPortfolio };
}
