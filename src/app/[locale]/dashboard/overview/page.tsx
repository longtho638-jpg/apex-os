'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    Activity,
    Users,
    ArrowRight,
    Zap,
    Target,
    Award
} from 'lucide-react';
import { AgentActivityLog } from '@/components/dashboard/AgentActivityLog';
import { WhaleWatcherWidget } from '@/components/dashboard/WhaleWatcherWidget';
import { ArbitrageScannerWidget } from '@/components/dashboard/ArbitrageScannerWidget';
import { SystemHealthMesh } from '@/components/dashboard/SystemHealthMesh';

export default function DashboardOverviewPage() {
    const [metrics, setMetrics] = useState({
        totalEarnings: 2847.32,
        activeReferrals: 12,
        conversionRate: 68,
        signalsGenerated: 247
    });

    return (
        <div className="min-h-screen bg-[#030303] text-white p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard Overview</h1>
                    <p className="text-zinc-400">Welcome back! Here's your trading performance summary.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        icon={<DollarSign className="w-6 h-6" />}
                        label="Total Earnings"
                        value={`$${metrics.totalEarnings.toLocaleString()}`}
                        change="+12.5%"
                        positive
                    />
                    <MetricCard
                        icon={<Users className="w-6 h-6" />}
                        label="Active Referrals"
                        value={metrics.activeReferrals}
                        change="+3"
                        positive
                    />
                    <MetricCard
                        icon={<Target className="w-6 h-6" />}
                        label="Win Rate"
                        value={`${metrics.conversionRate}%`}
                        change="+5%"
                        positive
                    />
                    <MetricCard
                        icon={<Zap className="w-6 h-6" />}
                        label="AI Signals"
                        value={metrics.signalsGenerated}
                        change="+47"
                        positive
                    />
                </div>

                {/* Live Market Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 h-[400px]">
                    <WhaleWatcherWidget />
                    <ArbitrageScannerWidget />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1">
                        <SystemHealthMesh />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <QuickActionCard
                            title="AI Trading Signals"
                            description="View real-time AI-powered trading signals"
                            icon={<Zap className="w-8 h-8" />}
                            link="/en/dashboard/signals"
                            color="emerald"
                        />
                        <QuickActionCard
                            title="Referral Program"
                            description="Earn commissions by referring traders"
                            icon={<Users className="w-8 h-8" />}
                            link="/en/dashboard/referrals"
                            color="blue"
                        />
                    </div>
                </div>

                {/* Agent Activity Log (Live System Status) */}
                <div className="h-[400px] mb-8">
                    <AgentActivityLog />
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    change,
    positive
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change: string;
    positive: boolean;
}) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    {icon}
                </div>
                <span className={`text-sm font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change}
                </span>
            </div>
            <p className="text-zinc-400 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </motion.div>
    );
}

function QuickActionCard({
    title,
    description,
    icon,
    link,
    color
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    color: 'emerald' | 'blue';
}) {
    const colorClasses = color === 'emerald'
        ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50'
        : 'from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:border-blue-500/50';

    return (
        <Link href={link}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${colorClasses} border rounded-2xl p-6 cursor-pointer transition-all`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm">{description}</p>
            </motion.div>
        </Link>
    );
}
