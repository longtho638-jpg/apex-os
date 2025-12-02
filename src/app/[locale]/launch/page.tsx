'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Rocket, Users, Globe, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function LaunchPage() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [metrics, setMetrics] = useState({ users: 12450, volume: 4500000, nodes: 85 });

    // Countdown Logic
    useEffect(() => {
        const targetDate = new Date('2025-12-31T00:00:00');
        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Simulate Live Metrics
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                users: prev.users + Math.floor(Math.random() * 5),
                volume: prev.volume + Math.floor(Math.random() * 1000),
                nodes: prev.nodes
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleLaunch = () => {
        toast.success('Launch Sequence Initiated!', { description: 'All systems are go. Monitoring network stability.' });
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
            <Sidebar />
            <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
                <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
                    <div />
                </AuroraBackground>

                <div className="relative z-10 w-full max-w-5xl p-8 text-center">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold mb-6 animate-pulse">
                            <Activity className="w-4 h-4" /> T-MINUS TO GLOBAL LAUNCH
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                            APEX GENESIS
                        </h1>

                        <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div key={unit} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                    <div className="text-4xl md:text-6xl font-bold font-mono text-white mb-2">
                                        {value.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest">{unit}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-center gap-3 mb-2 text-zinc-400">
                                <Users className="w-5 h-5" /> Pre-Registered Users
                            </div>
                            <div className="text-3xl font-bold text-white">{metrics.users.toLocaleString()}</div>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-center gap-3 mb-2 text-zinc-400">
                                <Activity className="w-5 h-5" /> Testnet Volume
                            </div>
                            <div className="text-3xl font-bold text-emerald-400">${(metrics.volume / 1000000).toFixed(2)}M</div>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-center gap-3 mb-2 text-zinc-400">
                                <Globe className="w-5 h-5" /> Active Nodes
                            </div>
                            <div className="text-3xl font-bold text-blue-400">{metrics.nodes}</div>
                        </GlassCard>
                    </div>

                    <button
                        onClick={handleLaunch}
                        className="group relative px-12 py-6 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                    >
                        <span className="flex items-center gap-3">
                            <Rocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                            INITIATE LAUNCH SEQUENCE
                        </span>
                    </button>
                </div>
            </main>
        </div>
    );
}
