'use client';

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { useTranslations } from 'next-intl';
import { CreditCard, DollarSign, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function BillingPage() {
    const t = useTranslations();
    const { tier } = useUserTier();
    const { available, refresh: refreshWallet } = useWallet();
    const { user } = useAuth();

    const handleUpgrade = async () => {
        if (tier === 'PRO' || tier === 'ELITE' || tier === 'WHALE') return toast.info('You are already on a paid plan!');
        const price = 97;
        if (available < price) return toast.error('Insufficient funds in wallet');

        toast.promise(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In real app: Call /api/v1/billing/upgrade
            refreshWallet();
            // Force reload to update tier since useUserTier doesn't expose refresh
            window.location.reload();
            return 'Upgraded to PRO!';
        }, {
            loading: 'Processing upgrade...',
            success: 'Welcome to the PRO Club!',
            error: 'Upgrade failed'
        });
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <CreditCard className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Billing & Subscription</h1>
                            <p className="text-xs text-gray-400">Manage your subscription and payment methods</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">Current Plan</h2>
                                    <p className="text-sm text-gray-400">{tier} - Monthly</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-400">{tier !== 'FREE' ? '$97' : '$0'}</p>
                                    <p className="text-xs text-gray-500">/month</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Next billing date: {new Date().toLocaleDateString()}</span>
                                </div>
                                {tier === 'FREE' && (
                                    <button
                                        onClick={handleUpgrade}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                                    >
                                        Upgrade to PRO ($97)
                                    </button>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
                            <p className="text-gray-400 text-center py-8">No payment methods added yet</p>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
