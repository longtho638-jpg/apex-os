'use client';

import React, { useState, useEffect } from 'react';
import { Snowflake, ShieldCheck, ExternalLink, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { getSupabaseClientSide } from '@/lib/supabase';

// Initialize Supabase client for client-side fetching
const supabase = getSupabaseClientSide();


interface ColdWallet {
    id: string;
    label: string;
    address: string;
    chain: string;
    balance: number;
    currency: string;
    last_verified_at: string;
    status: 'ACTIVE' | 'INACTIVE' | 'COMPROMISED';
}

export default function ColdStorageVault() {
    const [wallets, setWallets] = useState<ColdWallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showRebalance, setShowRebalance] = useState(false);

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const { data, error } = await supabase
                .from('cold_wallets')
                .select('*')
                .order('balance', { ascending: false });

            if (data) setWallets(data);
        } catch (error) {
            console.error('Error fetching cold wallets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalValue = wallets.reduce((acc, w) => {
        // Mock conversion rates for demo
        const rate = w.currency === 'BTC' ? 65000 : w.currency === 'ETH' ? 3500 : w.currency === 'SOL' ? 150 : 1;
        return acc + (w.balance * rate);
    }, 0);

    return (
        <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Snowflake className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Cold Storage Vaults</h3>
                        <p className="text-sm text-gray-400">Offline Asset Management</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowRebalance(!showRebalance)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-blue-300 border border-blue-500/20 transition-colors"
                >
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>Rebalance Check</span>
                </button>
            </div>

            {/* Total Value Card */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-900/20 to-black rounded-xl border border-blue-500/20 relative z-10">
                <div className="text-sm text-blue-300 mb-1">Total Vault Value (Est.)</div>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <ShieldCheck className="h-3 w-3 text-green-400" />
                    <span>100% Offline Storage • Multi-Sig Protected</span>
                </div>
            </div>

            {/* Rebalance Suggestion (Conditional) */}
            {showRebalance && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" />
                        Rebalance Suggestion
                    </h4>
                    <p className="text-xs text-gray-300 mb-3">
                        Hot wallet liquidity is high ($2.45M). Recommended action:
                    </p>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                        <div className="text-sm text-white">Move <span className="font-bold text-[#00FF94]">$500,000 USDT</span> to Vault Alpha</div>
                        <button className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold hover:bg-yellow-400 transition-colors">
                            Create Proposal
                        </button>
                    </div>
                </div>
            )}

            {/* Wallet List */}
            <div className="space-y-3 relative z-10">
                {isLoading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-lg" />)}
                    </div>
                ) : (
                    wallets.map((wallet) => (
                        <div key={wallet.id} className="group p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${wallet.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="font-medium text-white">{wallet.label}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-gray-400">{wallet.chain}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white font-mono">
                                        {wallet.balance.toLocaleString()} <span className="text-xs text-gray-500">{wallet.currency}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="font-mono truncate max-w-[200px] opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    {wallet.address}
                                    <ExternalLink className="h-3 w-3" />
                                </div>
                                <div>Verified: {new Date(wallet.last_verified_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
