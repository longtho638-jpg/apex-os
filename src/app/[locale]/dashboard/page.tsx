"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp, Shield, Zap, Crown, Lock, ArrowRight,
    Activity, Wallet, Users, Bot, CheckCircle, BarChart3
} from 'lucide-react';
import { Sidebar } from '@/components/os/sidebar';
import { useUserTier } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import { usePnL, useRebates, useLeverage } from '@/hooks/useApi';
import ApexIdentityEngine from '@/components/dashboard/ZenWidget';
import ConnectExchange from '@/components/dashboard/ConnectExchange';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { tier, isFree, isFounders, slot, loading: tierLoading } = useUserTier();
    const { data: pnlData, loading: pnlLoading } = usePnL();
    const { data: rebateData, loading: rebateLoading } = useRebates();
    const t = useTranslations('Dashboard');
    const tCommon = useTranslations('Common');

    // Protect route
    React.useEffect(() => {
        if (typeof window !== 'undefined' && !isAuthenticated && !localStorage.getItem('apex_token')) {
            router.push('/landing');
        }
    }, [isAuthenticated, router]);

    if (tierLoading || !user) {
        return (
            <div className="flex h-screen w-full bg-[#030303] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF94] mx-auto mb-4 shadow-[0_0_20px_rgba(0,255,148,0.3)]"></div>
                    <p className="text-gray-400 animate-pulse">{tCommon('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 z-10">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
                        <p className="text-sm text-gray-400">Welcome back, <span className="text-white font-medium">{user.email?.split('@')[0]}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        {isFounders && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 shadow-[0_0_15px_rgba(0,255,148,0.1)]">
                                <Crown className="h-4 w-4 text-[#00FF94]" />
                                <span className="text-xs font-bold text-[#00FF94] tracking-wide">FOUNDERS #{slot}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <div className="h-2 w-2 rounded-full bg-[#00FF94] animate-pulse shadow-[0_0_10px_#00FF94]" />
                            <span className="text-xs font-medium text-gray-300">{t('system_online')}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 z-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Free User: Upgrade Banner */}
                        {isFree && <UpgradeBanner />}

                        <BentoGrid>
                            {/* PnL Card */}
                            <BentoGridItem
                                title={isFree ? t('total_pnl_30d') : t('total_pnl_all_time')}
                                description={
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", (pnlData?.total_pnl ?? 0) >= 0 ? "bg-[#00FF94]/10 text-[#00FF94]" : "bg-red-500/10 text-red-400")}>
                                            {(pnlData?.win_rate ?? 0).toFixed(1)}% Win Rate
                                        </span>
                                    </div>
                                }
                                header={
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-[#00FF94]/10">
                                            <TrendingUp className="h-5 w-5 text-[#00FF94]" />
                                        </div>
                                        <Activity className="h-4 w-4 text-gray-500" />
                                    </div>
                                }
                                icon={
                                    <div className="text-3xl font-bold text-white mt-2">
                                        {pnlLoading ? "..." : `${(pnlData?.total_pnl ?? 0) >= 0 ? '+' : ''}$${(pnlData?.total_pnl ?? 0).toFixed(2)}`}
                                    </div>
                                }
                                className="md:col-span-1"
                            />

                            {/* Rebates / Fees Saved */}
                            <BentoGridItem
                                title={t('fees_saved')}
                                description={isFounders ? t('ai_auditor_active') : t('est_monthly')}
                                header={
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
                                            <Zap className="h-5 w-5 text-[#8B5CF6]" />
                                        </div>
                                        {isFree && <Lock className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                }
                                icon={
                                    <div className={cn("text-3xl font-bold mt-2", isFree ? "text-white/20 blur-sm" : "text-white")}>
                                        {isFree ? "$1,240.50" : (rebateLoading ? "..." : `$${(rebateData?.user_rebate ?? 0).toFixed(2)}`)}
                                    </div>
                                }
                                className={cn("md:col-span-1", isFree && "cursor-pointer hover:border-yellow-500/30")}
                            />

                            {/* Referrals / Community */}
                            <BentoGridItem
                                title={t('referral_earnings')}
                                description={isFounders ? t('active_refs', { count: 3 }) : t('commission')}
                                header={
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-[#06B6D4]/10">
                                            <Users className="h-5 w-5 text-[#06B6D4]" />
                                        </div>
                                        {isFree && <Lock className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                }
                                icon={
                                    <div className={cn("text-3xl font-bold mt-2", isFree ? "text-white/20 blur-sm" : "text-white")}>
                                        {isFree ? "$450.00" : "$47.00"}
                                    </div>
                                }
                                className={cn("md:col-span-1", isFree && "cursor-pointer hover:border-yellow-500/30")}
                            />

                            {/* Main Feature Area: Wolf Pack or Locked Features */}
                            <div className="md:col-span-2 row-span-2 glass-panel rounded-xl p-6 relative overflow-hidden group">
                                {isFounders ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                                <Bot className="h-6 w-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{t('wolf_pack')}</h3>
                                                <p className="text-xs text-gray-400">AI Agent Swarm Status</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <AgentStatus name="Collector" status="active" lastSync="2 min ago" color="blue" />
                                            <AgentStatus name="Auditor" status="alert" lastSync="Found $24 discrepancy" color="amber" />
                                            <AgentStatus name="Guardian" status="monitoring" lastSync="1 position at risk" color="emerald" />
                                            <AgentStatus name="Concierge" status="ready" lastSync="Ready for commands" color="purple" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                                <Lock className="h-6 w-6 text-yellow-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">{t('unlock_premium')}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                            <FeatureItem icon={Zap} text={t('feature_sync')} />
                                            <FeatureItem icon={Bot} text={t('feature_auditor')} />
                                            <FeatureItem icon={Shield} text={t('feature_guardian')} />
                                            <FeatureItem icon={Users} text={t('feature_referral')} />
                                        </div>

                                        <button
                                            onClick={() => router.push('/offer')}
                                            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-500/20"
                                        >
                                            {t('upgrade_button')} <ArrowRight size={18} />
                                        </button>

                                        {/* Background decoration for locked state */}
                                        <div className="absolute -right-10 -bottom-10 opacity-10">
                                            <Lock size={200} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Identity Engine / Zen Widget */}
                            <div className="md:col-span-1 row-span-2">
                                <ApexIdentityEngine currentPrice={87064.05} />
                            </div>

                            {/* Exchange Uplink */}
                            <div className="md:col-span-3">
                                <ConnectExchange />
                            </div>

                        </BentoGrid>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ========== SUB-COMPONENTS ==========

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-gray-300 p-3 rounded-lg bg-white/5 border border-white/5">
            <CheckCircle className="text-[#00FF94]" size={16} />
            <span>{text}</span>
        </div>
    );
}

function AgentStatus({ name, status, lastSync, color }: { name: string; status: string; lastSync: string; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
        amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]',
    };

    return (
        <div className={`border rounded-xl p-4 ${colorMap[color]} transition-all hover:scale-[1.02]`}>
            <div className="font-bold text-sm mb-1 flex items-center justify-between">
                {name}
                <div className={`h-1.5 w-1.5 rounded-full animate-pulse bg-current`} />
            </div>
            <div className="text-xs opacity-80 font-medium uppercase tracking-wider">{status}</div>
            <div className="text-[10px] opacity-60 mt-2 font-mono">{lastSync}</div>
        </div>
    );
}

