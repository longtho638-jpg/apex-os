"use client";

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, RefreshCw, ArrowUpRight, ChevronDown } from 'lucide-react';
import { fetchTradeHistory, fetchMarketConditions, triggerSync } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sidebar } from '@/components/os/sidebar';
import TradingChart from '@/components/TradingChart';
import IndicatorPanel, { DEFAULT_INDICATORS, IndicatorSettings } from '@/components/IndicatorPanel';
import DeepSeekInsight from '@/components/trading/DeepSeekInsight';
import { TOP_COINS } from '@/constants/trading';
import { cn } from '@/lib/utils';
import { useUserTier } from '@/hooks/useUserTier';
import { Crown } from 'lucide-react';

export default function TradePage() {
    const { user, isAuthenticated } = useAuth();
    const [selectedPair, setSelectedPair] = useState(TOP_COINS[0]);
    const [showPairs, setShowPairs] = useState(false);
    const [indicators, setIndicators] = useState<IndicatorSettings>(DEFAULT_INDICATORS);
    const [marketData, setMarketData] = useState<any>(null);
    const [trades, setTrades] = useState<any[]>([]);
    const [syncing, setSyncing] = useState(false);
    const t = useTranslations('Trade');
    const { tier } = useUserTier();

    // Fee Calculation
    const feeRate = tier === 'WHALE' ? 0 : tier === 'ELITE' ? 0.02 : tier === 'TRADER' ? 0.05 : 0.1;

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const loadData = async () => {
            try {
                const [market, history] = await Promise.all([
                    fetchMarketConditions(selectedPair.symbol),
                    fetchTradeHistory(user.id, selectedPair.symbol)
                ]);
                setMarketData(market);
                if (history && history.trades) {
                    setTrades(history.trades);
                }
            } catch (error) {
                logger.error("Failed to load trade data", error);
            }
        };

        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user, selectedPair]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await triggerSync('demo-user', 'binance', 'demo-key', 'demo-secret');
        } catch (error) {
            logger.error("Operation failed", error);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                </div>

                {/* Header with Coin Selector & Indicators */}
                <header className="h-16 flex items-center justify-between px-6 z-50 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md relative">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#00FF94]/10 rounded-lg border border-[#00FF94]/20 shadow-[0_0_15px_rgba(0,255,148,0.1)]">
                            <TrendingUp className="h-5 w-5 text-[#00FF94]" />
                        </div>

                        {/* Coin Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPairs(!showPairs)}
                                className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                            >
                                <div>
                                    <div className="text-lg font-bold flex items-center gap-2">
                                        {selectedPair.symbol}
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-zinc-400">PERP</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500">{selectedPair.name}</div>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 transition-transform", showPairs && "rotate-180")} />
                            </button>

                            {/* Dropdown */}
                            {showPairs && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                                    {TOP_COINS.map((coin) => (
                                        <button
                                            key={coin.symbol}
                                            onClick={() => {
                                                setSelectedPair(coin);
                                                setShowPairs(false);
                                            }}
                                            className={cn(
                                                "w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5",
                                                selectedPair.symbol === coin.symbol && "bg-[#00FF94]/10 border-l-2 border-l-[#00FF94]"
                                            )}
                                        >
                                            <div className="text-left">
                                                <div className="font-bold text-sm">{coin.symbol}</div>
                                                <div className="text-[10px] text-zinc-500">{coin.name}</div>
                                            </div>
                                            {selectedPair.symbol === coin.symbol && (
                                                <div className="h-2 w-2 rounded-full bg-[#00FF94]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Indicator Panel & System Status */}
                    <div className="flex items-center gap-4">
                        <IndicatorPanel settings={indicators} onUpdate={setIndicators} />

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00FF94] animate-pulse shadow-[0_0_10px_#00FF94]" />
                            <span className="text-[10px] font-medium text-gray-300 uppercase">BINANCE LIVE</span>
                        </div>

                        {/* Fee Tier Indicator */}
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border",
                            tier === 'WHALE' ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-zinc-400"
                        )}>
                            {tier === 'WHALE' && <Crown className="w-3 h-3" />}
                            <span className="text-[10px] font-medium">
                                Fee: {feeRate}% {tier === 'WHALE' ? '(VIP)' : ''}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content Grid */}
                <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden z-1">
                    {/* Main Chart */}
                    <div className="col-span-9 flex flex-col gap-4">
                        <div className="flex-1 glass-panel rounded-xl overflow-hidden relative">
                            <TradingChart
                                symbol={selectedPair.symbol}
                                basePrice={selectedPair.basePrice}
                                indicators={indicators}
                            />
                        </div>

                        {/* Quick Stats */}
                        <div className="h-48 grid grid-cols-3 gap-4">
                            <motion.div className="glass-card rounded-xl p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-zinc-400">{t('market_status')}</h3>
                                    <Activity className="h-4 w-4 text-[#00FF94]" />
                                </div>
                                {marketData && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500">{t('volatility')}</span>
                                            <span className="text-xs font-mono text-yellow-400">{marketData.volatility_percent}</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div className="glass-card rounded-xl p-5 flex flex-col justify-between">
                                <h3 className="text-sm font-medium text-zinc-400 mb-3">{t('agent_controls')}</h3>
                                <button
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className="w-full py-2 bg-[#00FF94]/10 hover:bg-[#00FF94]/20 text-[#00FF94] text-xs font-bold uppercase border border-[#00FF94]/30 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
                                    {syncing ? t('syncing') : t('sync_button')}
                                </button>
                            </motion.div>

                            <motion.div className="glass-card rounded-xl p-5 flex flex-col justify-center items-center">
                                <div className="text-xs text-zinc-500 mb-1">Net PnL (24h)</div>
                                <div className="text-2xl font-bold text-[#00FF94]">+$1,240.50</div>
                                <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3 text-[#00FF94]" />
                                    <span>12.5% vs yesterday</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: DeepSeek & History */}
                    <div className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
                        {/* DeepSeek Insight Panel */}
                        <div className="flex-1 min-h-[400px]">
                            <DeepSeekInsight
                                symbol={selectedPair.symbol}
                                onExecute={(strategy) => toast.success(`Executing ${strategy.signal} strategy`)}
                            />
                        </div>

                        {/* Trade History (Collapsed/Smaller) */}
                        <div className="h-1/3 glass-panel rounded-xl overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-bold text-xs text-zinc-400">{t('history_title')}</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                <table className="w-full text-xs">
                                    <tbody className="font-mono">
                                        {trades.slice(0, 5).map((trade, i) => ( // Show fewer trades
                                            <tr key={i} className="hover:bg-white/5">
                                                <td className={cn("py-1 pl-2", trade.side === 'buy' ? 'text-[#00FF94]' : 'text-red-500')}>
                                                    {trade.price.toFixed(2)}
                                                </td>
                                                <td className="py-1 text-right text-gray-300">{trade.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
