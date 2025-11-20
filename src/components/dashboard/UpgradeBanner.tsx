"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';

interface UpgradeBannerProps {
    message?: string;
    ctaText?: string;
    variant?: 'default' | 'compact';
}

export default function UpgradeBanner({
    message = "Unlock Wolf Pack automation & lifetime data for $99",
    ctaText = "Upgrade to Founders",
    variant = 'default'
}: UpgradeBannerProps) {
    const router = useRouter();

    if (variant === 'compact') {
        return (
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-500" size={18} />
                        <span className="text-sm font-medium text-zinc-200">{message}</span>
                    </div>
                    <button
                        onClick={() => router.push('/offer')}
                        className="text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                        {ctaText} <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border border-yellow-500/40 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-yellow-500" size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                                Limited Offer
                            </span>
                            <span className="text-xs text-zinc-400">13/100 spots left</span>
                        </div>

                        <h3 className="text-xl font-bold text-zinc-100 mb-2">
                            {message}
                        </h3>

                        <div className="flex flex-wrap gap-3 text-sm text-zinc-300 mb-4">
                            <span className="flex items-center gap-1">
                                ✅ Real-time auto-sync
                            </span>
                            <span className="flex items-center gap-1">
                                ✅ AI Fee Auditor
                            </span>
                            <span className="flex items-center gap-1">
                                ✅ 24/7 Risk Guardian
                            </span>
                            <span className="flex items-center gap-1">
                                ✅ 20% referral income
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/offer')}
                        className="ml-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
                    >
                        {ctaText} <ArrowRight size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4 pt-4 border-t border-yellow-500/20">
                    <span>💰 $99 one-time (lifetime access)</span>
                    <span>|</span>
                    <span>🔒 30-day money-back guarantee</span>
                    <span>|</span>
                    <span>⚡ Instant activation</span>
                </div>
            </div>
        </div>
    );
}
