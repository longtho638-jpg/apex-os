'use client';

import { Sidebar } from '@/components/os/sidebar';
import { CreditCard, TrendingUp, Bot, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserTier } from '@/hooks/useUserTier';
import { UNIFIED_TIERS, TIER_ORDER, type TierId } from '@apex-os/vibe-payment';

export default function BillingPage() {
    const { tier } = useUserTier();

    // Mock volume — in production, fetch from API
    const monthlyVolume = 25_000;
    const currentTierId = (tier as TierId) || 'EXPLORER';
    const currentTierData = UNIFIED_TIERS[currentTierId] || UNIFIED_TIERS.EXPLORER;
    const currentIdx = TIER_ORDER.indexOf(currentTierId);
    const nextTier = currentIdx < TIER_ORDER.length - 1 ? UNIFIED_TIERS[TIER_ORDER[currentIdx + 1]] : null;

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <CreditCard className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Billing & Usage</h1>
                            <p className="text-xs text-gray-400">RaaS — Zero subscription fees, revenue from spread</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Current Tier */}
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{currentTierData.name}</h2>
                                    <p className="text-sm text-gray-400">Volume-based tier — auto-upgrades with trading activity</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-emerald-400">$0</p>
                                    <p className="text-xs text-gray-500">/month — always free</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="p-3 bg-white/5 rounded-xl text-center">
                                    <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                                    <div className="text-lg font-bold">{(currentTierData.spreadBps / 100).toFixed(2)}%</div>
                                    <div className="text-[10px] text-gray-500">Spread</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center">
                                    <ArrowUpRight className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                                    <div className="text-lg font-bold">{(currentTierData.selfRebateRate * 100).toFixed(0)}%</div>
                                    <div className="text-[10px] text-gray-500">Rebate</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center">
                                    <Bot className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                                    <div className="text-lg font-bold">{currentTierData.agentSlots === Infinity ? '∞' : currentTierData.agentSlots}</div>
                                    <div className="text-[10px] text-gray-500">AI Agents</div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Volume Progress */}
                        {nextTier && (
                            <GlassCard className="p-6">
                                <h2 className="text-xl font-bold mb-4">Tier Progress</h2>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">${monthlyVolume.toLocaleString()} volume</span>
                                    <span className="text-emerald-400">${(nextTier.volumeThreshold).toLocaleString()} to unlock {nextTier.name}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (monthlyVolume / nextTier.volumeThreshold) * 100)}%` }}
                                    />
                                </div>
                            </GlassCard>
                        )}

                        {/* RaaS Explainer */}
                        <GlassCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">How RaaS Works</h2>
                            <div className="space-y-3 text-sm text-gray-400">
                                <p>1. You trade for <span className="text-white font-bold">FREE</span> — no monthly subscription</p>
                                <p>2. A small spread ({(currentTierData.spreadBps / 100).toFixed(2)}%) is applied per trade</p>
                                <p>3. You earn <span className="text-emerald-400 font-bold">{(currentTierData.selfRebateRate * 100).toFixed(0)}% back</span> as self-rebate</p>
                                <p>4. Higher volume = lower spread + more AI agents</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
