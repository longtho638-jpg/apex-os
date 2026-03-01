'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users, Crown, Check, ArrowRight, LockKeyhole, Bot, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { GradientText } from '@/components/marketing/GradientText';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { AgenticOnboardingWizard } from '@/components/onboarding/agentic-onboarding-wizard';
import { LiveStats } from '@/components/marketing/LiveStats';
import { MouseGlow } from '@/components/ui/mouse-glow';
import { UNIFIED_TIERS, TIER_ORDER } from '@apex-os/vibe-payment';

export default function Homepage() {
    const router = useRouter();
    const t = useTranslations('Homepage');
    const [strategies, setStrategies] = useState<{ id: string; name: string; author: string; roi: number; winRate: number; followers: number }[]>([]);

    useEffect(() => {
        // Fetch top strategies for social proof
        fetch('/api/marketplace/strategies')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStrategies(data.data.slice(0, 3));
            })
            .catch(err => logger.error("Error occurred", err));
    }, []);

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans relative">
            <MouseGlow />
            <ParticleBackground />
            <SiteHeader />

            {/* 1. HERO SECTION: THE EMPIRE */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-5xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">{t('hero.badge')}</span>
                        </motion.div>

                        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                            {t('hero.title_line1')} <br />
                            <GradientText className="animate-aurora bg-[length:200%_auto]">{t('hero.title_line2')}</GradientText>
                        </h1>

                        <p className="text-xl sm:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            {t('hero.description')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button3D onClick={() => router.push('/signup')} className="px-10 py-4 text-lg">
                                {t('hero.cta_primary')} <ChevronRight className="inline ml-2 w-5 h-5" />
                            </Button3D>
                            <Button3D variant="glass" onClick={() => router.push('/en/offer')} className="px-10 py-4 text-lg">
                                {t('hero.cta_secondary')}
                            </Button3D>
                        </div>

                        {/* Social Proof Stats */}
                        <LiveStats />
                    </div>
                </div>

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            </section>

            {/* 2. MARKETPLACE TEASER (NEW) */}
            <section id="features" className="py-24 bg-white/[0.02] border-y border-white/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{t('marketplace.title')}</h2>
                            <p className="text-zinc-400">{t('marketplace.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => router.push('/en/dashboard/marketplace')}
                            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 transition-colors"
                        >
                            {t('marketplace.view_all')} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {strategies.length > 0 ? strategies.map((strat, i) => (
                            <motion.div
                                key={strat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-6 rounded-2xl bg-black border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
                                            {strat.author[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{strat.name}</h3>
                                            <p className="text-xs text-zinc-500">by {strat.author}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-emerald-400">+{strat.roi}%</div>
                                        <div className="text-[10px] text-zinc-500 uppercase">30d ROI</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl">
                                    <div>
                                        <div className="text-xs text-zinc-500">{t('marketplace.win_rate')}</div>
                                        <div className="font-bold text-white">{strat.winRate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500">{t('marketplace.followers')}</div>
                                        <div className="font-bold text-white">{strat.followers}</div>
                                    </div>
                                </div>
                                <Button3D full variant="glass" className="text-sm">{t('marketplace.copy_strategy')}</Button3D>
                            </motion.div>
                        )) : (
                            // Skeleton Loaders
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 3. VIRAL ECONOMICS EXPLAINED */}
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mb-6 border border-purple-500/20">
                                <Users className="w-3 h-3" /> {t('viral.badge')}
                            </div>
                            <h2 className="text-4xl font-bold mb-6">{t('viral.title')}</h2>
                            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                                {t('viral.description_1')} <span className="text-white font-bold">{t('viral.description_you')}</span>.
                                {t('viral.description_2')} <span className="text-emerald-400 font-bold">{t('viral.description_revenue')}</span> {t('viral.description_3')}
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    t('viral.benefit_1'),
                                    t('viral.benefit_2'),
                                    t('viral.benefit_3'),
                                    t('viral.benefit_4')
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Button3D onClick={() => router.push('/en/offer')}>
                                {t('viral.cta')}
                            </Button3D>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-[100px] rounded-full" />
                            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                                {/* Tree Visualization Mock */}
                                <div className="flex justify-center mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 z-10">
                                        <Crown className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4 relative z-0">
                                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-px h-10 bg-white/20" />
                                    <div className="absolute top-[20px] left-1/4 right-1/4 h-px bg-white/20" />
                                    <div className="absolute top-[20px] left-1/4 w-px h-4 bg-white/20" />
                                    <div className="absolute top-[20px] right-1/4 w-px h-4 bg-white/20" />

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <div className="text-xs text-zinc-500 mb-1">{t('viral.level_1')}</div>
                                        <div className="font-bold text-emerald-400">$4,200</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <div className="text-xs text-zinc-500 mb-1">{t('viral.level_2')}</div>
                                        <div className="font-bold text-blue-400">$2,100</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center mt-4 opacity-50">
                                    <div className="text-xs text-zinc-500 mb-1">{t('viral.level_3_4')}</div>
                                    <div className="font-bold text-zinc-400 flex items-center justify-center gap-2">
                                        <LockKeyhole className="w-3 h-3" /> {t('viral.locked')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. RaaS ZERO-FEE MODEL */}
            <section className="py-32 bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-6 border border-cyan-500/20">
                            <Coins className="w-3 h-3" /> {t('raas.badge')}
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{t('raas.title')}</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{t('raas.subtitle')}</p>
                    </div>

                    {/* RaaS Tier Cards — Volume-based, zero-fee */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {TIER_ORDER.map((tierId, i) => {
                            const tier = UNIFIED_TIERS[tierId];
                            return (
                                <motion.div
                                    key={tierId}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-6 rounded-2xl border transition-all ${
                                        tierId === 'ARCHITECT'
                                            ? 'bg-emerald-900/10 border-emerald-500/50 scale-105 z-10'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {tierId === 'ARCHITECT' && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                                    )}
                                    <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-black text-emerald-400">$0</span>
                                        <span className="text-zinc-500 text-sm">/mo</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 mb-4 p-2 bg-white/5 rounded-lg">
                                        Spread: <span className="text-white font-bold">{tier.spreadBps / 100}%</span>
                                        {' · '}Agents: <span className="text-white font-bold">{tier.agentSlots === Infinity ? '∞' : tier.agentSlots}</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {tier.features.slice(0, 4).map((f, j) => (
                                            <li key={j} className="flex items-start gap-2 text-xs text-zinc-300">
                                                <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 5. AGENTIC ONBOARDING */}
            <section id="how-it-works" className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold mb-6 border border-violet-500/20">
                            <Bot className="w-3 h-3" /> {t('onboarding.badge')}
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{t('onboarding.title')}</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">{t('onboarding.subtitle')}</p>
                    </div>
                    <AgenticOnboardingWizard />
                </div>
            </section>

            {/* 6. FINAL CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-black" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-8">
                        {t('final_cta.title')}
                    </h2>
                    <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                        {t('final_cta.description')}
                    </p>
                    <Button3D onClick={() => router.push('/signup')} className="px-12 py-6 text-xl shadow-2xl shadow-emerald-500/30">
                        {t('final_cta.cta')}
                    </Button3D>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
