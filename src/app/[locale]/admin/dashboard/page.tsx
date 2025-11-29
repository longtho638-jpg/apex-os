'use client';

import React from 'react';
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
    Zap
} from 'lucide-react';

export default function AdminDashboardPage() {
    // Mock data for demo (replace with real API calls later)
    const metrics = {
        activeUsers: 1247,
        totalVolume24h: 2847325,
        revenue24h: 24500,
        systemHealth: 'healthy' as const,
        pendingPayouts: 12,
        totalSignals: 247
    };

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
                                <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
                                <p className="text-xs text-emerald-500 mt-2">+12% from yesterday</p>
                            </GlassCard>

                            {/* 24h Volume */}
                            <GlassCard className="p-6 hover:scale-105 transition-transform">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-zinc-400">24h Volume</p>
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">${(metrics.totalVolume24h / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-emerald-500 mt-2">+8% from yesterday</p>
                            </GlassCard>

                            {/* Revenue */}
                            <GlassCard className="p-6 hover:scale-105 transition-transform">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-zinc-400">24h Revenue</p>
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <DollarSign className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold">${(metrics.revenue24h / 1000).toFixed(1)}K</p>
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
                                <p className="text-2xl font-bold text-emerald-400">HEALTHY</p>
                                <p className="text-xs text-zinc-500 mt-2">All systems operational</p>
                            </GlassCard>
                        </motion.div>

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

                            {/* Quick Stats */}
                            <div className="lg:col-span-1">
                                <GlassCard className="p-6 h-[400px]">
                                    <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-5 h-5 text-yellow-400" />
                                                <span className="text-sm">AI Signals</span>
                                            </div>
                                            <span className="font-bold">{metrics.totalSignals}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                                <span className="text-sm">Pending Payouts</span>
                                            </div>
                                            <span className="font-bold">{metrics.pendingPayouts}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-blue-400" />
                                                <span className="text-sm">API Status</span>
                                            </div>
                                            <span className="font-bold text-emerald-400">Online</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                                <span className="text-sm">Alerts</span>
                                            </div>
                                            <span className="font-bold text-red-400">0</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Users, text: 'New user signup: user_8472', time: '2 minutes ago', color: 'text-blue-400' },
                                    { icon: TrendingUp, text: 'Trading signal generated for BTC', time: '5 minutes ago', color: 'text-emerald-400' },
                                    { icon: DollarSign, text: 'Commission earned: $24.50', time: '12 minutes ago', color: 'text-purple-400' },
                                    { icon: CheckCircle, text: 'Payout processed successfully', time: '1 hour ago', color: 'text-green-400' }
                                ].map((activity, idx) => {
                                    const Icon = activity.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <div className={`p-2 rounded-lg bg-white/5 ${activity.color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-white">{activity.text}</p>
                                                <p className="text-xs text-zinc-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}