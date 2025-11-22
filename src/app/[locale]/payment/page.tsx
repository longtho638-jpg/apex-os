"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { CreditCard, Crown, Check, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

export default function PaymentPage() {
    const t = useTranslations('Payment');
    const { data, loading, error, refetch } = useSubscription();

    // Tier colors
    const getTierColor = (tier: string) => {
        if (tier === 'founders') return 'text-yellow-500';
        if (tier === 'premium') return 'text-[#8B5CF6]';
        return 'text-gray-400';
    };

    const getTierBgColor = (tier: string) => {
        if (tier === 'founders') return 'bg-yellow-500/20 border-yellow-500/30';
        if (tier === 'premium') return 'bg-[#8B5CF6]/20 border-[#8B5CF6]/30';
        return 'bg-gray-500/20 border-gray-500/30';
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <CreditCard className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Thanh Toán</h1>
                            <p className="text-xs text-gray-400">Payment & Billing</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {/* Error State */}
                    {error && (
                        <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                            <p className="text-red-400 mb-2 font-medium">Error loading billing data</p>
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
                            <div className="glass-card rounded-xl p-6 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-24 mb-4" />
                                <div className="h-8 bg-white/10 rounded w-32" />
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {data && !loading && (
                        <div className="space-y-6">
                            {/* Current Plan Card */}
                            <div className={cn(
                                "glass-card rounded-xl p-8 border-2",
                                getTierBgColor(data.current_tier)
                            )}>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {data.current_tier === 'founders' && <Crown className="h-6 w-6 text-yellow-500" />}
                                            <h2 className="text-2xl font-bold">{data.plan_name}</h2>
                                        </div>
                                        <p className="text-gray-400">Current Plan</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">
                                            {data.price === 0 ? 'Free' : `$${data.price}`}
                                        </div>
                                        <div className="text-sm text-gray-400">{data.billing_cycle}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {data.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-[#00FF94]" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {data.price > 0 && (
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-sm text-gray-400">
                                            Next billing date: {new Date(data.next_billing_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Usage Metrics */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass-card rounded-xl p-6">
                                    <h3 className="text-sm text-gray-400 mb-4">API Usage</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{data.usage.api_calls.toLocaleString()} / {data.usage.api_limit.toLocaleString()}</span>
                                            <span className="text-gray-400">
                                                {((data.usage.api_calls / data.usage.api_limit) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#00FF94] to-blue-500"
                                                style={{ width: `${(data.usage.api_calls / data.usage.api_limit) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl p-6">
                                    <h3 className="text-sm text-gray-400 mb-4">Storage</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{data.usage.storage_gb.toFixed(2)} GB / {data.usage.storage_limit} GB</span>
                                            <span className="text-gray-400">
                                                {((data.usage.storage_gb / data.usage.storage_limit) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#8B5CF6] to-blue-500"
                                                style={{ width: `${(data.usage.storage_gb / data.usage.storage_limit) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Upgrade CTA (if free tier) */}
                            {data.current_tier === 'free' && (
                                <div className="glass-card rounded-xl p-8 text-center border-2 border-[#8B5CF6]/30">
                                    <TrendingUp className="h-16 w-16 text-[#8B5CF6] mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
                                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                        Unlock unlimited API calls, advanced features, and priority support
                                    </p>
                                    <button className="px-8 py-3 bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white rounded-lg font-bold transition-all">
                                        Upgrade Now - $29/month
                                    </button>
                                </div>
                            )}

                            {/* Payment History */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Payment History</h2>

                                {data.payment_history.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                    <th className="pb-3">Date</th>
                                                    <th className="pb-3">Description</th>
                                                    <th className="pb-3 text-right">Amount</th>
                                                    <th className="pb-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {data.payment_history.map((payment, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="py-3 text-gray-300">
                                                            {new Date(payment.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 text-gray-300">{payment.description}</td>
                                                        <td className="py-3 text-right font-bold text-white">
                                                            ${payment.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={cn(
                                                                "px-2 py-1 rounded text-xs font-medium uppercase",
                                                                payment.status === 'completed' && "bg-[#00FF94]/20 text-[#00FF94]",
                                                                payment.status === 'pending' && "bg-yellow-500/20 text-yellow-500",
                                                                payment.status === 'failed' && "bg-red-500/20 text-red-500"
                                                            )}>
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-400">
                                        <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                        <p>No payment history</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
