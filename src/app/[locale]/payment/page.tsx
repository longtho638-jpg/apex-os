"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { CreditCard } from 'lucide-react';
import { useTranslations } from '@/contexts/I18nContext';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';

export default function PaymentPage() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = useState(true);
    const t = useTranslations('Pricing');

    const TIERS = [
        {
            name: t('tiers.free.name'),
            monthlyPrice: 0,
            annualPrice: 0,
            description: 'For beginners tracking their first rebates.',
            features: t('tiers.free.features', { returnObjects: true }) as string[],
            limitations: ['No Export', 'No API Access'],
            cta: 'Current Plan',
            popular: false,
            period: t('tiers.free.period')
        },
        {
            name: t('tiers.trader.name'),
            monthlyPrice: 97,
            annualPrice: 970,
            description: 'Maximize profits with advanced tools.',
            features: t('tiers.trader.features', { returnObjects: true }) as string[],
            limitations: [],
            cta: 'Upgrade',
            popular: true,
            badge: t('tiers.trader.badge'),
            period: t('tiers.trader.period')
        },
        {
            name: t('tiers.pro.name'),
            monthlyPrice: 297,
            annualPrice: 2970,
            description: 'For algo traders and high volume pros.',
            features: t('tiers.pro.features', { returnObjects: true }) as string[],
            limitations: [],
            cta: 'Upgrade',
            popular: false,
            period: t('tiers.pro.period')
        }
    ];

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <CreditCard className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Plans & Billing</h1>
                            <p className="text-xs text-zinc-400">Upgrade your trading arsenal</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center gap-4 mb-12">
                            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-zinc-400'}`}>Monthly</span>
                            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-emerald-600" />
                            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-zinc-400'}`}>
                                Annual <span className="text-emerald-400 text-xs ml-1 font-bold tracking-wide uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Save 20%</span>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {TIERS.map((tier, index) => (
                                <motion.div
                                    key={tier.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className={`
                                        relative h-full p-8 flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden group
                                        ${tier.popular
                                            ? 'bg-emerald-900/10 border-emerald-500/50 shadow-2xl shadow-emerald-900/20 scale-105 z-10'
                                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                        }
                                    `}>
                                        {tier.popular && (
                                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                                        )}

                                        <div className="mb-6">
                                            <h3 className={`text-lg font-bold mb-2 ${tier.popular ? 'text-emerald-400' : 'text-white'}`}>{tier.name}</h3>
                                            <p className="text-sm text-zinc-400 h-10 leading-snug">{tier.description}</p>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-white tracking-tight">
                                                    $<AnimatedNumber value={isAnnual ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice} />
                                                </span>
                                                <span className="text-zinc-500 text-sm font-medium">/mo</span>
                                            </div>
                                        </div>

                                        <Button3D full variant={tier.popular ? 'primary' : 'glass'} className="mb-8">
                                            {tier.cta}
                                        </Button3D>

                                        <div className="space-y-4 flex-1">
                                            {tier.features.map((feature) => (
                                                <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}