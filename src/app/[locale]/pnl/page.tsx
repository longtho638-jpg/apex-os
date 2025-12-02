"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { TrendingUp, TrendingDown, RefreshCw, Calendar, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePnLSummary } from '@/hooks/usePnLSummary';
import { PnLPeriod } from '@/lib/api/pnl';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { getSupabaseClientSide } from '@/lib/supabase';
import { WowEmptyState } from '@/components/ui/WowEmptyState';
import { useRouter } from 'next/navigation';

export default function PnLPage() {
    const router = useRouter();
    const t = useTranslations('PnL');
    const [period, setPeriod] = useState<PnLPeriod>('30d');
    const { data, loading, error, refetch } = usePnLSummary(period);
    const { available, locked } = useWallet();
    const [realPnL, setRealPnL] = useState(0);

    // Calculate Real PnL based on Wallet vs Deposits
    React.useEffect(() => {
        const calcPnL = async () => {
            const supabase = getSupabaseClientSide();
            // Use lowercase 'deposit' to match the database constraint
            const { data: txs } = await supabase.from('transactions').select('amount').eq('type', 'deposit');
            const totalDeposited = txs?.reduce((acc, tx) => acc + (tx.amount || 0), 0) || 1000; // Default 1000 for demo
            const totalEquity = available + locked;
            setRealPnL(totalEquity - totalDeposited);
        };
        calcPnL();
    }, [available, locked]);

    const periods: { value: PnLPeriod; label: string }[] = [
        { value: '7d', label: t('7d') },
        { value: '30d', label: t('30d') },
        { value: '90d', label: t('90d') },
        { value: '1y', label: t('1y') },
    ];

    const handleShare = async () => {
        const text = `🚀 My PnL on ApexOS: ${realPnL >= 0 ? '+' : ''}$${realPnL.toFixed(2)} (${((realPnL / 1000) * 100).toFixed(1)}% ROI)\nJoin the Wolf Pack!`;
        navigator.clipboard.writeText(text);
        toast.success('PnL Stats Copied!', { description: 'Ready to paste on Twitter/Telegram.' });
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
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
                            <h1 className="text-lg font-bold tracking-tight">{t('title')}</h1>
                            <p className="text-xs text-gray-400">{t('subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Period Selector */}
                        <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                            {periods.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                        period === p.value
                                            ? "bg-[#00FF94]/20 text-[#00FF94] border border-[#00FF94]/30"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-lg bg-[#00FF94]/10 hover:bg-[#00FF94]/20 border border-[#00FF94]/20 text-[#00FF94] transition-all"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {/* Error State */}
                    {error && (
                        <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                            <p className="text-red-400 mb-2 font-medium">{t('error_loading')}</p>
                            <p className="text-sm text-gray-400">{error.message}</p>
                            <button
                                onClick={refetch}
                                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                            >
                                {t('retry')}
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !data && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-24 mb-4" />
                                        <div className="h-8 bg-white/10 rounded w-32" />
                                    </div>
                                ))}
                            </div>
                            <div className="glass-card rounded-xl p-6 h-80 animate-pulse">
                                <div className="h-full bg-white/5 rounded" />
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {data && !loading && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-6">
                                {/* Total PnL */}
                                <div className="glass-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">{t('total_pnl')}</span>
                                        {data.total_pnl >= 0 ? (
                                            <TrendingUp className="h-4 w-4 text-[#00FF94]" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                    <div className={cn(
                                        "text-3xl font-bold",
                                        realPnL >= 0 ? "text-[#00FF94]" : "text-red-500"
                                    )}>
                                        {realPnL >= 0 ? '+' : ''}{realPnL.toFixed(2)} USD
                                    </div>
                                </div>

                                {/* Win Rate */}
                                <div className="glass-card rounded-xl p-6">
                                    <span className="text-sm text-gray-400 block mb-2">{t('win_rate')}</span>
                                    <div className="text-3xl font-bold text-white">
                                        {data.win_rate.toFixed(1)}%
                                    </div>
                                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00FF94]"
                                            style={{ width: `${data.win_rate}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Total Trades */}
                                <div className="glass-card rounded-xl p-6">
                                    <span className="text-sm text-gray-400 block mb-2">{t('total_trades')}</span>
                                    <div className="text-3xl font-bold text-white">
                                        {data.total_trades}
                                    </div>
                                </div>
                            </div>

                            {/* PnL Chart */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">{t('chart_title')}</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.daily_pnl}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="rgba(255,255,255,0.5)"
                                            tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.5)"
                                            tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0,0,0,0.9)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="pnl"
                                            stroke="#00FF94"
                                            strokeWidth={2}
                                            dot={{ fill: '#00FF94', r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Trade Breakdown Table */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">{t('breakdown_title')}</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                <th className="pb-3">{t('col_symbol')}</th>
                                                <th className="pb-3 text-right">{t('col_pnl')}</th>
                                                <th className="pb-3 text-right">{t('col_trades')}</th>
                                                <th className="pb-3 text-right">{t('col_win_rate')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {data.trade_breakdown?.map((item, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-3 font-mono font-bold">{item.symbol}</td>
                                                    <td className={cn(
                                                        "py-3 text-right font-bold",
                                                        item.pnl >= 0 ? "text-[#00FF94]" : "text-red-500"
                                                    )}>
                                                        {item.pnl >= 0 ? '+' : ''}{item.pnl.toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-300">{item.trades}</td>
                                                    <td className="py-3 text-right text-gray-300">{item.win_rate.toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Best/Worst Pairs */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/20">
                                        <div className="text-xs text-gray-400 mb-1">{t('best_performer')}</div>
                                        <div className="text-lg font-bold text-[#00FF94]">{data.best_pair}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <div className="text-xs text-gray-400 mb-1">{t('worst_performer')}</div>
                                        <div className="text-lg font-bold text-red-500">{data.worst_pair}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Empty State for no trades */}
                            {data.total_trades === 0 && (
                                <div className="mt-8">
                                    <WowEmptyState
                                        title={t('no_trades_title')}
                                        description={t('no_trades_desc')}
                                        icon={TrendingUp}
                                        action={{
                                            label: "Start Trading",
                                            onClick: () => router.push('/en/trade')
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
