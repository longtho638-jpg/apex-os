'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Shield,
    Zap,
    BarChart3,
    Globe,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Loader2,
    Wallet,
    TrendingUp,
    Lock
} from 'lucide-react';
import SmartSwitchWizard from '@/components/dashboard/SmartSwitchWizard';

export default function LandingPage() {
    const router = useRouter();
    const [uid, setUid] = useState('');
    const [exchange, setExchange] = useState('binance');
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const handleLogin = () => {
        router.push('/login');
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uid) return;

        setVerifying(true);
        setVerificationResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referral/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'public-check',
                    exchange,
                    user_uid: uid
                }),
            });

            const data = await response.json();
            setVerificationResult(data);
        } catch (error) {
            setVerificationResult({
                verified: false,
                message: 'Connection failed. Please try again.'
            });
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-black">A</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight">APEX<span className="text-emerald-400">OS</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogin}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={handleLogin}
                                className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0a0a0a] to-[#0a0a0a]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                                The Ultimate Financial Operating System
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                                Master Your Wealth with <br />
                                <span className="text-emerald-400">Institutional Grade AI</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                ApexOS unifies your entire financial life. Track assets, automate trading strategies, and optimize tax efficiency with our autonomous AI agents.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleLogin}
                                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                                >
                                    Launch Dashboard <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-sm font-medium">
                                    View Demo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Floating UI Elements (Decorative) */}
                <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden xl:block opacity-20 pointer-events-none">
                    <div className="w-64 h-80 bg-gradient-to-br from-gray-800 to-black border border-white/10 rounded-2xl p-4 rotate-[-12deg]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="h-2 w-20 bg-white/20 rounded mb-1" />
                                <div className="h-2 w-12 bg-white/10 rounded" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-8 w-full bg-white/5 rounded flex items-center px-2">
                                    <div className="w-4 h-4 rounded-full bg-white/10 mr-2" />
                                    <div className="h-2 w-full bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Referral Verification Section */}
            <section className="py-24 bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Claim Your <span className="text-emerald-400">Trading Rebates</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Already trading on major exchanges? Link your account to ApexOS to unlock automatic fee rebates. Our AI Auditor verifies your eligibility instantly.
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    { icon: Wallet, text: "Up to 40% commission kickback" },
                                    { icon: Shield, text: "Institutional-grade security verification" },
                                    { icon: Zap, text: "Instant activation & daily payouts" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <span className="text-gray-300">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl relative">
                            <div className="absolute -top-px -left-px w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-tl-2xl pointer-events-none" />
                            <SmartSwitchWizard />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by <span className="text-emerald-400">Advanced AI</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Our autonomous agents work 24/7 to protect your capital and maximize your returns.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Wolf Pack Agents",
                            desc: "A swarm of specialized AI agents that analyze market sentiment, technicals, and on-chain data to find alpha.",
                            icon: Globe
                        },
                        {
                            title: "Risk Guardian",
                            desc: "Real-time risk management system that monitors leverage, liquidation prices, and portfolio exposure.",
                            icon: Shield
                        },
                        {
                            title: "AI Auditor",
                            desc: "Automated fee reconciliation and tax reporting. Never overpay on exchange fees again.",
                            icon: BarChart3
                        }
                    ].map((feature, i) => (
                        <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                            <span className="font-bold text-black text-xs">A</span>
                        </div>
                        <span className="font-bold text-gray-300">APEXOS</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2025 Apex Financial OS. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
