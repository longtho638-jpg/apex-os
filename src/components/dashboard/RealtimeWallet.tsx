'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { ArrowUp, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  type: string;
}

interface WalletData {
  balance: number;
  total_earned: number;
}

export function RealtimeWallet({ userId }: { userId: string }) {
  const t = useTranslations('Wallet');
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, total_earned: 0 });
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseClientSide();

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      // 1. Fetch Wallet Balance
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('balance, total_earned')
        .eq('user_id', userId)
        .single();
        
      if (walletData) setWallet(walletData);

      // 2. Fetch Recent Transactions
      const { data: txs } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (txs) setRecentTx(txs);
      
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
            balance: payload.new.balance,
            total_earned: payload.new.total_earned
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New Transaction:', payload);
          setRecentTx((prev) => [payload.new as Transaction, ...prev].slice(0, 5));
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
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t('current_balance')}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-sm text-green-400 flex items-center">
            <ArrowUp className="w-3 h-3 mr-1" />
            {t('realtime')}
          </span>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          {t('total_earned')}: ${wallet.total_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
          {t('withdraw')}
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">{t('recent_earnings')}</h3>
        <div className="space-y-3">
          {recentTx.length === 0 ? (
            <div className="text-gray-500 text-sm">{t('no_activity')}</div>
          ) : (
            recentTx.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {tx.description || tx.type}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+${Number(tx.amount).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}