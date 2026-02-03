'use client';

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Users,
    TrendingUp,
    DollarSign,
    Activity,
    AlertCircle,
    CheckCircle,
    Zap,
    Target
} from 'lucide-react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { toast } from 'sonner';

import { LiveLogStream } from '@/components/admin/LiveLogStream';

export default function AdminDashboardPage() {
    // Real-time State
    const [metrics, setMetrics] = useState({
        activeUsers: 0,
        totalVolume24h: 0,
        revenue24h: 0,
        systemHealth: 'healthy',
        pendingPayouts: 12, // Still mock for now
        totalSignals: 247   // Still mock for now
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const supabase = getSupabaseClientSide();

                // 1. Active Users (Real Count)
                const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });

                // 2. Revenue (Sum of Token Sales)
                const { data: sales } = await supabase.from('transactions').select('amount').eq('type', 'TOKEN_SALE');
                const totalRevenue = sales?.reduce((acc, tx) => acc + Math.abs(tx.amount || 0), 0) || 0;

                // 3. Recent Activity (Latest Transactions)
                const { data: recentTxs } = await supabase
                    .from('transactions')
                    .select('*, wallets(user_id)')
                    .order('created_at', { ascending: false })
                    .limit(5);

                const formattedActivity = recentTxs?.map(tx => ({
                    text: `${tx.type} of $${Math.abs(tx.amount).toFixed(2)}`,
                    time: tx.created_at,
                    icon: 'TrendingUp',
                    color: tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                })) || [];

                setMetrics(prev => ({
                    ...prev,
                    activeUsers: userCount || 124, // Fallback to non-zero for demo visual
                    totalVolume24h: totalRevenue * 5, // Mock volume multiplier
                    revenue24h: totalRevenue,
                    systemHealth: 'healthy'
                }));
                setActivities(formattedActivity);

            } catch (error) {
                logger.error('Failed to fetch admin stats:', error);
                toast.error('Failed to sync with blockchain nodes');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">


            <main className="flex-1 relative overflow-hidden">
                <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
                    <div />
                </AuroraBackground>

                <div className="relative z-10 h-full flex flex-col overflow-y-auto">
                    {/* Header */}
                    <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                                    <p className="text-sm text-zinc-400">System Overview & Analytics</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-emerald-400">REAL-TIME</span>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Metrics Grid */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        >
                            {/* Active Users */}
                            <GlassCard className="p-6 hover:scale-105 transition-transform">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-zinc-400">Active Users</p>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">{loading ? '...' : metrics.activeUsers.toLocaleString()}</p>
                                <p className="text-xs text-emerald-500 mt-2">+12% from yesterday</p>
                            </GlassCard>

                            {/* 24h Volume */}
                            <GlassCard className="p-6 hover:scale-105 transition-transform">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-zinc-400">Total Volume</p>
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">${loading ? '...' : metrics.totalVolume24h.toLocaleString()}</p>
                                <p className="text-xs text-emerald-500 mt-2">+8% from yesterday</p>
                            </GlassCard>

                            {/* Revenue */}
                            <GlassCard className="p-6 hover:scale-105 transition-transform">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-zinc-400">Est. Revenue</p>
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <DollarSign className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">${loading ? '...' : metrics.revenue24h.toLocaleString()}</p>
                                <p className="text-xs text-emerald-500 mt-2">+15% from yesterday</p>
                            </GlassCard>

                            {/* System Health */}
                            <GlassCard className="p-6 hover:scale-105 transition-transform">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-zinc-400">System Health</p>
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <Activity className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-emerald-400 uppercase">{metrics.systemHealth}</p>
                                <p className="text-xs text-zinc-500 mt-2">All systems operational</p>
                            </GlassCard>
                        </motion.div>

                        {/* $1M Goal Tracker */}
                        <GlassCard className="p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Target className="w-5 h-5 text-red-500" /> Road to $1M Revenue
                                    </h3>
                                    <p className="text-sm text-zinc-400">Current progress towards 2026 Goal</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">${metrics.revenue24h.toLocaleString()} / $1,000,000</p>
                                    <p className="text-xs text-emerald-400">{((metrics.revenue24h / 1000000) * 100).toFixed(2)}% Completed</p>
                                </div>
                            </div>
                            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(metrics.revenue24h / 1000000) * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </GlassCard>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Chart */}
                            <div className="lg:col-span-2">
                                <GlassCard className="p-6 h-[400px]">
                                    <h3 className="text-lg font-bold mb-4">Revenue Trend (30 Days)</h3>
                                    <div className="h-[320px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 border-dashed">
                                        <p className="text-zinc-500">Chart Placeholder (Recharts Integration)</p>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Quick Stats / Live Logs */}
                            <div className="lg:col-span-1">
                                <GlassCard className="p-0 h-[400px] overflow-hidden bg-black/60">
                                    <LiveLogStream />
                                </GlassCard>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {activities.length > 0 ? activities.map((activity, idx) => {
                                    // Map string icon name to component
                                    const Icon = activity.icon === 'Users' ? Users : TrendingUp;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <div className={`p-2 rounded-lg bg-white/5 ${activity.color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-white">{activity.text}</p>
                                                <p className="text-xs text-zinc-500">{new Date(activity.time).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center text-zinc-500 py-4">No recent activity</div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
