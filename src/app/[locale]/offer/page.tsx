"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, Crown, Zap, Shield, Bot, ArrowRight, Star } from 'lucide-react';
import { useTranslations } from '@/contexts/I18nContext';
import { Sidebar } from '@/components/os/sidebar';
import { motion } from 'framer-motion';

export default function OfferPage() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('Offer');

    const features = [
        { name: 'AI Auditor Agent', free: false, pro: true },
        { name: 'Wolf Pack Swarm', free: false, pro: true },
        { name: 'Risk Guardian', free: false, pro: true },
        { name: 'Exchange Auto-Sync', free: true, pro: true },
        { name: 'Real-time Data', free: true, pro: true },
        { name: 'Priority Support', free: false, pro: true },
        { name: 'Referral Bonus', free: '5%', pro: '15%' },
    ];

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative custom-scrollbar">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto w-full px-8 py-12">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] font-bold text-sm mb-6"
                        >
                            <Crown className="h-4 w-4" />
                            <span>{t('limited_time')}</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
                        >
                            {t('title')} <span className="text-gradient-primary">Pro</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-zinc-400 max-w-2xl mx-auto"
                        >
                            {t('subtitle')}
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Tier */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-panel p-8 rounded-2xl border border-white/5 relative"
                        >
                            <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                            <p className="text-zinc-400 mb-8">Essential tools for casual traders.</p>

                            <button
                                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all mb-8"
                                disabled
                            >
                                {t('current_plan')}
                            </button>

                            <div className="space-y-4">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">{f.name}</span>
                                        {f.free === true ? <Check className="h-5 w-5 text-zinc-500" /> :
                                            f.free === false ? <span className="text-gray-700">-</span> :
                                                <span className="text-gray-300">{f.free}</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Pro Tier */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-panel p-8 rounded-2xl border border-[#00FF94]/30 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF94] to-[#06B6D4]" />
                            <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#00FF94]/10 rounded-full blur-3xl group-hover:bg-[#00FF94]/20 transition-all duration-500" />

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-bold">Pro</h3>
                                <div className="px-3 py-1 rounded-full bg-[#00FF94] text-black text-xs font-bold">
                                    MOST POPULAR
                                </div>
                            </div>
                            <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                            <p className="text-gray-300 mb-8">Full power of ApexOS AI swarm.</p>

                            <button
                                onClick={() => router.push(`/${locale}/payment`)}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00FF94] to-[#06B6D4] hover:from-[#00CC76] hover:to-[#0596A6] text-black font-bold transition-all mb-8 shadow-[0_0_20px_rgba(0,255,148,0.3)] flex items-center justify-center gap-2"
                            >
                                {t('upgrade_now')} <ArrowRight className="h-5 w-5" />
                            </button>

                            <div className="space-y-4 relative z-10">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-white font-medium">{f.name}</span>
                                        {f.pro === true ? <Check className="h-5 w-5 text-[#00FF94]" /> :
                                            <span className="text-[#00FF94] font-bold">{f.pro}</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-16 grid grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <Bot className="h-8 w-8 text-[#00FF94] mx-auto mb-4" />
                            <h4 className="font-bold mb-2">AI Swarm</h4>
                            <p className="text-sm text-zinc-400">4 specialized agents working 24/7 for you.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <Shield className="h-8 w-8 text-[#8B5CF6] mx-auto mb-4" />
                            <h4 className="font-bold mb-2">Risk Guardian</h4>
                            <p className="text-sm text-zinc-400">Institutional-grade risk management.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <Zap className="h-8 w-8 text-[#06B6D4] mx-auto mb-4" />
                            <h4 className="font-bold mb-2">Zero Latency</h4>
                            <p className="text-sm text-zinc-400">Direct exchange connection via WebSocket.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
