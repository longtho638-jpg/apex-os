"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, RefreshCw, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { fetchTradeHistory, fetchMarketConditions, triggerSync } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Sidebar } from '@/components/os/sidebar';
import TradingChart from '@/components/TradingChart';
import { cn } from '@/lib/utils';

export default function TradePage() {
    const { user, isAuthenticated } = useAuth();
    const [marketData, setMarketData] = useState<any>(null);
    const [trades, setTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const t = useTranslations('Trade');
    const tCommon = useTranslations('Common');

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const [market, history] = await Promise.all([
                    fetchMarketConditions('BTC/USDT'),
                    fetchTradeHistory(user.id, 'BTC/USDT')
                ]);
                setMarketData(market);
                if (history && history.trades) {
                    setTrades(history.trades);
                }
            } catch (error) {
                console.error("Failed to load trade data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await triggerSync('demo-user', 'binance', 'demo-key', 'demo-secret');
            alert(t('sync_success'));
        } catch (error) {
            alert(t('sync_fail'));
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#00FF94]/10 rounded-lg border border-[#00FF94]/20 shadow-[0_0_15px_rgba(0,255,148,0.1)]">
                            <TrendingUp className="h-5 w-5 text-[#00FF94]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                BTC/USDT
                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-400 font-mono">PERP</span>
                            </h1>
                        </div>
                    </div>

                    {/* Market Stats Ticker */}
                    <div className="flex items-center gap-6">
                        {marketData && (
                            <>
                                <div className="flex flex-col items-end">
                                    <div className="text-sm font-mono font-bold text-white">{marketData.price?.toFixed(2)}</div>
                                    <div className="text-[10px] text-gray-500">Mark Price</div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="flex flex-col items-end">
                                    <div className={cn("text-sm font-mono font-bold", marketData.spread > 0 ? "text-[#00FF94]" : "text-red-500")}>
                                        {marketData.spread_percent}
                                    </div>
                                    <div className="text-[10px] text-gray-500">24h Change</div>
                                </div>
                            </>
                        )}
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00FF94] animate-pulse shadow-[0_0_10px_#00FF94]" />
                            <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">{t('system_active')}</span>
                        </div>
                    </div>
                </header>

                {/* Content Grid */}
                <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden z-10">

                    {/* Main Chart - Takes up most space */}
                    <div className="col-span-9 flex flex-col gap-4">
                        <div className="flex-1 glass-panel rounded-xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030303]/50 pointer-events-none z-10" />
                            <TradingChart />
                        </div>

                        {/* Quick Stats / Agent Controls */}
                        <div className="h-48 grid grid-cols-3 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-xl p-5 flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-gray-400">{t('market_status')}</h3>
                                    <Activity className="h-4 w-4 text-[#00FF94]" />
                                </div>
                                {marketData ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">{t('volatility')}</span>
                                            <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-500" style={{ width: marketData.volatility_percent }} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">{t('spread')}</span>
                                            <span className="text-xs font-mono text-blue-400">{marketData.spread_percent}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 animate-pulse">Loading data...</div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card rounded-xl p-5 flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-gray-400">{t('agent_controls')}</h3>
                                    <div className="h-2 w-2 rounded-full bg-[#00FF94] shadow-[0_0_10px_#00FF94]" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">{t('risk_level')}</span>
                                        <span className="text-[#00FF94] font-bold">{t('risk_moderate')}</span>
                                    </div>
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className="w-full py-2 bg-[#00FF94]/10 hover:bg-[#00FF94]/20 text-[#00FF94] text-xs font-bold uppercase tracking-wider border border-[#00FF94]/30 rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
                                        {syncing ? t('syncing') : t('sync_button')}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card rounded-xl p-5 flex flex-col justify-center items-center text-center"
                            >
                                <div className="text-xs text-gray-500 mb-1">Net PnL (24h)</div>
                                <div className="text-2xl font-bold text-[#00FF94] tracking-tight">+$1,240.50</div>
                                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3 text-[#00FF94]" />
                                    <span>12.5% vs yesterday</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Panel - Order Book / History */}
                    <div className="col-span-3 glass-panel rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="font-bold text-sm text-white">{t('history_title')}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <table className="w-full text-left text-xs">
                                <thead className="text-gray-500 sticky top-0 bg-[#030303]/80 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="pb-3 pl-2 font-medium">{t('col_price')}</th>
                                        <th className="pb-3 text-right font-medium">{t('col_amount')}</th>
                                        <th className="pb-3 text-right pr-2 font-medium">{t('col_time')}</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono">
                                    {trades.map((trade: any, i: number) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                                            <td className={cn("py-2 pl-2 font-medium", trade.side === 'buy' ? 'text-[#00FF94]' : 'text-red-500')}>
                                                {trade.price.toFixed(2)}
                                            </td>
                                            <td className="py-2 text-right text-gray-300">{trade.quantity}</td>
                                            <td className="py-2 text-right pr-2 text-gray-500 text-[10px]">
                                                {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                    {trades.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-gray-600 italic">
                                                {t('no_trades')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
