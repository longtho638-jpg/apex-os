'use client';

import { Card } from '@/components/ui/card';
import { UNIFIED_TIERS, TierId } from '@/config/unified-tiers';
import { Crown, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CommissionDashboardProps {
    currentTier: TierId;
    totalReferrals?: number;
    totalEarnings?: number;
}

export function CommissionDashboard({
    currentTier = 'FREE',
    totalReferrals = 0,
    totalEarnings = 0,
}: CommissionDashboardProps) {
    const t = useTranslations('DashboardComponents.Commission');
    const tier = UNIFIED_TIERS[currentTier];
    const rates = tier.commissionRates;

    return (
        <div className="space-y-6">
            {/* Current Tier Overview */}
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <Crown className="w-6 h-6 text-emerald-400" />
                            {t('tier_title', { tier: tier.name })}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                            {t('current_structure')}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-400">
                            {(rates.total * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-zinc-500">{t('total_commission')}</div>
                    </div>
                </div>

                {/* Commission Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">{t('level_1')}</div>
                        <div className="text-2xl font-bold text-white">
                            {(rates.l1 * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">{t('level_2')}</div>
                        <div className="text-2xl font-bold text-white">
                            {(rates.l2 * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">{t('level_3')}</div>
                        <div className="text-2xl font-bold text-white">
                            {(rates.l3 * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">{t('level_4')}</div>
                        <div className="text-2xl font-bold text-white">
                            {(rates.l4 * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{totalReferrals}</div>
                            <div className="text-xs text-zinc-500">{t('total_referrals')}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                            <div className="text-xs text-zinc-500">{t('total_earnings')}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                ${totalReferrals > 0 ? (totalEarnings / totalReferrals).toFixed(2) : '0.00'}
                            </div>
                            <div className="text-xs text-zinc-500">{t('avg_referral')}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Upgrade Incentive */}
            {currentTier !== 'ELITE' && (
                <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <div className="flex items-start gap-4">
                        <Crown className="w-8 h-8 text-purple-400 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="font-bold text-lg mb-2">{t('upgrade_title')}</h4>
                            <p className="text-sm text-zinc-400 mb-4">
                                {currentTier === 'FREE' && t('upgrade_desc_free')}
                                {currentTier === 'PRO' && t('upgrade_desc_pro')}
                                {currentTier === 'TRADER' && t('upgrade_desc_trader')}
                            </p>
                            <div className="flex gap-4 text-sm">
                                {currentTier === 'FREE' && (
                                    <>
                                        <div>
                                            <span className="text-zinc-500">{t('current')}</span>{' '}
                                            <span className="font-bold text-red-400">0%</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500">PRO:</span>{' '}
                                            <span className="font-bold text-emerald-400">35%</span>
                                        </div>
                                    </>
                                )}
                                {currentTier === 'PRO' && (
                                    <>
                                        <div>
                                            <span className="text-zinc-500">{t('current')}</span>{' '}
                                            <span className="font-bold">35%</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500">TRADER:</span>{' '}
                                            <span className="font-bold text-emerald-400">55%</span>
                                        </div>
                                    </>
                                )}
                                {currentTier === 'TRADER' && (
                                    <>
                                        <div>
                                            <span className="text-zinc-500">{t('current')}</span>{' '}
                                            <span className="font-bold">55%</span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500">ELITE:</span>{' '}
                                            <span className="font-bold text-purple-400">75%</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* How It Works */}
            <Card className="p-6">
                <h4 className="font-bold mb-4">{t('how_works')}</h4>
                <div className="space-y-3 text-sm text-zinc-400">
                    <div className="flex gap-3">
                        <div className="font-bold text-white min-w-[80px]">{t('level_1')}:</div>
                        <div>{t('l1_desc')} ({(rates.l1 * 100).toFixed(0)}%)</div>
                    </div>
                    <div className="flex gap-3">
                        <div className="font-bold text-white min-w-[80px]">{t('level_2')}:</div>
                        <div>{t('l2_desc')} ({(rates.l2 * 100).toFixed(0)}%)</div>
                    </div>
                    <div className="flex gap-3">
                        <div className="font-bold text-white min-w-[80px]">{t('level_3')}:</div>
                        <div>{t('l3_desc')} ({(rates.l3 * 100).toFixed(0)}%)</div>
                    </div>
                    <div className="flex gap-3">
                        <div className="font-bold text-white min-w-[80px]">{t('level_4')}:</div>
                        <div>{t('l4_desc')} ({(rates.l4 * 100).toFixed(0)}%)</div>
                    </div>
                    <div className="mt-4 p-3 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400">
                        <strong>{t('pool_cap')}</strong> {t('pool_cap_desc')}
                    </div>
                </div>
            </Card>
        </div>
    );
}
