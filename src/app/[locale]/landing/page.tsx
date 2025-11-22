'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SmartSwitchWizard from '@/components/dashboard/SmartSwitchWizard';
import { Globe, Shield, Zap, TrendingUp } from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        // Handle magic link redirect first
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
            window.location.href = `/reset-password${hash}`;
        }
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-black font-black text-sm">A</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">APEXOS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/login')}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => router.push('/signup')}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all"
                        >
                            Get Started
                        </button>
                    </div>
            </header>
        </header>

            {/* Hero Section */ }
    <section className="relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 py-24 text-center">
            <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    The Ultimate Financial Operating System
                </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                Master Your Wealth with<br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    Institutional Grade AI
                </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                ApexOS unifies your entire financial life. Track assets, automate trading strategies,
                and optimize tax efficiency with our autonomous AI agents.
            </p>

            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => router.push('/signup')}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    Launch Dashboard
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
                >
                    View Demo
                </button>
            </div>
        </div>
    </section>

    {/* Claim Trading Rebates Section */ }
    <section className="py-24 relative">
        <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Info */}
                <div>
                    <h2 className="text-5xl font-black mb-6">
                        Claim Your <span className="text-emerald-400">Trading Rebates</span>
                    </h2>
                    <p className="text-lg text-gray-400 mb-8">
                        Already trading on major exchanges? Link your account to ApexOS to unlock automatic fee rebates.
                        Our AI Auditor verifies your eligibility instantly.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Up to 40% commission kickback</h4>
                                <p className="text-sm text-gray-500">Earn passive income on every trade</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Institutional-grade security verification</h4>
                                <p className="text-sm text-gray-500">Bank-level encryption and compliance</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Instant activation & daily payouts</h4>
                                <p className="text-sm text-gray-500">No waiting, immediate access</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Smart Switch Wizard */}
                <div className="flex justify-center">
                    <SmartSwitchWizard />
                </div>
            </div>
        </div>
    </section>

    {/* AI Agents Section */ }
    <section className="py-24 bg-gradient-to-b from-transparent to-black/50">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-black mb-4">
                    Powered by <span className="text-emerald-400">Advanced AI</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Our autonomous agents work 24/7 to protect your capital and maximize your returns.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Wolf Pack Agents */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all group">
                    <div className="h-14 w-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Globe className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Wolf Pack Agents</h3>
                    <p className="text-gray-400 leading-relaxed">
                        A swarm of specialized AI agents that analyze market sentiment, technicals, and on-chain data to find alpha.
                    </p>
                </div>

                {/* Risk Guardian */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all group">
                    <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Risk Guardian</h3>
                    <p className="text-gray-400 leading-relaxed">
                        Real-time risk management system that monitors leverage, liquidation prices, and portfolio exposure.
                    </p>
                </div>

                {/* AI Auditor */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all group">
                    <div className="h-14 w-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-7 w-7 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">AI Auditor</h3>
                    <p className="text-gray-400 leading-relaxed">
                        Automated fee reconciliation and tax reporting. Never overpay on exchange fees again.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {/* Footer */ }
    <footer className="border-t border-white/10 py-8 mt-24">
        <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-6 w-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded flex items-center justify-center">
                    <span className="text-black font-black text-xs">A</span>
                </div>
                <span className="font-bold">APEXOS</span>
            </div>
            <p className="text-gray-500 text-sm">© 2025 Apex Financial OS. All rights reserved.</p>
        </div>
    </footer>
        </div >
    );
}
