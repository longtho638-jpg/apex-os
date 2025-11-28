'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { ArrowUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface CommissionEvent {
  id: string;
  amount: number;
  source: string;
  created_at: string;
}

interface WalletData {
  balance_usd: number;
  total_earned: number;
}

export function RealtimeWallet({ userId }: { userId: string }) {
  const [wallet, setWallet] = useState<WalletData>({ balance_usd: 0, total_earned: 0 });
  const [recentCommissions, setRecentCommissions] = useState<CommissionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Use singleton client
  const supabase = getSupabaseClientSide();

  useEffect(() => {
    if (!userId) return;

    // Initial Fetch
    async function fetchData() {
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('balance_usd, total_earned')
        .eq('user_id', userId)
        .single();
        
      if (walletData) setWallet(walletData);

      const { data: events } = await supabase
        .from('commission_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (events) setRecentCommissions(events);
      setLoading(false);
    }

    fetchData();

    // Realtime Subscription
    const channel = supabase
      .channel('realtime-wallet')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_wallets',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Wallet Update:', payload);
          setWallet({
            balance_usd: payload.new.balance_usd,
            total_earned: payload.new.total_earned
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commission_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New Commission:', payload);
          setRecentCommissions((prev) => [payload.new as CommissionEvent, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-800 rounded-lg"></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Balance Card */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Current Balance</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">${wallet.balance_usd.toFixed(2)}</span>
          <span className="text-sm text-green-400 flex items-center">
            <ArrowUp className="w-3 h-3 mr-1" />
            Realtime
          </span>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Total Earned: ${wallet.total_earned.toFixed(2)}
        </div>
        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
          Withdraw
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Recent Earnings</h3>
        <div className="space-y-3">
          {recentCommissions.length === 0 ? (
            <div className="text-gray-500 text-sm">No recent activity</div>
          ) : (
            recentCommissions.map((event) => (
              <div key={event.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {event.source.replace('_', ' ')}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+${event.amount.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
