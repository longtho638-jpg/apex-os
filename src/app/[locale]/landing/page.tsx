'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
    const router = useRouter();
    const [exchangeUuid, setExchangeUuid] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!exchangeUuid || !email) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        // TODO: Call API to link UUID with Partner account
        console.log('Submitting UUID:', exchangeUuid, 'Email:', email);

        // For now, redirect to signup with UUID pre-filled
        router.push(`/signup?uuid=${encodeURIComponent(exchangeUuid)}&email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
            {/* Header */}
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold">Apex Rebate</span>
                </div>
                <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                    Sign In
                </button>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Left: Value Props */}
                    <div>
                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                            Get Cash Back on Every Trade
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Turn your trading fees into profits. Connect your exchange account and start earning rebates automatically.
                        </p>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                </div>
                                <span className="text-gray-300">Up to 40% rebate on trading fees</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="text-gray-300">Secure & encrypted connections</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Users className="h-5 w-5 text-purple-500" />
                                </div>
                                <span className="text-gray-300">Supports Binance, Bybit, OKX</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2">Start Earning Today</h2>
                        <p className="text-gray-400 mb-6">Connect your exchange account in 30 seconds</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Exchange UUID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Exchange Account UUID
                                </label>
                                <input
                                    type="text"
                                    value={exchangeUuid}
                                    onChange={(e) => setExchangeUuid(e.target.value)}
                                    placeholder="Your Binance/Bybit/OKX UID"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Find this in your exchange account settings
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Continue
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                By continuing, you agree to our Terms of Service
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
