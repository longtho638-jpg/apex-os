"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, Crown, Zap, TrendingUp, Users, ArrowRight, Trophy, Lock, Calculator, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Sidebar } from '@/components/os/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';

export default function OfferPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('Offer');

    // Simulator State
    const [activeReferrals, setActiveReferrals] = useState(3);
    const [avgVolume, setAvgVolume] = useState(50000);
    const [isAnnual, setIsAnnual] = useState(true);

    // Constants
    const AVG_FEE_RATE = 0.0005; // 0.05% blended fee share
    const APEX_COMMISSION_SHARE = 0.40; // Apex gets 40% from exchange

    const calculateEarnings = (tier: string, refs: number, vol: number) => {
        // 1. Referral Commission
        const baseRevenue = refs * vol * AVG_FEE_RATE * APEX_COMMISSION_SHARE;
        let commissionRate = 0;

        // 2. Self Rebate (Assumed user trades same volume as avg ref for simplicity)
        const selfRevenue = vol * AVG_FEE_RATE * APEX_COMMISSION_SHARE;
        let rebateRate = 0;

        switch (tier) {
            case 'FREE': commissionRate = 0.10; rebateRate = 0.05; break;
            case 'PRO': commissionRate = 0.20; rebateRate = 0.10; break;
            case 'TRADER': commissionRate = 0.35; rebateRate = 0.20; break;
            case 'ELITE': commissionRate = 0.50; rebateRate = 0.30; break;
            default: return { commission: 0, rebate: 0, total: 0 };
        }

        const commission = baseRevenue * commissionRate;
        const rebate = selfRevenue * rebateRate;

        return {
            commission,
            rebate,
            total: commission + rebate
        };
    };

    const tiers = [
        {
            name: 'FREE',
            price: 0,
            monthlyPrice: 0,
            annualPrice: 0,
            breakEvenRefs: 0,
            features: ['Basic Trading', '10 AI Requests/Day', '5% Self Rebate'],
            color: 'text-zinc-400',
            bg: 'bg-zinc-500/10',
            border: 'border-zinc-500/20',
            icon: Users,
            highlight: false
        },
        {
            name: 'PRO',
            price: 29,
            monthlyPrice: 29,
            annualPrice: 290, // $24/mo
            breakEvenRefs: 3, // Approx
            features: ['100 AI Requests', 'Unlimited Signals', '10% Self Rebate'],
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            icon: Zap,
            highlight: false
        },
        {
            name: 'TRADER',
            price: 97,
            monthlyPrice: 97,
            annualPrice: 970, // $80/mo
            breakEvenRefs: 5, // Approx
            features: ['500 AI Requests', 'Copy Trading', '20% Self Rebate', 'AI Auto-Trading'],
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            icon: TrendingUp,
            highlight: true,
            badge: 'BEST VALUE'
        },
        {
            name: 'ELITE',
            price: 297,
            monthlyPrice: 297,
            annualPrice: 2970, // $247/mo
            breakEvenRefs: 12, // Approx
            features: ['Unlimited AI', 'Private Signals', '30% Self Rebate', 'Dedicated Manager'],
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            icon: Crown,
            highlight: false
        }
    ];

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative custom-scrollbar">
                {/* Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12">
                    {/* Header: The Investment Pitch */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] font-bold text-xs mb-6 tracking-wider"
                        >
                            <Calculator className="h-3 w-3" />
                            ROI CALCULATOR
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Don't Buy a Tool. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] to-cyan-400">Invest in an Empire.</span>
                        </h1>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                            Most traders see $97 as an expense. Smart traders see it as an investment with <span className="text-white font-bold">Infinite ROI</span>.
                            Here is the math on how to make your subscription <span className="text-[#00FF94] font-bold">FREE</span>.
                        </p>
                    </div>

                    {/* ROI Simulator - The "WOW" Factor */}
                    <div className="mb-16 p-1 rounded-3xl bg-gradient-to-r from-zinc-800 to-zinc-900 shadow-2xl">
                        <div className="bg-[#0A0A0A] rounded-[22px] p-8 md:p-12 border border-white/5">
                            <div className="grid lg:grid-cols-12 gap-12">
                                {/* Controls */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Users className="text-purple-400" />
                                            Your Network
                                        </h3>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between mb-2 text-sm">
                                                    <span className="text-zinc-400">Active Referrals</span>
                                                    <span className="text-white font-bold text-lg">{activeReferrals}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    step="1"
                                                    value={activeReferrals}
                                                    onChange={(e) => setActiveReferrals(Number(e.target.value))}
                                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                                                />
                                                <div className="flex justify-between mt-1 text-[10px] text-zinc-600 font-mono">
                                                    <span>0</span>
                                                    <span>10</span>
                                                    <span>20+</span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-2 text-sm">
                                                    <span className="text-zinc-400">Avg. Volume / User</span>
                                                    <span className="text-white font-bold text-lg">${avgVolume.toLocaleString()}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10000"
                                                    max="500000"
                                                    step="10000"
                                                    value={avgVolume}
                                                    onChange={(e) => setAvgVolume(Number(e.target.value))}
                                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-[#00FF94] shrink-0" />
                                            <p>
                                                <span className="text-white font-bold">Did you know?</span> Just 3 active friends on the Trader plan covers your entire subscription cost.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* The Results */}
                                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {tiers.slice(1).map((tier) => {
                                        const earnings = calculateEarnings(tier.name, activeReferrals, avgVolume);
                                        const price = isAnnual ? tier.annualPrice / 12 : tier.monthlyPrice;
                                        const netCost = price - earnings.total;
                                        const isProfitable = netCost <= 0;
                                        const profit = Math.abs(netCost);

                                        return (
                                            <motion.div
                                                key={tier.name}
                                                layout
                                                className={`relative p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${isProfitable
                                                    ? `bg-gradient-to-b from-${tier.color.split('-')[1]}-900/20 to-black border-${tier.color.split('-')[1]}-500/50 shadow-lg shadow-${tier.color.split('-')[1]}-500/10`
                                                    : 'bg-zinc-900/50 border-white/5 opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                {tier.highlight && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00FF94] text-black text-[10px] font-bold">
                                                        SWEET SPOT
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <tier.icon className={`w-5 h-5 ${tier.color}`} />
                                                        <span className={`font-bold ${tier.color}`}>{tier.name}</span>
                                                    </div>

                                                    <div className="space-y-1 mb-6">
                                                        <div className="text-xs text-zinc-500">Monthly Cost</div>
                                                        <div className="text-xl font-bold text-white">${price.toFixed(0)}</div>
                                                    </div>

                                                    <div className="space-y-1 mb-6">
                                                        <div className="text-xs text-zinc-500">Your Earnings</div>
                                                        <div className={`text-xl font-bold ${tier.color}`}>
                                                            +${earnings.total.toFixed(0)}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-600 flex gap-2">
                                                            <span>Ref: ${earnings.commission.toFixed(0)}</span>
                                                            <span>Self: ${earnings.rebate.toFixed(0)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`pt-4 border-t ${isProfitable ? `border-${tier.color.split('-')[1]}-500/30` : 'border-white/10'}`}>
                                                    <div className="text-xs text-zinc-400 mb-1">Net Position</div>
                                                    {isProfitable ? (
                                                        <div className="text-2xl font-black text-[#00FF94] flex items-center gap-2">
                                                            +${profit.toFixed(0)}
                                                            <span className="text-xs font-bold bg-[#00FF94]/20 text-[#00FF94] px-2 py-0.5 rounded">PROFIT</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-2xl font-bold text-zinc-500">
                                                            -${netCost.toFixed(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex items-center gap-4 p-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-[#00FF94] text-black shadow-[0_0_20px_rgba(0,255,148,0.3)]' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Annual <span className="bg-black/20 text-[10px] px-1.5 py-0.5 rounded">SAVE 17%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-6 rounded-2xl border ${tier.border} ${tier.bg} backdrop-blur-md flex flex-col h-full group hover:-translate-y-1 transition-all duration-300`}
                            >
                                {tier.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00FF94] text-black text-[10px] font-bold shadow-lg shadow-emerald-500/20">
                                        {tier.badge}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className={`w-10 h-10 rounded-lg ${tier.bg} border ${tier.border} flex items-center justify-center mb-4`}>
                                        <tier.icon className={`h-5 w-5 ${tier.color}`} />
                                    </div>
                                    <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">
                                            ${isAnnual ? (tier.annualPrice / 12).toFixed(0) : tier.monthlyPrice}
                                        </span>
                                        <span className="text-sm text-zinc-500">/mo</span>
                                    </div>
                                    {isAnnual && tier.price > 0 && (
                                        <div className="text-xs text-[#00FF94] mt-1 font-medium">
                                            Billed ${tier.annualPrice}/yr
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 mb-8 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                            <Check className={`h-3 w-3 ${tier.color} mt-0.5 shrink-0`} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <Button3D
                                    full
                                    variant={tier.highlight ? 'primary' : 'glass'}
                                    className="w-full"
                                    onClick={() => router.push(`/${locale}/dashboard/payment`)}
                                >
                                    {tier.price === 0 ? 'Get Started' : 'Invest Now'}
                                </Button3D>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}