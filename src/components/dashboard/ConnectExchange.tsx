'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronRight, Check, AlertCircle, RefreshCw, X, Globe, ExternalLink, Copy, UserPlus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exchange, VerificationResult } from '@/types/exchange';
import { useTranslations } from 'next-intl';

// Supported Exchanges (Synced with Admin Providers)
const SUPPORTED_EXCHANGES: Exchange[] = ['binance', 'okx', 'bybit', 'exness'];

// WOW Factor: Deep Links & Guides
const EXCHANGE_GUIDES: Record<string, {
    register: string,
    subAccount: string,
    color: string,
    refCode: string
}> = {
    binance: {
        register: 'https://accounts.binance.com/register?ref=LIMITLESS',
        subAccount: 'https://www.binance.com/en/my/settings/sub-account',
        color: 'text-yellow-400',
        refCode: 'LIMITLESS'
    },
    okx: {
        register: 'https://www.okx.com/join/LIMITLESS',
        subAccount: 'https://www.okx.com/account/sub-account',
        color: 'text-white',
        refCode: 'LIMITLESS'
    },
    bybit: {
        register: 'https://www.bybit.com/register?affiliate_id=LIMITLESS',
        subAccount: 'https://www.bybit.com/user/assets/sub-account',
        color: 'text-orange-400',
        refCode: 'LIMITLESS'
    },
    exness: {
        register: 'https://one.exness-track.com/a/LIMITLESS',
        subAccount: 'https://my.exness.com/accounts',
        color: 'text-yellow-500',
        refCode: 'LIMITLESS'
    }
};

