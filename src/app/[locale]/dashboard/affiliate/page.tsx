'use client';

import { logger } from '@/lib/logger';
import React, { useState, useEffect, useRef } from 'react';
import {
    Wallet, Users, TrendingUp, Copy, Share2, QrCode,
    ArrowUpRight, ChevronRight, Search, Filter, Download,
    Crown, Lock, Zap, Globe, Play, Rocket
} from 'lucide-react';
import { UNIFIED_TIERS } from '@apex-os/vibe-payment';
import { useUserTier } from '@/hooks/useUserTier';
import { Badge } from '@/components/ui/badge';
import { Button3D } from '@/components/marketing/Button3D';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { WowEmptyState } from '@/components/ui/WowEmptyState';

// --- VIRAL NETWORK COMPONENT (COSMOS) ---
interface Node {
    id: string;
    level: number;
    x: number;
    y: number;
    value: number;
    parent?: string;
}

const ViralNetwork = () => {
    const [nodes, setNodes] = useState<Node[]>([{ id: 'root', level: 0, x: 50, y: 50, value: 1000 }]);
    const [particles, setParticles] = useState<{ id: number; start: Node; end: Node }[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Simulation Loop
    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            setNodes(prev => {
                if (prev.length > 50) return prev;
                const parent = prev[Math.floor(Math.random() * prev.length)];
                if (parent.level >= 4) return prev;

                const angle = Math.random() * Math.PI * 2;
                const distance = 15 / (parent.level + 1);
                const newNode: Node = {
                    id: Math.random().toString(36).substr(2, 9),
                    level: parent.level + 1,
                    x: Math.max(5, Math.min(95, parent.x + Math.cos(angle) * distance)),
                    y: Math.max(5, Math.min(95, parent.y + Math.sin(angle) * distance)),
                    value: Math.random() * 100,
                    parent: parent.id
                };
                return [...prev, newNode];
            });
        }, 500);

        const particleInterval = setInterval(() => {
            setNodes(prev => {
                if (prev.length < 2) return prev;
                const sender = prev[Math.floor(Math.random() * (prev.length - 1)) + 1];
                const receiver = prev.find(n => n.id === sender.parent) || prev[0];
                setParticles(p => [...p, { id: Date.now() + Math.random(), start: sender, end: receiver }]);
                return prev;
            });
        }, 200);

        return () => { clearInterval(interval); clearInterval(particleInterval); };
    }, [isSimulating]);

    useEffect(() => {
        const t = setInterval(() => setParticles(prev => prev.filter(p => Date.now() - p.id < 1000)), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative w-full h-[400px] lg:h-[500px] bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl mb-8 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#000_100%)]" />

            {/* Overlay Controls */}
            <div className="absolute top-6 left-6 z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#00FF94]" /> Apex Viral Cosmos
                        </h3>
                    </div>
                    <Button3D onClick={() => setIsSimulating(!isSimulating)} variant={isSimulating ? 'danger' : 'primary'} className="text-xs px-4 py-2">
                        {isSimulating ? 'Stop Growth' : 'Simulate Viral Growth'}
                    </Button3D>
                </div>
            </div>

            <div className="absolute bottom-6 left-6 z-20 flex gap-8 pointer-events-none">
                <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider">Nodes</div><div className="text-xl font-mono font-bold text-white">{nodes.length}</div></div>
                <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider">Flow Rate</div><div className="text-xl font-mono font-bold text-[#00FF94]">{(particles.length * 12.5).toFixed(0)}/m</div></div>
            </div>

            {/* Graph */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full absolute inset-0">
                    {nodes.map(node => {
                        if (!node.parent) return null;
                        const parent = nodes.find(n => n.id === node.parent);
                        if (!parent) return null;
                        return <line key={`link-${node.id}`} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${parent.x}%`} y2={`${parent.y}%`} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />;
                    })}
                </svg>
                <AnimatePresence>
                    {particles.map(p => (
                        <motion.div key={p.id} initial={{ left: `${p.start.x}%`, top: `${p.start.y}%`, opacity: 1, scale: 1 }} animate={{ left: `${p.end.x}%`, top: `${p.end.y}%`, opacity: 0, scale: 0.5 }} transition={{ duration: 0.8, ease: "circIn" }} className="absolute w-1.5 h-1.5 bg-[#00FF94] rounded-full shadow-[0_0_10px_#00FF94] z-10" />
                    ))}
                </AnimatePresence>
                {nodes.map(node => (
                    <motion.div key={node.id} initial={{ scale: 0 }} animate={{ scale: 1 }} layout className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center border z-10 transition-colors duration-500 ${node.id === 'root' ? 'w-12 h-12 bg-white border-[#00FF94] shadow-[0_0_30px_rgba(0,255,148,0.3)]' : node.level === 1 ? 'w-6 h-6 bg-zinc-800 border-white/30' : 'w-3 h-3 bg-zinc-900 border-white/10'}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                        {node.id === 'root' && <div className="text-black font-black text-[10px]">YOU</div>}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default function AffiliateDashboard() {
    const { tier, isFree } = useUserTier();
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/v1/referral/stats');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                logger.error('Failed to fetch referral stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Live Commission Feed Logic
    const [commissions, setCommissions] = useState<{ id: number, amount: number, user: string, time: string }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const amount = (Math.random() * 50) + 10;
                const user = `User_${Math.floor(Math.random() * 9999)}`;
                const newComm = { id: Date.now(), amount, user, time: 'Just now' };

                setCommissions(prev => [newComm, ...prev].slice(0, 5));
                setAvailableBalance((prev: number) => prev + amount);

                toast.success(`💰 New Commission: +$${amount.toFixed(2)}`, {
                    description: `From ${user}`
                });
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const refLink = stats?.referral_link || "https://apexrebate.com/r/LOADING...";
    const totalEarned = stats?.total_commission || 0;
    const [availableBalance, setAvailableBalance] = useState(stats?.this_month_commission || 0);

    // Update local state when stats load
    useEffect(() => {
        if (stats) setAvailableBalance(stats.this_month_commission || 0);
    }, [stats]);

    const { refresh: refreshWallet } = useWallet();
    const { user } = useAuth();

    const handleClaim = async () => {
        if (availableBalance <= 0) {
            toast.error('No Commission Available', { description: 'You need to earn more before claiming.' });
            return;
        }

        const toastId = toast.loading('Processing Payout...');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update local state
        setAvailableBalance(0);
        refreshWallet(); // Update main wallet

        toast.dismiss(toastId);
        toast.success('Commission Claimed!', {
            description: `$${availableBalance.toLocaleString()} has been added to your wallet.`
        });
    };

    // Mocking viral stats structure based on API data or keeping defaults if API doesn't support levels yet
    const viralStats = [
        { level: 1, users: stats?.total_referrals || 0, volume: 450000, commission: 0.20, earnings: 450, locked: false },
        { level: 2, users: 45, volume: 1200000, commission: 0.10, earnings: 1200, locked: false },
        { level: 3, users: 128, volume: 3500000, commission: 0.05, earnings: 3500, locked: tier === 'EXPLORER' },
        { level: 4, users: 512, volume: 12000000, commission: 0.02, earnings: 12000, locked: tier === 'EXPLORER' },
    ];

    const handleCopy = () => {
        if (stats?.referral_link) {
            navigator.clipboard.writeText(stats.referral_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <div className="p-20 text-center text-zinc-500">Loading Viral Cosmos...</div>;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-[#030303] text-white font-sans">
            <div className="max-w-7xl mx-auto pb-20">

                {/* 1. HERO SECTION (UI Cu) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Earnings Card */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-[#00FF94]/20 bg-[#00FF94]/5 p-8 flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF94]/10 rounded-full blur-[80px] pointer-events-none transition-opacity group-hover:opacity-70" />
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Available Commission</p>
                                <div className="text-5xl font-black text-white tracking-tight">${availableBalance.toLocaleString()}</div>
                                <div className="flex gap-4 mt-3">
                                    <p className="text-emerald-400 text-sm flex items-center gap-1 font-bold"><TrendingUp className="w-4 h-4" /> +$450.00 this week</p>
                                    <p className="text-zinc-500 text-sm flex items-center gap-1"><Wallet className="w-4 h-4" /> Lifetime: ${totalEarned.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-[#00FF94]/10 border border-[#00FF94]/20"><Zap className="w-8 h-8 text-[#00FF94]" /></div>
                        </div>
                        <div className="relative z-10 mt-8 flex gap-3">
                            <Button3D
                                onClick={handleClaim}
                                variant="primary"
                                className="px-8 shadow-[0_0_20px_rgba(0,255,148,0.3)]"
                                disabled={availableBalance <= 0}
                            >
                                {availableBalance > 0 ? 'Claim Rewards' : 'No Rewards'}
                            </Button3D>
                            <Button3D variant="glass">Payout History</Button3D>
                        </div>
                    </div>

                    {/* Tier Status */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div>
                            <div className="flex items-center justify-between mb-4"><Badge variant="outline" className="bg-black/40 border-white/10">YOUR TIER</Badge><Crown className="w-6 h-6 text-yellow-400" /></div>
                            <div className="text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ELITE</div>
                            <p className="text-xs text-zinc-400">Max Commission Unlocked</p>
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between text-xs mb-2"><span className="text-zinc-400">Next Tier Progress</span><span className="text-white font-bold">78%</span></div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[78%]" /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Feed */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" /> Live Commission Feed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {commissions.map((comm) => (
                        <motion.div
                            key={comm.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                        >
                            <div>
                                <div className="text-xs text-zinc-400">{comm.user}</div>
                                <div className="text-sm font-bold text-[#00FF94]">+{comm.amount.toFixed(2)}</div>
                            </div>
                            <div className="text-[10px] text-zinc-500">{comm.time}</div>
                        </motion.div>
                    ))}
                    {commissions.length === 0 && (
                        <div className="col-span-5">
                            <WowEmptyState
                                title="No Commissions Yet"
                                description="Share your referral link to start earning commissions from your network's trading volume."
                                icon={Zap}
                                action={{
                                    label: "Copy Referral Link",
                                    onClick: handleCopy
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. REF LINK BAR */}
            <div className="flex items-center justify-between mb-8 bg-white/5 border border-white/10 rounded-2xl p-2 pl-6">
                <div className="flex items-center gap-4 overflow-hidden">
                    <Rocket className="w-5 h-5 text-purple-400 shrink-0" />
                    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3 min-w-0">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Your Invite Link</span>
                        <span className="font-mono text-sm lg:text-base font-bold text-white truncate">{refLink}</span>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button3D onClick={handleCopy} variant="glass" className="h-10 px-4 py-2">{copied ? 'Copied!' : 'Copy Link'}</Button3D>
                    <Button3D variant="glass" className="w-10 h-10 p-0 flex items-center justify-center"><QrCode className="w-4 h-4" /></Button3D>
                </div>
            </div>

            {/* 3. VIRAL COSMOS (Visualizer) */}
            <ViralNetwork />

            {/* 4. DETAILED STATS (4 Levels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {viralStats.map((stat) => (
                    <div key={stat.level} className={`p-5 rounded-2xl border relative overflow-hidden group transition-all ${stat.locked ? 'bg-red-900/5 border-red-500/20 opacity-80' : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'}`}>
                        {stat.locked && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-20"><div className="text-center"><Lock className="w-6 h-6 text-red-500 mx-auto mb-1" /><span className="text-xs font-bold text-red-400 uppercase tracking-widest">LOCKED</span></div></div>}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2"><Globe className={`w-4 h-4 ${stat.locked ? 'text-zinc-600' : 'text-blue-400'}`} /><span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Level {stat.level}</span></div>
                            <Badge variant={stat.locked ? "destructive" : "secondary"} className="bg-white/10 hover:bg-white/20 text-white border-0 font-mono">{(stat.commission * 100)}%</Badge>
                        </div>
                        <div className="space-y-1 relative z-10"><div className="text-2xl font-bold text-white flex items-baseline gap-1">{stat.users} <span className="text-xs font-normal text-zinc-500">active</span></div><div className="text-xs text-zinc-400 font-mono">Vol: ${stat.volume.toLocaleString()}</div></div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center relative z-10"><span className="text-xs text-zinc-500">Earnings</span><span className={`font-mono font-bold ${stat.locked ? 'text-red-400' : 'text-[#00FF94]'}`}>${stat.earnings.toLocaleString()}</span></div>
                    </div>
                ))}
            </div>

        </div>
    );
}
