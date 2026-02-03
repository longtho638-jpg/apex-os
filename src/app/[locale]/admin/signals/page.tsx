'use client';

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import {
    Zap,
    Target,
    BarChart3,
    BrainCircuit,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function AdminSignalsPage() {
    const [stats, setStats] = useState({
        winRate: 0,
        totalSignals: 0,
        activeSignals: 0 // Placeholder for now
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/v1/system/stats');
                const data = await res.json();

                if (data.success) {
                    setStats({
                        winRate: data.data.signals.winRate,
                        totalSignals: data.data.signals.totalSignals,
                        activeSignals: 0 // Not yet in API
                    });
                }
            } catch (error) {
                logger.error('Failed to fetch signal stats:', error);
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
                            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <Zap className="h-7 w-7 text-yellow-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">AI Signal Intelligence</h1>
                                <p className="text-sm text-zinc-400">Monitor algorithm performance and accuracy</p>
                            </div>
                        </div>
                    </header>

                    <div className="p-6 space-y-6">
                        {/* Main Stats */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">Win Rate (Last 100)</span>
                                    <Target className="text-emerald-400" />
                                </div>
                                <div className="text-4xl font-black text-emerald-400">
                                    {loading ? '...' : `${stats.winRate.toFixed(1)}%`}
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.winRate}%` }}
                                    />
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">Total Signals</span>
                                    <BrainCircuit className="text-purple-400" />
                                </div>
                                <div className="text-4xl font-black text-purple-400">
                                    {loading ? '...' : stats.totalSignals}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-zinc-400">AI Status</span>
                                    <BarChart3 className="text-blue-400" />
                                </div>
                                <div className="text-4xl font-black text-blue-400">
                                    ACTIVE
                                </div>
                                <div className="text-xs text-zinc-500 mt-2">Model v4.2 Running</div>
                            </GlassCard>
                        </motion.div>

                        {/* Recent Signals Placeholder */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold mb-4">Signal Log</h3>
                            <div className="space-y-2">
                                {/* Mock rows for visual structure */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <span className="font-mono font-bold">BTC/USDT</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${i === 2 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {i === 2 ? 'SELL' : 'BUY'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-zinc-400 text-sm">ROI: {i === 2 ? '-1.2%' : '+4.5%'}</span>
                                            {i === 2 ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
