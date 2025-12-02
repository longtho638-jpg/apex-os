"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Users, TrendingUp, AlertTriangle, Lock, DollarSign, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { UNIFIED_TIERS } from '@/config/unified-tiers';
import { useUserTier } from '@/hooks/useUserTier';

export default function PaymentPage() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = useState(true);
    const t = useTranslations('Pricing');

    const { tier: currentTier } = useUserTier();
    const potentialLostIncome = 1250; // Calculated from viral simulator

    const TIERS = [
        {
            id: 'FREE',
            name: UNIFIED_TIERS.FREE.name,
            price: 0,
            description: 'Getting started with basic tools.',
            features: UNIFIED_TIERS.FREE.features,
            viral: { level: 'L1', rate: '10%', rebate: '5%' },
            icon: Users,
            color: 'text-zinc-400',
            border: 'border-zinc-500/20',
            bg: 'bg-zinc-500/5'
        },
        {
            id: 'PRO',
            name: UNIFIED_TIERS.PRO.name,
            monthly: UNIFIED_TIERS.PRO.monthlyPrice,
            annual: UNIFIED_TIERS.PRO.annualPrice,
            description: 'For serious traders scaling up.',
            features: UNIFIED_TIERS.PRO.features,
            viral: { level: 'L2', rate: '20%', rebate: '10%' },
            icon: Zap,
            color: 'text-emerald-400',
            border: 'border-emerald-500/20',
            bg: 'bg-emerald-500/5'
        },
        {
            id: 'TRADER',
            name: UNIFIED_TIERS.TRADER.name,
            monthly: UNIFIED_TIERS.TRADER.monthlyPrice,
            annual: UNIFIED_TIERS.TRADER.annualPrice,
            description: 'Automated quant trading power.',
            features: UNIFIED_TIERS.TRADER.features,
            viral: { level: 'L3', rate: '35%', rebate: '20%' },
            popular: true,
            icon: TrendingUp,
            color: 'text-cyan-400',
            border: 'border-cyan-500/20',
            bg: 'bg-cyan-500/5'
        },
        {
            id: 'ELITE',
            name: UNIFIED_TIERS.ELITE.name,
            monthly: UNIFIED_TIERS.ELITE.monthlyPrice,
            annual: UNIFIED_TIERS.ELITE.annualPrice,
            description: 'Maximum leverage for leaders.',
            features: UNIFIED_TIERS.ELITE.features,
            viral: { level: 'L4', rate: '50%', rebate: '30%' },
            icon: Crown,
            color: 'text-amber-400',
            border: 'border-amber-500/20',
            bg: 'bg-amber-500/5'
        }
    ];

    return (
        <div className="relative min-h-full bg-[#030303] text-white font-sans overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <DollarSign className="h-5 w-5 text-[#00FF94]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Subscription & Billing</h1>
                        <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Manage your empire</p>
                    </div>
                </div>

                {/* Lost Income Alert - Golden Handcuff Trigger */}
                {currentTier === 'FREE' && (
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-xs text-red-200 font-medium">
                            Potential Lost Income: <span className="font-bold text-white">${potentialLostIncome}/mo</span> (Upgrade to Unlock)
                        </span>
                    </div>
                )}
            </header>

            <div className="p-8 relative z-10 max-w-7xl mx-auto">
                {/* Billing Toggle */}
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

                {/* Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {TIERS.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative flex flex-col h-full p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 group
                                ${tier.popular
                                    ? 'bg-gradient-to-b from-cyan-900/20 to-black border-cyan-500/30 shadow-2xl shadow-cyan-500/10 scale-[1.02] z-10'
                                    : `${tier.bg} ${tier.border} hover:bg-white/10`
                                }
                            `}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-cyan-500/40">
                                    Recommended
                                </div>
                            )}

                            {/* Tier Header */}
                            <div className="mb-6">
                                <div className={`w-12 h-12 rounded-2xl ${tier.bg} border ${tier.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <tier.icon className={`w-6 h-6 ${tier.color}`} />
                                </div>
                                <h3 className={`text-xl font-black tracking-tight ${tier.color}`}>{tier.name}</h3>
                                <p className="text-xs text-zinc-400 mt-2 h-8 leading-relaxed">{tier.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                {tier.price !== undefined ? (
                                    <div className="text-4xl font-black text-white tracking-tighter">{tier.price}</div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white tracking-tighter">
                                            $<AnimatedNumber value={isAnnual ? tier.annual! : tier.monthly!} />
                                        </span>
                                        <span className="text-zinc-500 text-sm font-medium">{isAnnual ? '/yr' : '/mo'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Viral Stats (The Golden Handcuffs) */}
                            <div className="mb-8 space-y-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Viral Depth</span>
                                        <Badge variant={tier.id === 'ELITE' ? 'default' : 'outline'} className="text-[10px]">
                                            {tier.viral.level}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className={`w-4 h-4 ${tier.color}`} />
                                        <span className={`font-mono font-bold ${tier.color}`}>{tier.viral.rate} Commission</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Self Rebate</span>
                                        <Badge variant="outline" className="text-[10px]">Personal</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className={`w-4 h-4 ${tier.color}`} />
                                        <span className="text-white font-mono font-bold">{tier.viral.rebate} Fees Back</span>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 flex-1 mb-8">
                                {tier.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-xs text-zinc-300">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${tier.bg}`}>
                                            <Check className={`w-3 h-3 ${tier.color}`} />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <Button3D
                                full
                                variant={tier.popular ? 'primary' : 'glass'}
                                onClick={() => window.location.href = `/en/pricing?plan=${tier.id}`}
                                className="group"
                            >
                                {currentTier === tier.id ? 'Current Plan' : (
                                    <span className="flex items-center gap-2">
                                        Upgrade <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button3D>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise/Whale Section */}
                <div className="mt-12 p-1 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20">
                    <div className="relative p-8 rounded-[22px] bg-black/80 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/10 to-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Whale / Institutional Access</h3>
                                <p className="text-zinc-400 max-w-xl">
                                    Need custom API limits, white-label solutions, or direct access to the Core Team?
                                    Unlock God Mode and 100% commission pass-through.
                                </p>
                            </div>
                        </div>

                        <Button3D variant="glass" className="relative z-10 min-w-[200px]">
                            Contact Sales
                        </Button3D>
                    </div>
                </div>
            </div>
        </div>
    );
}
