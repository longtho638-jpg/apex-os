'use client';

import { Award, TrendingUp, Target, Zap } from 'lucide-react';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';

export default function RewardsPage() {
    const currentTier = 'SILVER';
    const monthlyVolume = 45230;
    const nextTierVolume = 100000;
    const progress = (monthlyVolume / nextTierVolume) * 100;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Rewards & Tier</h1>

            {/* Current Tier Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-2xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-500/20 rounded-2xl">
                        <Award className="w-12 h-12 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-400">Current Tier</p>
                        <p className="text-4xl font-bold text-blue-400">{currentTier}</p>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-zinc-400">Progress to Gold</p>
                        <p className="text-sm font-medium">${monthlyVolume.toLocaleString()} / ${nextTierVolume.toLocaleString()}</p>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                        ${(nextTierVolume - monthlyVolume).toLocaleString()} more to unlock Gold tier
                    </p>
                </div>
            </div>

            {/* Tier Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <BenefitCard
                    icon={<Target className="w-6 h-6" />}
                    title="Higher Rebates"
                    description="Up to 0.03% on all trades"
                    active={true}
                />
                <BenefitCard
                    icon={<Zap className="w-6 h-6" />}
                    title="Priority Support"
                    description="24/7 dedicated support"
                    active={true}
                />
                <BenefitCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Advanced Analytics"
                    description="Unlock advanced trading insights"
                    active={false}
                />
                <BenefitCard
                    icon={<Award className="w-6 h-6" />}
                    title="Exclusive Signals"
                    description="Access to VIP trading signals"
                    active={false}
                />
            </div>

            {/* Upgrade Banner */}
            <UpgradeBanner />

            {/* All Tiers Comparison */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">All Tiers</h2>
                <div className="space-y-3">
                    <TierRow tier="BRONZE" volume="$0 - $10K" rebate="0.01%" commission="50%" />
                    <TierRow tier="SILVER" volume="$10K - $100K" rebate="0.02%" commission="75%" current />
                    <TierRow tier="GOLD" volume="$100K - $1M" rebate="0.03%" commission="100%" />
                    <TierRow tier="PLATINUM" volume="$1M+" rebate="0.05%" commission="125%" />
                </div>
            </div>
        </div>
    );
}

function BenefitCard({
    icon,
    title,
    description,
    active
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    active: boolean;
}) {
    return (
        <div className={`p-6 rounded-2xl border ${active
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-white/5 border-white/10 opacity-50'
            }`}>
            <div className={`p-3 rounded-xl inline-block mb-3 ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-400'
                }`}>
                {icon}
            </div>
            <h3 className="font-bold mb-1">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
            {!active && (
                <p className="text-xs text-emerald-400 mt-2">🔒 Upgrade to unlock</p>
            )}
        </div>
    );
}

function TierRow({
    tier,
    volume,
    rebate,
    commission,
    current
}: {
    tier: string;
    volume: string;
    rebate: string;
    commission: string;
    current?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl ${current
            ? 'bg-blue-500/10 border border-blue-500/20'
            : 'bg-white/5'
            }`}>
            <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-lg font-bold ${current ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-zinc-400'
                    }`}>
                    {tier}
                </div>
                <span className="text-sm text-zinc-400">{volume}</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
                <span className="text-zinc-400">Rebate: <span className="text-white font-medium">{rebate}</span></span>
                <span className="text-zinc-400">Commission: <span className="text-white font-medium">{commission}</span></span>
            </div>
        </div>
    );
}
