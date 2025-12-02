"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Users, Copy, Check, UserPlus, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWolfPack } from '@/hooks/useWolfPack';
import { cn } from '@/lib/utils';
import { useUserTier } from '@/hooks/useUserTier';

export default function WolfPackPage() {
    const t = useTranslations('WolfPack');
    const { data, loading, error, refetch } = useWolfPack();
    const { tier } = useUserTier();
    const [copied, setCopied] = useState(false);

    // Tier Bonus Calculation
    const tierBonus = tier === 'WHALE' ? 20 : tier === 'ELITE' ? 10 : tier === 'PRO' ? 5 : 0;

    const copyInviteLink = () => {
        if (!data?.invite_link) return;
        navigator.clipboard.writeText(data.invite_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#8B5CF6]/10 rounded-lg border border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                            <Users className="h-5 w-5 text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">{t('title')}</h1>
                            <p className="text-xs text-zinc-400">{t('subtitle')}</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {/* Error State */}
                    {error && (
                        <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                            <p className="text-red-400 mb-2 font-medium">{t('error_loading')}</p>
                            <p className="text-sm text-zinc-400">{error.message}</p>
                            <button
                                onClick={refetch}
                                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                            >
                                {t('retry')}
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !data && (
                        <div className="space-y-6">
                            <div className="glass-card rounded-xl p-6 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-24 mb-4" />
                                <div className="h-8 bg-white/10 rounded w-32" />
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {data && !loading && (
                        <div className="space-y-6">
                            {/* Pack Status */}
                            {data.in_pack ? (
                                <>
                                    {/* Pack Stats */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="glass-card rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-zinc-400">{t('members')}</span>
                                                <Users className="h-4 w-4 text-[#8B5CF6]" />
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                {data.member_count}
                                            </div>
                                        </div>

                                        <div className="glass-card rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-zinc-400">{t('total_volume')}</span>
                                                <TrendingUp className="h-4 w-4 text-[#00FF94]" />
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                ${data.total_volume.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="glass-card rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-zinc-400">{t('shared_rebates')}</span>
                                                <TrendingUp className="h-4 w-4 text-[#00FF94]" />
                                            </div>
                                            <div className="text-2xl font-bold text-[#00FF94]">
                                                ${data.shared_rebates.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-emerald-400 mt-1">
                                                +{tierBonus}% Tier Bonus Active
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pack Members Table */}
                                    <div className="glass-card rounded-xl p-6">
                                        <h2 className="text-lg font-bold mb-4">{t('members')}</h2>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-sm text-zinc-400 border-b border-white/10">
                                                        <th className="pb-3">{t('user_id')}</th>
                                                        <th className="pb-3">{t('role')}</th>
                                                        <th className="pb-3 text-right">{t('contribution')}</th>
                                                        <th className="pb-3">{t('joined')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {data.members.map((member, idx) => (
                                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="py-3 font-mono text-gray-300">
                                                                {member.user_id.slice(0, 8)}...
                                                            </td>
                                                            <td className="py-3">
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded text-xs font-medium uppercase",
                                                                    member.role === 'alpha' && "bg-[#8B5CF6]/20 text-[#8B5CF6]",
                                                                    member.role === 'beta' && "bg-blue-500/20 text-blue-400",
                                                                    member.role === 'member' && "bg-gray-500/20 text-zinc-400"
                                                                )}>
                                                                    {member.role}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 text-right font-bold text-white">
                                                                ${member.contribution.toLocaleString()}
                                                            </td>
                                                            <td className="py-3 text-zinc-400">
                                                                {new Date(member.joined_at).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Invite Link */}
                                    <div className="glass-card rounded-xl p-6">
                                        <h2 className="text-lg font-bold mb-4">{t('invite_members')}</h2>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={data.invite_link || `${window.location.origin}/r/APEX-${data.member_count}`}
                                                readOnly
                                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
                                            />
                                            <button
                                                onClick={copyInviteLink}
                                                className="px-4 py-2 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] rounded-lg font-medium transition-all flex items-center gap-2"
                                            >
                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                {copied ? t('copied') : t('copy')}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Not in Pack - Join CTA */
                                <div className="glass-card rounded-xl p-12 text-center">
                                    <Users className="h-20 w-20 text-[#8B5CF6] mx-auto mb-6" />
                                    <h2 className="text-2xl font-bold mb-3">{t('join_pack_title')}</h2>
                                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                                        {t('join_pack_desc')}
                                    </p>
                                    <div className="flex gap-3 max-w-md mx-auto">
                                        <input
                                            type="text"
                                            placeholder={t('enter_invite_code')}
                                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50"
                                        />
                                        <button className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white rounded-lg font-bold transition-all flex items-center gap-2">
                                            <UserPlus className="h-5 w-5" />
                                            {t('join_pack_btn')}
                                        </button>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/10">
                                        <p className="text-sm text-zinc-500 mb-3">{t('or_create_pack')}</p>
                                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all">
                                            {t('create_pack_btn')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
