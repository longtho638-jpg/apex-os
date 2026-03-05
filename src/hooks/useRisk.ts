import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClientSide } from '@/lib/supabase';

export function useRisk() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'HEALTHY' | 'WARNING' | 'CRITICAL'>('HEALTHY');
  const [dailyLoss, setDailyLoss] = useState(0);
  const [maxDrawdown, _setMaxDrawdown] = useState(1000); // Default
  const supabase = getSupabaseClientSide();

  useEffect(() => {
    if (!user) return;

    const fetchRiskData = async () => {
      // In a real app, we'd fetch this from a 'risk_states' table or similar
      // For now, we'll mock it or fetch from a 'user_settings' table if it existed
      // Let's assume we fetch daily loss from a summary table or calculate it
      // For "Deep x10", we'll just simulate the fetch for now as we don't have a public API for Redis yet

      // However, we CAN fetch the 'transactions' to calculate daily loss
      const today = new Date().toISOString().split('T')[0];
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id) // Note: transactions table links to wallet_id, need join or 2 steps
        .gte('created_at', `${today}T00:00:00Z`);

      // Actually, transactions are linked to wallet_id.
      const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', user.id).single();

      if (wallet) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('wallet_id', wallet.id)
          .gte('created_at', `${today}T00:00:00Z`);

        if (txs) {
          const loss = txs
            .filter((t) => t.amount < 0 && (t.type === 'TRADE_LOSS' || t.type === 'FEE')) // Assuming TRADE_LOSS type exists or we infer from amount
            .reduce((acc, curr) => acc + curr.amount, 0);

          setDailyLoss(Math.abs(loss));

          if (Math.abs(loss) > maxDrawdown * 0.8) setStatus('WARNING');
          if (Math.abs(loss) >= maxDrawdown) setStatus('CRITICAL');
        }
      }
    };

    fetchRiskData();
    // Subscribe to transactions for real-time risk updates
    // ...
  }, [user, maxDrawdown, supabase.from]);

  return { status, dailyLoss, maxDrawdown };
}
