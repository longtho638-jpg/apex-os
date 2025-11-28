'use client';

import { useState } from 'react';
import { Copy, Check, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function ReferralsPage() {
    const [copied, setCopied] = useState(false);
    const referralLink = 'https://apexrebate.com/r/ABC123';

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Referral Program</h1>

            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 mb-6">
                <p className="text-sm text-zinc-400 mb-2">Your Referral Link</p>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm"
                    />
                    <button
                        onClick={handleCopy}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                    Earn up to 100% commission on L1 referrals, 50% on L2, 25% on L3, 12.5% on L4
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label="Total Referrals"
                    value="12"
                    subtext="Active users"
                />
                <StatCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="Total Earned"
                    value="$847.32"
                    subtext="All time"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="This Month"
                    value="$124.50"
                    subtext="+18% vs last month"
                />
            </div>

            {/* Referral Tree */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Your Network</h2>
                <div className="space-y-3">
                    <NetworkLevel level="L1" count={3} commission="100%" color="emerald" />
                    <NetworkLevel level="L2" count={5} commission="50%" color="blue" />
                    <NetworkLevel level="L3" count={3} commission="25%" color="purple" />
                    <NetworkLevel level="L4" count={1} commission="12.5%" color="orange" />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    subtext
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    {icon}
                </div>
                <p className="text-sm text-zinc-400">{label}</p>
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-xs text-zinc-500">{subtext}</p>
        </div>
    );
}

function NetworkLevel({
    level,
    count,
    commission,
    color
}: {
    level: string;
    count: number;
    commission: string;
    color: string;
}) {
    const colorClasses = {
        emerald: 'bg-emerald-500/10 text-emerald-400',
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
        orange: 'bg-orange-500/10 text-orange-400'
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-lg font-mono text-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {level}
                </div>
                <span className="text-white font-medium">{count} referrals</span>
            </div>
            <span className="text-zinc-400 text-sm">{commission} commission</span>
        </div>
    );
}
