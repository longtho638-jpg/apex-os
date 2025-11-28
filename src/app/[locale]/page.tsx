'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SmartSwitchWizard from '@/components/dashboard/SmartSwitchWizard';
import { Globe, Shield, Zap, TrendingUp, ChevronRight, Activity, Lock, Server, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslations } from '@/contexts/I18nContext';
import { motion } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { TypeWriter } from '@/components/marketing/TypeWriter';
import { GradientText } from '@/components/marketing/GradientText';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';

export default function Homepage() {
    const router = useRouter();
    const t = useTranslations('Homepage');

    useEffect(() => {
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
            window.location.href = `/reset-password${hash}`;
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 overflow-x-hidden">
            <ParticleBackground />
            
            <SiteHeader />

            {/* Hero Section - "The Invincible Fortress" */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative z-10">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">{t('hero.badge')}</span>
                                </div>

                                <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                                    <TypeWriter text={t('hero.title_line1')} speed={40} cursor={false} />
                                    <br />
                                    <GradientText className="animate-aurora bg-[length:200%_auto]">{t('hero.title_line2')}</GradientText>
                                </h1>

                                <p className="text-xl text-zinc-400 mb-10 max-w-xl leading-relaxed">
                                    {t('hero.description')}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button3D onClick={() => router.push('/signup')}>
                                        {t('hero.cta_primary')} <ChevronRight className="inline ml-1 w-4 h-4" />
                                    </Button3D>
                                    <Button3D variant="glass" onClick={() => router.push('/landing')}>
                                        {t('hero.cta_secondary')}
                                    </Button3D>
                                </div>

                                <div className="mt-12 flex items-center gap-8 text-sm font-medium text-zinc-500">
                                    {[
                                        { icon: Shield, text: t('hero.trust_security') },
                                        { icon: Zap, text: t('hero.trust_uptime') },
                                        { icon: Globe, text: t('hero.trust_global') }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <item.icon className="w-4 h-4 text-emerald-500" />
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Hero Dashboard Mockup (CSS-Only) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative perspective-1000 hidden lg:block"
                        >
                            <div className="relative z-10 bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-emerald-900/20 transform rotate-y-12 hover:rotate-y-6 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl pointer-events-none" />
                                {/* Dashboard Content Simulation */}
                                <div className="bg-black rounded-xl overflow-hidden border border-white/5">
                                    {/* Header */}
                                    <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                        </div>
                                        <div className="h-6 w-64 bg-white/5 rounded-md" />
                                    </div>
                                    {/* Body */}
                                    <div className="p-6 grid grid-cols-2 gap-6">
                                        {/* Chart Area */}
                                        <div className="col-span-2 h-48 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-lg border border-emerald-500/10 relative overflow-hidden">
                                            <div className="absolute bottom-0 left-0 right-0 h-px bg-emerald-500/30" />
                                            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-around px-4 pb-4 gap-2">
                                                {[40, 65, 45, 80, 55, 90, 70, 95].map((h, i) => (
                                                    <div key={i} style={{ height: `${h}%` }} className="w-full bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500/40 transition-colors" />
                                                ))}
                                            </div>
                                        </div>
                                        {/* Stats */}
                                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                            <div className="text-zinc-500 text-xs mb-1">Total Profit</div>
                                            <div className="text-2xl font-mono text-white font-bold">$<AnimatedNumber value={12450.32} /></div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                            <div className="text-zinc-500 text-xs mb-1">Active Agents</div>
                                            <div className="text-2xl font-mono text-emerald-400 font-bold"><AnimatedNumber value={12} duration={1000} /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Elements */}
                            <motion.div 
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-8 -top-8 p-4 bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-400">Daily PnL</div>
                                        <div className="text-sm font-bold text-white">+<AnimatedNumber value={127} suffix="%" /></div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -left-8 -bottom-8 p-4 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                                        <Activity className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-400">System Status</div>
                                        <div className="text-sm font-bold text-white">100% Optimal</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features - "Know Yourself" */}
            <section id="features" className="py-32 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
                
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                            {t('features.title')}
                        </h2>
                        <p className="text-xl text-zinc-400">
                            {t('features.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: t('features.security_title'),
                                desc: t('features.security_desc'),
                                color: "text-emerald-400"
                            },
                            {
                                icon: Zap,
                                title: t('features.execution_title'),
                                desc: t('features.execution_desc'),
                                color: "text-cyan-400"
                            },
                            {
                                icon: TrendingUp,
                                title: t('features.performance_title'),
                                desc: t('features.performance_desc'),
                                color: "text-purple-400"
                            },
                            {
                                icon: Globe,
                                title: t('features.multi_exchange_title'),
                                desc: t('features.multi_exchange_desc'),
                                color: "text-amber-400"
                            }
                        ].map((feature, i) => (
                            <GlassmorphicCard key={i} className="h-full">
                                <div className={`mb-6 p-3 rounded-xl bg-white/5 w-fit ${feature.color}`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
                            </GlassmorphicCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - "Attack Unexpected" */}
            <section id="how-it-works" className="py-32 bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <SmartSwitchWizard />
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}