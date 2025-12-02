'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
    TrendingUp,
    DollarSign,
    Activity,
    Users,
    Target,
    Zap
} from 'lucide-react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useRisk } from '@/hooks/useRisk';
import { useGamification } from '@/hooks/useGamification';
import { Crown } from 'lucide-react';

// Lazy load widgets with skeletons
const AlgoVisualizer = dynamic(() => import('@/components/dashboard/AlgoVisualizer').then(mod => mod.AlgoVisualizer), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-zinc-600 text-xs font-mono">Initializing AI...</div>
});

const WhaleWatcherWidget = dynamic(() => import('@/components/dashboard/WhaleWatcherWidget').then(mod => mod.WhaleWatcherWidget), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />
});

const ArbitrageScannerWidget = dynamic(() => import('@/components/dashboard/ArbitrageScannerWidget').then(mod => mod.ArbitrageScannerWidget), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />
});

const SystemHealthMesh = dynamic(() => import('@/components/dashboard/SystemHealthMesh').then(mod => mod.SystemHealthMesh), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />
});

export default function DashboardOverviewPage() {
    const t = useTranslations('Dashboard');
    const { user } = useAuth();
    const { total, available, profit, loading: walletLoading } = useWallet();
    const { status: riskStatus, dailyLoss } = useRisk();
    const { level, xp, nextLevelXp } = useGamification();

    const [metrics, setMetrics] = useState({
        activeReferrals: 0,
        conversionRate: 68,
        signalsGenerated: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClientSide();

    useEffect(() => {
        if (!user) return;

        async function fetchMetrics() {
            try {
                const { count: referralCount } = await supabase
                    .from('users') // Changed from referral_network to users for simplicity in this phase
                    .select('*', { count: 'exact', head: true })
                    .eq('referred_by', user!.id);

                const { count: signalsCount } = await supabase
                    .from('orders') // Mocking signals count with orders for now
                    .select('*', { count: 'exact', head: true });

                setMetrics({
                    activeReferrals: referralCount || 0,
                    conversionRate: 68, // Keep hardcoded or calc from orders
                    signalsGenerated: signalsCount || 0
                });
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, [user]);

    return (
        <div className="flex flex-col h-full bg-[#030303] text-white p-4 font-sans overflow-hidden">
            {/* Header */}
            <div className="mb-4 flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-2xl font-bold mb-1 tracking-tight">{t('title')}</h1>
                    <p className="text-zinc-400 text-xs">{t('subtitle')}</p>
                </div>
            </div>

            {/* Responsive Layout: Scrollable Stack on Mobile, Bento Grid on Desktop */}
            <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-24 md:pb-0">
                <div className="flex flex-col md:grid md:grid-cols-12 md:grid-rows-12 gap-4 md:h-full">

                    {/* ROW 1-2: Metrics */}
                    <div className="md:col-span-12 md:row-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                        <MetricCard icon={<DollarSign className="w-5 h-5" />} label="Total Balance" value={total} loading={walletLoading} currency />
                        <MetricCard icon={<Users className="w-5 h-5" />} label={t('metrics.active_referrals')} value={metrics.activeReferrals} loading={loading} />
                        <MetricCard icon={<Target className="w-5 h-5" />} label="Daily PnL" value={-dailyLoss} loading={loading} currency suffix="" />
                        <MetricCard icon={<Zap className="w-5 h-5" />} label="Risk Status" value={0} customDisplay={riskStatus} loading={loading} />
                    </div>

                    {/* LEFT COLUMN (Main Tools) - Col 8 */}
                    <div className="md:col-span-8 md:row-span-10 flex flex-col md:grid md:grid-rows-2 gap-4 min-h-[400px] md:min-h-0">
                        <div className="h-[200px] md:h-auto md:row-span-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
                            <div className="absolute inset-0 p-1">
                                <WhaleWatcherWidget />
                            </div>
                        </div>
                        <div className="h-[200px] md:h-auto md:row-span-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
                            <div className="absolute inset-0 p-1">
                                <ArbitrageScannerWidget />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (AI & Actions) - Col 4 */}
                    <div className="md:col-span-4 md:row-span-10 flex flex-col md:grid md:grid-rows-3 gap-4 min-h-[400px] md:min-h-0">
                        {/* AI Core (Visualizer) */}
                        <div className="h-[300px] md:h-auto md:row-span-2 bg-black rounded-2xl border border-white/10 overflow-hidden relative shadow-lg shadow-emerald-900/10">
                            <div className="absolute inset-0">
                                <AlgoVisualizer />
                            </div>
                        </div>

                        {/* Quick Actions & Health */}
                        <div className="md:row-span-1 grid grid-cols-2 gap-4 h-24 md:h-auto">
                            <Link href="/en/dashboard/signals" className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4 flex flex-col justify-center items-center hover:bg-emerald-500/20 transition-all cursor-pointer group relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Zap className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform relative z-10" />
                                <span className="text-xs font-bold text-emerald-100 relative z-10">{t('quick_actions.ai_trading_signals')}</span>
                            </Link>
                            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative flex flex-col">
                                <div className="absolute inset-0 p-2">
                                    <SystemHealthMesh />
                                </div>
                                <div className="absolute bottom-2 w-full text-center text-[10px] text-zinc-500 font-mono">SYSTEM ONLINE</div>
                            </div>
                        </div>

                        {/* Gamification Widget */}
                        <div className="md:row-span-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-4 flex flex-col justify-center relative overflow-hidden">
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-purple-400" />
                                    <span className="font-bold text-white">Level {level}</span>
                                </div>
                                <span className="text-xs text-purple-300">{xp} / {nextLevelXp} XP</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden relative z-10">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${(xp / nextLevelXp) * 100}%` }} />
                            </div>
                            <div className="mt-2 text-[10px] text-zinc-400 relative z-10">
                                Next Reward: <span className="text-white font-bold">Fee Discount Unlocked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    loading,
    currency = false,
    suffix = '',
    customDisplay
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    loading: boolean;
    currency?: boolean;
    suffix?: string;
    customDisplay?: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all flex flex-col justify-between h-full"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                    {icon}
                </div>
                {!loading && <span className="text-[10px] font-bold text-emerald-500">+2.4%</span>}
            </div>
            <div>
                <p className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wider">{label}</p>
                {loading ? (
                    <div className="h-7 w-24 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                    <p className={`text-2xl font-bold tracking-tight ${customDisplay === 'CRITICAL' ? 'text-red-500' : customDisplay === 'WARNING' ? 'text-yellow-500' : ''}`}>
                        {customDisplay ? customDisplay : (
                            <>
                                {currency ? '$' : ''}
                                {value.toLocaleString(undefined, { minimumFractionDigits: currency ? 2 : 0, maximumFractionDigits: currency ? 2 : 0 })}
                                {suffix}
                            </>
                        )}
                    </p>
                )}
            </div>
        </motion.div>
    );
}