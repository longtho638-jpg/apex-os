"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Coins, RefreshCw, ArrowDownToLine, TrendingUp, Wallet, Calculator } from 'lucide-react';
import { useRebates } from '@/hooks/useRebates';
import { calculateEstimatedRebate } from '@/lib/api/rebates';
import { cn } from '@/lib/utils';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { WithdrawalModal } from '@/app/[locale]/finance/components/WithdrawalModal';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { ActiveFarmingTerminal } from '@/components/dashboard/ActiveFarmingTerminal';
import { useWallet } from '@/hooks/useWallet';
import { useUserTier } from '@/hooks/useUserTier';
import { Users } from 'lucide-react';

// Mock payment methods for demo (in real app, fetch these)
const MOCK_PAYMENT_METHODS = [
    { id: '1', type: 'crypto_wallet', name: 'USDT Wallet', details: { address: 'T9x...jK2', network: 'TRC20' }, is_default: true },
    { id: '2', type: 'bank_transfer', name: 'Vietcombank', details: { account_number: '**** 1234', bank_name: 'VCB' }, is_default: false }
];

export default function RebatesPage() {
    const t = useTranslations('Rebates');
    const { data, loading, refetch } = useRebates(60000);
    const { available, refresh: refreshWallet } = useWallet();
    const { tier } = useUserTier();
    const [calcVolume, setCalcVolume] = useState<string>('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<any[]>(MOCK_PAYMENT_METHODS);

    // Calculate dynamic rebate rate based on tier
    const rebateRate = tier === 'WHALE' ? 0.4 : tier === 'ELITE' ? 0.3 : tier === 'PRO' ? 0.2 : 0.1;
    const nextTierRate = tier === 'WHALE' ? 0.4 : tier === 'ELITE' ? 0.4 : tier === 'PRO' ? 0.3 : 0.2;
    const upgradePotential = ((nextTierRate - rebateRate) / rebateRate) * 100;

    // Prepare chart data
    const chartData = data?.rebate_history?.slice(0, 30).reverse().map(r => ({
        date: r.date.split('-').slice(1).join('/'),
        amount: r.amount
    })) || [];

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 relative overflow-hidden">
                <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
                    <div />
                </AuroraBackground>

                <div className="relative z-10 h-full flex flex-col overflow-y-auto">
                    {/* Header */}
                    <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <Coins className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-white">{t('title')}</h1>
                                <p className="text-xs text-emerald-400/80 font-medium tracking-wide uppercase">{t('subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group"
                            >
                                <ArrowDownToLine className="h-4 w-4 text-white group-hover:translate-y-0.5 transition-transform" />
                                <span className="text-sm font-bold text-white">{t('withdraw_btn')}</span>
                            </motion.button>

                            <button
                                onClick={refetch}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-zinc-400 hover:text-white"
                            >
                                <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-zinc-400 font-medium">{t('total_earned')}</p>
                                        <h2 className="text-4xl font-bold text-white mt-1 tracking-tight">
                                            ${(data?.total_rebates || 0).toFixed(2)}
                                        </h2>
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 py-1 px-2 rounded-lg w-fit">
                                    <span>+12.5%</span>
                                    <span className="text-zinc-500">{t('from_last_month')}</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-zinc-400 font-medium">{t('available_balance')}</p>
                                        <h2 className="text-4xl font-bold text-white mt-1 tracking-tight">
                                            ${available.toFixed(2)}
                                        </h2>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Wallet className="h-5 w-5 text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-500 mt-2">
                                    {t('ready_withdraw')}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calculator className="h-5 w-5 text-purple-400" />
                                    <h3 className="font-bold text-white">{t('calculator_title')}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">{t('volume_label')}</label>
                                        <input
                                            type="number"
                                            value={calcVolume}
                                            onChange={(e) => setCalcVolume(e.target.value)}
                                            placeholder="10,000"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500/50 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                        <span className="text-xs text-purple-300">{t('est_rebate')}</span>
                                        <span className="font-bold text-purple-400">
                                            ${calcVolume ? (parseFloat(calcVolume) * rebateRate / 100).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-500 text-center">
                                        Current Rate: <span className="text-emerald-400 font-bold">{rebateRate}%</span> ({tier})
                                        {tier !== 'WHALE' && (
                                            <div className="mt-1 text-yellow-500">
                                                Upgrade to get {nextTierRate}% (+{upgradePotential.toFixed(0)}% more)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Chart Section */}
                        <GlassCard className="p-6 h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">{t('chart_title')}</h3>
                                <div className="flex gap-2">
                                    {['1W', '1M', '3M', 'ALL'].map(period => (
                                        <button key={period} className={cn(
                                            "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                                            period === '1M' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                                        )}>
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#6B7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#6B7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Active Farming Terminal */}
                        <div className="h-[300px]">
                            <ActiveFarmingTerminal />
                        </div>

                        {/* Recent History */}
                        <GlassCard className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">{t('recent_activity')}</h3>
                                <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">{t('view_all')}</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                            <th className="pb-4 pl-4">{t('col_date')}</th>
                                            <th className="pb-4">{t('col_exchange')}</th>
                                            <th className="pb-4 text-right">{t('col_trades')}</th>
                                            <th className="pb-4 pr-4 text-right">{t('col_amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {(data?.rebate_history || []).slice(0, 5).map((rebate, idx) => (
                                            <tr key={idx} className="group border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-4 text-gray-300 group-hover:text-white transition-colors">{rebate.date}</td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-300 border border-white/10">
                                                        {rebate.exchange}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right text-zinc-400">{rebate.trades_count}</td>
                                                <td className="py-4 pr-4 text-right font-bold text-emerald-400">
                                                    +${(rebate.amount || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>

            <WithdrawalModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                balance={available}
                paymentMethods={paymentMethods}
                onSuccess={() => {
                    refetch();
                    refreshWallet();
                }}
            />
        </div>
    );
}