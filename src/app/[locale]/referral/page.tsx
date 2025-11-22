"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { UserPlus, Copy, Check, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useReferral } from '@/hooks/useReferral';
import { cn } from '@/lib/utils';

export default function ReferralPage() {
    const t = useTranslations('Referral');
    const { data, loading, error, refetch } = useReferral();
    const [copied, setCopied] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const copyReferralLink = () => {
        if (!data?.referral_link) return;
        navigator.clipboard.writeText(data.referral_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const paginatedReferrals = data?.referrals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) || [];
    const totalPages = Math.ceil((data?.referrals.length || 0) / itemsPerPage);

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#00FF94]/10 rounded-lg border border-[#00FF94]/20 shadow-[0_0_15px_rgba(0,255,148,0.1)]">
                            <UserPlus className="h-5 w-5 text-[#00FF94]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Giới Thiệu</h1>
                            <p className="text-xs text-gray-400">Referral Program</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {/* Error State */}
                    {error && (
                        <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                            <p className="text-red-400 mb-2 font-medium">Error loading referral data</p>
                            <p className="text-sm text-gray-400">{error.message}</p>
                            <button
                                onClick={refetch}
                                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !data && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-24 mb-4" />
                                        <div className="h-8 bg-white/10 rounded w-32" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {data && !loading && (
                        <div className="space-y-6">
                            {/* Referral Link Card */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Your Referral Link</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={data.referral_link}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
                                        />
                                        <button
                                            onClick={copyReferralLink}
                                            className="px-6 py-3 bg-[#00FF94]/20 hover:bg-[#00FF94]/30 text-[#00FF94] rounded-lg font-bold transition-all flex items-center gap-2"
                                        >
                                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/20">
                                        <div className="text-sm text-gray-300">
                                            <span className="font-bold text-[#00FF94]">Your Code:</span> {data.referral_code}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="glass-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Total Referrals</span>
                                        <Users className="h-4 w-4 text-[#8B5CF6]" />
                                    </div>
                                    <div className="text-3xl font-bold text-white">
                                        {data.total_referrals}
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Total Commission</span>
                                        <TrendingUp className="h-4 w-4 text-[#00FF94]" />
                                    </div>
                                    <div className="text-3xl font-bold text-[#00FF94]">
                                        ${data.total_commission.toFixed(2)}
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">This Month</span>
                                        <TrendingUp className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div className="text-3xl font-bold text-white">
                                        ${data.this_month_commission.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Referral Table */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Your Referrals</h2>

                                {data.referrals.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                        <th className="pb-3">Referee ID</th>
                                                        <th className="pb-3">Signup Date</th>
                                                        <th className="pb-3 text-right">Volume</th>
                                                        <th className="pb-3 text-right">Commission</th>
                                                        <th className="pb-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {paginatedReferrals.map((ref, idx) => (
                                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="py-3 font-mono text-gray-300">
                                                                {ref.referee_id.slice(0, 8)}...
                                                            </td>
                                                            <td className="py-3 text-gray-400">
                                                                {new Date(ref.signup_date).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-3 text-right font-bold text-white">
                                                                ${ref.volume.toLocaleString()}
                                                            </td>
                                                            <td className="py-3 text-right font-bold text-[#00FF94]">
                                                                ${ref.commission.toFixed(2)}
                                                            </td>
                                                            <td className="py-3">
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded text-xs font-medium uppercase",
                                                                    ref.status === 'active' ? "bg-[#00FF94]/20 text-[#00FF94]" : "bg-gray-500/20 text-gray-400"
                                                                )}>
                                                                    {ref.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="text-sm text-gray-400">
                                                    Page {currentPage} of {totalPages}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-sm"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-sm"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-12 text-center text-gray-400">
                                        <UserPlus className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-2">No Referrals Yet</h3>
                                        <p>Share your referral link to start earning commission!</p>
                                    </div>
                                )}
                            </div>

                            {/* How It Works */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">How It Works</h2>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#00FF94]/20 flex items-center justify-center mx-auto mb-3">
                                            <span className="text-[#00FF94] font-bold">1</span>
                                        </div>
                                        <h3 className="font-bold mb-1">Share Your Link</h3>
                                        <p className="text-sm text-gray-400">Send your referral link to friends</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#00FF94]/20 flex items-center justify-center mx-auto mb-3">
                                            <span className="text-[#00FF94] font-bold">2</span>
                                        </div>
                                        <h3 className="font-bold mb-1">They Sign Up</h3>
                                        <p className="text-sm text-gray-400">New users join using your code</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#00FF94]/20 flex items-center justify-center mx-auto mb-3">
                                            <span className="text-[#00FF94] font-bold">3</span>
                                        </div>
                                        <h3 className="font-bold mb-1">Earn Commission</h3>
                                        <p className="text-sm text-gray-400">Get 10% of their trading fees</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
