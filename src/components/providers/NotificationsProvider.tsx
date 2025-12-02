'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSupabaseClientSide } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationsContextType {
    lastNotification: any;
}

const NotificationsContext = createContext<NotificationsContextType>({ lastNotification: null });

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [lastNotification, setLastNotification] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const supabase = getSupabaseClientSide();

        // Subscribe to REAL-TIME changes on transactions table
        const channel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `wallet_id=in.(select id from wallets where user_id='${user.id}')` // Simplified filter logic
                },
                (payload) => {
                    const tx = payload.new;
                    handleNewTransaction(tx);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleNewTransaction = (tx: any) => {
        setLastNotification(tx);

        // Play Sound (Browser policy requires interaction first, but we try)
        try {
            const audio = new Audio('/sounds/coins.mp3'); // Assume this exists or fails silently
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }

        // Show Toast based on type
        if (tx.type === 'COMMISSION') {
            toast.success(`💰 Commission Received!`, {
                description: `You earned $${Math.abs(tx.amount).toFixed(2)}`,
                duration: 5000,
            });
        } else if (tx.type === 'DEPOSIT') {
            toast.success(`🏦 Deposit Confirmed`, {
                description: `+$${Math.abs(tx.amount).toFixed(2)} added to wallet.`,
            });
        } else if (tx.type === 'TRADE_WIN') { // Hypothetical type
            toast.success(`🚀 Trade Won!`, {
                description: `Profit: +$${Math.abs(tx.amount).toFixed(2)}`,
                className: 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
            });
        }
    };

    return (
        <NotificationsContext.Provider value={{ lastNotification }}>
            {children}
        </NotificationsContext.Provider>
    );
}
