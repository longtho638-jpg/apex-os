import { logger } from '@/lib/logger';
/**
 * Hook for Real Portfolio Returns
 * 
 * Fetches trade history and calculates actual P&L returns (not mock data)
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateFakeTrades } from '@/lib/utils/testDataGenerator';

export interface TradeHistory {
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice?: number;
    size: number;
    leverage: number;
    entryTime: number;
    exitTime?: number;
    pnl?: number;
    pnlPercent?: number;
}

export function useRealPortfolioReturns(userId?: string, demoMode: boolean = false) {
    const supabase = createClient();
    const [returns, setReturns] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [trades, setTrades] = useState<TradeHistory[]>([]);
    const [isDemo, setIsDemo] = useState(demoMode);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            let targetUserId = userId;

            // 1. If no userId provided, try to get current session
            if (!targetUserId && !demoMode) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    targetUserId = user.id;
                } else {
                    // No user logged in -> Auto-enable Demo Mode
                    setIsDemo(true);
                }
            }

            // 2. If Demo Mode (explicit or auto-fallback)
            if (isDemo || demoMode) {
                logger.info('[useRealPortfolioReturns] Using DEMO DATA (Beta Launch Mode)');
                const fakeTrades = generateFakeTrades(50);

                const mappedTrades: TradeHistory[] = fakeTrades.map((t, i) => ({
                    id: `demo-${i}`,
                    symbol: t.symbol,
                    type: t.type,
                    entryPrice: t.entryPrice,
                    exitPrice: t.exitPrice,
                    size: t.size,
                    leverage: t.leverage,
                    entryTime: Date.now() - (i * 86400000), // 1 day apart
                    exitTime: Date.now() - (i * 86400000) + 3600000,
                    pnl: (t.size * t.leverage) * (t.pnlPercent / 100),
                    pnlPercent: t.pnlPercent
                }));

                setTrades(mappedTrades);
                setReturns(mappedTrades.map(t => t.pnlPercent || 0));
                setLoading(false);
                return;
            }

            // 3. Fetch Real Data
            try {
                if (!targetUserId) {
                    setReturns([]);
                    setLoading(false);
                    return;
                }

                const { data: positions, error: queryError } = await supabase
                    .from('positions')
                    .select('*')
                    .eq('user_id', targetUserId)
                    .not('exit_price', 'is', null)
                    .order('exit_time', { ascending: true });

                if (queryError) throw queryError;

                if (!positions || positions.length === 0) {
                    // User has no trades -> Show empty state (or could fallback to demo if we wanted)
                    setReturns([]);
                    setTrades([]);
                } else {
                    const tradeHistory: TradeHistory[] = positions.map((pos: any) => ({
                        id: pos.id,
                        symbol: pos.symbol,
                        type: pos.type,
                        entryPrice: pos.entry_price,
                        exitPrice: pos.exit_price,
                        size: pos.size,
                        leverage: pos.leverage || 1,
                        entryTime: new Date(pos.entry_time).getTime(),
                        exitTime: pos.exit_time ? new Date(pos.exit_time).getTime() : undefined,
                        pnl: pos.pnl,
                        pnlPercent: pos.pnl_percent
                    }));

                    setTrades(tradeHistory);
                    setReturns(tradeHistory.map(t => {
                        if (t.pnlPercent !== undefined) return t.pnlPercent;
                        // Fallback calc
                        const direction = t.type === 'LONG' ? 1 : -1;
                        const priceChange = (t.exitPrice! - t.entryPrice) / t.entryPrice;
                        return direction * priceChange * t.leverage * 100;
                    }));
                }
            } catch (err) {
                logger.error('[useRealPortfolioReturns] Error:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch trades'));
                // On error, maybe fallback to demo? No, better to show error.
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, demoMode, supabase, isDemo]);

    return {
        returns,
        trades,
        loading,
        error,
        tradeCount: trades.length,
        isDemo // Export this so UI can show "Demo Mode" badge
    };
}
