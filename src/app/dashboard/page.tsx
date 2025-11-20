"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp, Shield, Zap, Crown, Lock, ArrowRight,
    Activity, Wallet, Users, Bot, CheckCircle
} from 'lucide-react';
import { Sidebar } from '@/components/os/sidebar';
import { useUserTier } from '@/hooks/useUserTier';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import { usePnL, useRebates, useLeverage } from '@/hooks/useApi';

export default function DashboardPage() {
    const router = useRouter();
    const { tier, isFree, isFounders, slot, loading: tierLoading } = useUserTier();
    const { data: pnlData, loading: pnlLoading } = usePnL();
    const { data: rebateData, loading: rebateLoading } = useRebates();
    const { data: leverageData, loading: leverageLoading } = useLeverage();

    if (tierLoading) {
        return (
            <div className="flex h-screen w-full bg-[#0A0A0A] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF00] mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-hidden selection:bg-[#00FF00]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0A0A0A]/50 backdrop-blur-md">
                    <h2 className="text-xl font-semibold">Dashboard</h2>
                    <div className="flex items-center gap-4">
                        {isFounders && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Crown className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-500">Founders #{slot}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/20">
                            <div className="h-2 w-2 rounded-full bg-[#00FF00] animate-pulse" />
                            <span className="text-xs font-medium text-[#00FF00]">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-8 max-w-5xl mx-auto">

                        {/* Free User: Upgrade Banner */}
                        {isFree && <UpgradeBanner />}

                        {/* Metrics Row */}
                        <div className="grid grid-cols-3 gap-6">
                            <MetricCard
                                label={isFree ? "TOTAL PNL (30D)" : "TOTAL PNL (ALL-TIME)"}
                                value={pnlLoading ? "Loading..." : `${(pnlData?.total_pnl ?? 0) >= 0 ? '+' : ''}$${(pnlData?.total_pnl ?? 0).toFixed(2)}`}
                                subtext={pnlLoading ? "" : `${(pnlData?.win_rate ?? 0).toFixed(1)}% Win Rate`}
                                isPositive={(pnlData?.total_pnl ?? 0) >= 0}
                                icon={TrendingUp}
                            />

                            {isFounders ? (
                                <>
                                    <MetricCard
                                        label="FEES SAVED"
                                        value={rebateLoading ? "Loading..." : `$${(rebateData?.user_rebate ?? 0).toFixed(2)}`}
                                        subtext="AI Auditor Active"
                                        accentColor="text-emerald-400"
                                        icon={Zap}
                                    />
                                    <MetricCard
                                        label="REFERRAL EARNINGS"
                                        value="$47"
                                        subtext="3 Active Refs"
                                        accentColor="text-purple-400"
                                        icon={Users}
                                    />
                                </>
                            ) : (
                                <>
                                    <LockedMetricCard
                                        label="FEES SAVED"
                                        teaser="Est. $47/month"
                                    />
                                    <LockedMetricCard
                                        label="REFERRAL EARNINGS"
                                        teaser="20% commission"
                                    />
                                </>
                            )}
                        </div>

                        {/* Free: Locked Features Showcase */}
                        {isFree && (
                            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                                    <Lock className="text-yellow-500" size={20} />
                                    Unlock Premium Features
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <FeatureItem icon={Zap} text="Real-time Auto-Sync" />
                                    <FeatureItem icon={Bot} text="AI Fee Auditor" />
                                    <FeatureItem icon={Shield} text="24/7 Risk Guardian" />
                                    <FeatureItem icon={Users} text="20% Referral Income" />
                                </div>
                                <button
                                    onClick={() => router.push('/offer')}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Upgrade to Founders for $99 <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* Founders: Wolf Pack Status */}
                        {isFounders && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                                    <Bot className="text-emerald-500" size={20} />
                                    Wolf Pack Status
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <AgentStatus name="Collector" status="active" lastSync="2 min ago" color="blue" />
                                    <AgentStatus name="Auditor" status="alert" lastSync="Found $24 discrepancy" color="amber" />
                                    <AgentStatus name="Guardian" status="monitoring" lastSync="1 position at risk" color="emerald" />
                                    <AgentStatus name="Concierge" status="ready" lastSync="Ready for commands" color="purple" />
                                </div>
                            </div>
                        )}

                        {/* Guardian Alerts */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="h-5 w-5 text-[#00FF00]" />
                                    <h3 className="font-semibold">Guardian Alerts</h3>
                                </div>
                                <div className="space-y-3">
                                    <AlertItem level="info" message="Margin utilization stable at 15%." time="10m ago" />
                                    <AlertItem level="success" message="No liquidation risk detected." time="1h ago" />
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                    <h3 className="font-semibold">Agent Activity</h3>
                                </div>
                                <div className="space-y-2 text-xs font-mono text-gray-400">
                                    <div>[14:30] Collector: Synced 24 trades from Binance</div>
                                    <div>[14:25] Auditor: Scanning fee records...</div>
                                    <div>[14:20] Guardian: Risk check passed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ========== COMPONENTS ==========

interface MetricCardProps {
    label: string;
    value: string;
    subtext?: string;
    isPositive?: boolean;
    accentColor?: string;
    icon?: any;
}

function MetricCard({ label, value, subtext, isPositive, accentColor = "text-[#00FF00]", icon: Icon }: MetricCardProps) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</div>
                {Icon && <Icon className={`h-5 w-5 ${accentColor}`} />}
            </div>
            <div className={`text-3xl font-bold mb-1 ${isPositive !== undefined ? (isPositive ? 'text-[#00FF00]' : 'text-red-400') : 'text-white'}`}>
                {value}
            </div>
            {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
        </div>
    );
}

function LockedMetricCard({ label, teaser }: { label: string; teaser: string }) {
    return (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center">
                <Lock className="text-yellow-500" size={32} />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{label}</div>
            <div className="text-3xl font-bold text-white/20 mb-1">$—</div>
            <div className="text-xs text-yellow-500">{teaser}</div>
        </div>
    );
}

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <div className="flex items-center gap-2 text-sm text-zinc-300">
            <CheckCircle className="text-emerald-500" size={16} />
            <Icon className="text-zinc-400" size={16} />
            <span>{text}</span>
        </div>
    );
}

function AgentStatus({ name, status, lastSync, color }: { name: string; status: string; lastSync: string; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    };

    return (
        <div className={`border rounded-lg p-4 ${colorMap[color]}`}>
            <div className="font-bold text-sm mb-1">{name}</div>
            <div className="text-xs text-zinc-400">{status}</div>
            <div className="text-xs text-zinc-500 mt-2">{lastSync}</div>
        </div>
    );
}

interface AlertItemProps {
    level: 'info' | 'success' | 'warning' | 'danger';
    message: string;
    time: string;
}

function AlertItem({ level, message, time }: AlertItemProps) {
    const levelColors = {
        info: 'text-blue-400',
        success: 'text-[#00FF00]',
        warning: 'text-yellow-400',
        danger: 'text-red-400'
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <div className={`h-2 w-2 rounded-full ${levelColors[level]} mt-1.5`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{message}</p>
                <p className="text-xs text-gray-500 mt-1">{time}</p>
            </div>
        </div>
    );
}
