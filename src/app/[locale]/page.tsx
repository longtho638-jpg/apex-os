'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SmartSwitchWizard from '@/components/dashboard/SmartSwitchWizard';
import { Zap, Shield, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();
    const [showWizard, setShowWizard] = useState(false);

    useEffect(() => {
        // Check for magic link tokens first
        const hash = window.location.hash;

        if (hash) {
            if (hash.includes('error=')) {
                const params = new URLSearchParams(hash.substring(1));
                const error = params.get('error');
                const errorDescription = params.get('error_description');
                router.replace(`/login?error=${error}&message=${encodeURIComponent(errorDescription || 'Authentication error')}`);
                return;
            }

            if (hash.includes('access_token') || hash.includes('type=')) {
                window.location.href = `/reset-password${hash}`;
                return;
            }
        }

        // Show wizard after a brief moment
        setTimeout(() => setShowWizard(true), 300);
    }, [router]);

    if (!showWizard) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
            {/* Header */}
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold">Apex Rebate</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => router.push('/signup')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors"
                    >
                        Get Started
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Turn Trading Fees Into Profits
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Connect your exchange account in 30 seconds. Start earning up to 40% rebates automatically.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
                            <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="font-bold mb-2">Up to 40% Rebates</h3>
                            <p className="text-sm text-gray-400">Earn cash back on every trade</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
                            <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold mb-2">Bank-Grade Security</h3>
                            <p className="text-sm text-gray-400">AES-256 encryption</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
                            <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-6 w-6 text-purple-500" />
                            </div>
                            <h3 className="font-bold mb-2">12 Supported Exchanges</h3>
                            <p className="text-sm text-gray-400">Binance, Bybit, OKX & more</p>
                        </div>
                    </div>

                    {/* Smart Switch Wizard */}
                    <div className="flex justify-center">
                        <SmartSwitchWizard />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-12 border-t border-white/10 text-center text-gray-500 text-sm">
                <p>© 2025 Apex Rebate. All rights reserved.</p>
            </footer>
        </div>
    );
}
