'use client';

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CreditCard
} from 'lucide-react';

export default function AdminFinancePage() {
    const [stats, setStats] = useState({
        revenue: 0,
        payouts: 0,
        pending: 0,
        profit: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/v1/system/stats');
                const data = await res.json();

                if (data.success) {
                    setStats({
                        revenue: data.data.revenue,
                        payouts: data.data.finance.totalPayouts,
                        pending: data.data.finance.pendingWithdrawals,
                        profit: data.data.revenue - data.data.finance.totalPayouts
                    });
                }
            } catch (error) {
                logger.error('Failed to fetch finance stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <main className="flex-1 relative overflow-hidden">
                <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
                    <div />
                </AuroraBackground>

                <div className="relative z-10 h-full flex flex-col overflow-y-auto">
                    <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <Wallet className="h-7 w-7 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Treasury & Finance</h1>
                                <p className="text-sm text-zinc-400">Manage liquidity and payouts</p>
                            </div>
                        </div>
                    </header>

                    <div className="p-6 space-y-6">
                        {/* Main Stats */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-4 gap-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">Total Revenue</span>
                                    <DollarSign className="text-emerald-400" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-400">
                                    ${loading ? '...' : stats.revenue.toLocaleString()}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">Total Payouts</span>
                                    <ArrowUpRight className="text-blue-400" />
                                </div>
                                <div className="text-3xl font-bold text-blue-400">
                                    ${loading ? '...' : stats.payouts.toLocaleString()}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">Net Profit</span>
                                    <Wallet className="text-purple-400" />
                                </div>
                                <div className="text-3xl font-bold text-purple-400">
                                    ${loading ? '...' : stats.profit.toLocaleString()}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">Pending Withdrawals</span>
                                    <Clock className="text-yellow-400" />
                                </div>
                                <div className="text-3xl font-bold text-yellow-400">
                                    {loading ? '...' : stats.pending}
                                </div>
                                <div className="mt-2 text-xs text-zinc-500">Action Required</div>
                            </GlassCard>
                        </motion.div>

                        {/* Placeholder for Transaction List */}
                        <GlassCard className="p-8 text-center border-dashed border-white/10">
                            <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-zinc-400">Transaction Ledger</h3>
                            <p className="text-zinc-600">Detailed transaction history coming in Phase 2</p>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
