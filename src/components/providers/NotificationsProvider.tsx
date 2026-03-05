'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClientSide } from '@/lib/supabase';

interface NotificationsContextType {
  lastNotification: any;
}

const NotificationsContext = createContext<NotificationsContextType>({ lastNotification: null });

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lastNotification, setLastNotification] = useState<any>(null);

  const handleNewTransaction = useCallback((tx: any) => {
    setLastNotification(tx);

    try {
      const audio = new Audio('/sounds/coins.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (_e) {}

    if (tx.type === 'COMMISSION') {
      toast.success('💰 Commission Received!', {
        description: `You earned $${Math.abs(tx.amount).toFixed(2)}`,
        duration: 5000,
      });
    } else if (tx.type === 'DEPOSIT') {
      toast.success('🏦 Deposit Confirmed', {
        description: `+$${Math.abs(tx.amount).toFixed(2)} added to wallet.`,
      });
    } else if (tx.type === 'TRADE_WIN') {
      toast.success('🚀 Trade Won!', {
        description: `Profit: +$${Math.abs(tx.amount).toFixed(2)}`,
        className: 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
      });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseClientSide();

    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `wallet_id=in.(select id from wallets where user_id='${user.id}')`,
        },
        (payload) => {
          const tx = payload.new;
          handleNewTransaction(tx);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleNewTransaction]);

  return <NotificationsContext.Provider value={{ lastNotification }}>{children}</NotificationsContext.Provider>;
}
