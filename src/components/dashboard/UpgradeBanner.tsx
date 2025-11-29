"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UpgradeBannerProps {
    message?: string;
    ctaText?: string;
    variant?: 'default' | 'compact';
}

export default function UpgradeBanner({
    message,
    ctaText,
    variant = 'default'
}: UpgradeBannerProps) {
    const t = useTranslations('DashboardComponents.UpgradeBanner');
    const router = useRouter();

    if (variant === 'compact') {
        return (
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-500" size={18} />
                        <span className="text-sm font-medium text-zinc-200">{message || t('message')}</span>
                    </div>
                    <button
                        onClick={() => router.push('/offer')}
                        className="text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                    >
                        {ctaText || t('cta')} <ArrowRight size={14} />
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
                                {t('limited_offer')}
                            </span>
                            <span className="text-xs text-zinc-400">{t('spots_left')}</span>
                        </div>

                        <h3 className="text-xl font-bold text-zinc-100 mb-2">
                            {message || t('message')}
                        </h3>

                        <div className="flex flex-wrap gap-3 text-sm text-zinc-300 mb-4">
                            <span className="flex items-center gap-1">
                                ✅ {t('feature_sync')}
                            </span>
                            <span className="flex items-center gap-1">
                                ✅ {t('feature_auditor')}
                            </span>
                            <span className="flex items-center gap-1">
                                ✅ {t('feature_guardian')}
                            </span>
                            <span className="flex items-center gap-1">
                                ✅ {t('feature_ref')}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/offer')}
                        className="ml-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all hover:scale-105 shadow-lg flex items-center gap-2 whitespace-nowrap"
                    >
                        {ctaText || t('cta')} <ArrowRight size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4 pt-4 border-t border-yellow-500/20">
                    <span>💰 {t('price')}</span>
                    <span>|</span>
                    <span>🔒 {t('guarantee')}</span>
                    <span>|</span>
                    <span>⚡ {t('activation')}</span>
                </div>
            </div>
        </div>
    );
}