export default function ConnectExchange() {
    const t = useTranslations('DashboardComponents.ConnectExchange');
    const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
    const [viewMode, setViewMode] = useState<'select' | 'action' | 'verify'>('select');
    const [uid, setUid] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [resultData, setResultData] = useState<VerificationResult | null>(null);

    const handleConnect = async () => {
        if (!uid || !selectedExchange) return;
        setStatus('verifying');
        setMessage('');

        try {
            const res = await fetch('/api/v1/user/verify-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensure cookies are sent
                body: JSON.stringify({
                    exchange: selectedExchange,
                    user_uid: uid
                })
            });

            const data = await res.json();

            if (data.success && data.verified) {
                setStatus('success');
                setResultData(data);
            } else {
                setStatus('error');
                setMessage(data.message || 'Verification failed. Check your UID.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    const closeModal = () => {
        setSelectedExchange(null);
        setViewMode('select');
        setUid('');
        setStatus('idle');
        setMessage('');
    };

    const handleExchangeSelect = (ex: Exchange) => {
        setSelectedExchange(ex);
        setViewMode('action');
    };

    const handleActionSelect = (action: 'new' | 'existing') => {
        if (action === 'new') {
            // Auto open register link
            if (selectedExchange) window.open(EXCHANGE_GUIDES[selectedExchange].register, '_blank');
            setViewMode('verify');
        } else {
            // Existing user flow (Sub-account)
            setViewMode('verify');
        }
    };

    const copyRefCode = () => {
        if (selectedExchange) {
            navigator.clipboard.writeText(EXCHANGE_GUIDES[selectedExchange].refCode);
            // Optional: Show toast
        }
    };

    return (
        <div className="rounded-xl border border-[#00FF00]/30 bg-[#00FF00]/5 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF00]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/20">
                            <Wallet className="h-5 w-5 text-[#00FF00]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-mono text-white">Partner Link</h3>
                            <p className="text-[10px] text-[#00FF00]/70 font-mono tracking-wider">SECURE PROTOCOL V4</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
                        SYSTEM ONLINE
                    </div>
                </div>

                {/* Exchange Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {SUPPORTED_EXCHANGES.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => handleExchangeSelect(ex)}
                            className="group/btn flex flex-col items-center justify-center p-3 rounded-lg border border-white/5 bg-black/40 hover:border-[#00FF00]/50 hover:bg-[#00FF00]/10 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover/btn:bg-[#00FF00]/20 transition-colors">
                                <Globe className={`h-4 w-4 text-gray-400 group-hover/btn:text-[#00FF00]`} />
                            </div>
                            <span className="capitalize text-[10px] font-mono font-bold text-gray-400 group-hover/btn:text-[#00FF00]">{ex}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Wizard Modal */}
            <AnimatePresence>
                {selectedExchange && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg bg-[#0a0a0a] border border-[#00FF00]/30 rounded-xl shadow-2xl relative overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#00FF00]/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center">
                                        <Globe className={cn("h-5 w-5", EXCHANGE_GUIDES[selectedExchange].color)} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white capitalize">{selectedExchange} Connection</h3>
                                        <p className="text-xs text-zinc-400">Step {viewMode === 'action' ? '1' : '2'} of 2</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="p-6">
                                {/* VIEW 1: ACTION SELECTION */}
                                {viewMode === 'action' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-zinc-300 mb-4 text-center">Do you already have a {selectedExchange} account?</p>

                                        <button
                                            onClick={() => handleActionSelect('new')}
                                            className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00FF00]/10 hover:border-[#00FF00]/50 transition-all flex items-center gap-4 group"
                                        >
                                            <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-[#00FF00]/20">
                                                <UserPlus className="h-5 w-5 text-zinc-400 group-hover:text-[#00FF00]" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white group-hover:text-[#00FF00]">No, Create New Account</div>
                                                <div className="text-xs text-zinc-500">Get lifetime rebate benefits immediately</div>
                                            </div>
                                            <ChevronRight className="ml-auto h-5 w-5 text-zinc-600 group-hover:text-[#00FF00]" />
                                        </button>

                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-zinc-500">OR</span></div>
                                        </div>

                                        <button
                                            onClick={() => handleActionSelect('existing')}
                                            className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all flex items-center gap-4 group"
                                        >
                                            <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-blue-500/20">
                                                <LogIn className="h-5 w-5 text-zinc-400 group-hover:text-blue-400" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white group-hover:text-blue-400">Yes, I have an account</div>
                                                <div className="text-xs text-zinc-500">Connect via Sub-account (Recommended)</div>
                                            </div>
                                            <ChevronRight className="ml-auto h-5 w-5 text-zinc-600 group-hover:text-blue-400" />
                                        </button>
                                    </div>
                                )}

                                {/* VIEW 2: VERIFY / SUB-ACCOUNT GUIDE */}
                                {viewMode === 'verify' && (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 space-y-2">
                                            <div className="flex items-center gap-2 font-bold text-blue-400">
                                                <AlertCircle className="h-4 w-4" />
                                                WOW TIP: Use a Sub-Account!
                                            </div>
                                            <p>
                                                Most exchanges allow you to create a <strong>Sub-Account</strong> to trade separately.
                                                This keeps your main account safe and allows you to link just this sub-account to Apex for rebates.
                                            </p>
                                            <div className="flex gap-2 pt-2">
                                                <a
                                                    href={EXCHANGE_GUIDES[selectedExchange].subAccount}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={copyRefCode}
                                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    Create Sub-Account <ExternalLink className="h-3 w-3" />
                                                </a>
                                                <button onClick={copyRefCode} className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-md border border-blue-500/30 flex items-center gap-2 transition-colors">
                                                    <Copy className="h-3 w-3" /> Copy Ref Code
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-zinc-400 font-mono mb-2 block">Enter UID (Main or Sub-Account)</label>
                                            <input
                                                type="text"
                                                value={uid}
                                                onChange={(e) => setUid(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#00FF00] outline-none"
                                                placeholder="e.g. 12345678"
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="text-xs text-red-400 flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
                                                <AlertCircle className="h-4 w-4" /> {message}
                                            </div>
                                        )}

                                        {status === 'success' && (
                                            <div className="text-xs text-emerald-400 flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg">
                                                <Check className="h-4 w-4" /> Verified! Account linked successfully.
                                            </div>
                                        )}

                                        <button
                                            onClick={handleConnect}
                                            disabled={!uid || status === 'verifying' || status === 'success'}
                                            className="w-full bg-[#00FF00] text-black font-bold font-mono py-3 rounded-lg hover:bg-[#00FF00]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {status === 'verifying' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            {status === 'verifying' ? 'Verifying...' : 'Verify UID'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}