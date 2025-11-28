'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getSupabaseClientSide } from '@/lib/supabase';
import {
    Link,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Plus,
    RefreshCw,
    ShieldCheck,
    AlertTriangle,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'isomorphic-dompurify';
import { Exchange, EXCHANGES, LinkedAccount, ExchangeFormValues } from '@/types/exchange';
import { Skeleton } from '@/components/ui/skeleton';

// --- Types & Schema ---

const exchangeSchema = z.object({
    exchange: z.enum(['binance', 'bybit', 'okx', 'bitget', 'kucoin', 'mexc', 'gate', 'htx', 'bingx', 'phemex', 'coinex', 'bitmart'], {
        message: 'Please select a valid exchange',
    }),
    user_uid: z.string()
        .min(1, 'UID is required')
        .max(100, 'UID is too long')
        .regex(/^[a-zA-Z0-9]+$/, 'UID must be alphanumeric'),
});


export default function ExchangeLinkingManager() {
    const { user, token } = useAuth();
    const supabase = getSupabaseClientSide(); // Initialize inside component (client-side only)
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [relinkInfo, setRelinkInfo] = useState<{ exchange: string; message: string; referralLink: string } | null>(null);

    const form = useForm<ExchangeFormValues>({
        resolver: zodResolver(exchangeSchema),
        defaultValues: {
            exchange: 'binance',
            user_uid: '',
        },
    });

    // --- Data Fetching ---

    const fetchAccounts = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_exchange_accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLinkedAccounts(data as LinkedAccount[] || []);
        } catch (err: any) {
            console.error('Error fetching accounts:', err);
            setError('Failed to load linked accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [user]);

    // --- Actions ---

    const handleAddAccount = async (data: ExchangeFormValues) => {
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        setRelinkInfo(null);

        try {
            // Sanitize UID
            const sanitizedUid = DOMPurify.sanitize(data.user_uid).trim();

            // Call API to verify and link account
            // API will handle INSERT/UPDATE to database
            const response = await fetch('/api/v1/user/verify-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange: data.exchange,
                    user_uid: sanitizedUid
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to link account');
            }

            // Handle different verification statuses
            if (result.verified) {
                setError(null);
                setRelinkInfo(null);
                setSuccess(`✅ ${result.message || 'Account verified successfully!'}`);
            } else if (result.needs_relink) {
                // Show detailed relink information
                setRelinkInfo({
                    exchange: data.exchange,
                    message: result.message,
                    referralLink: result.referral_link
                });
            } else {
                setError(result.message);
            }

            // Refresh account list
            await fetchAccounts();
            form.reset();

        } catch (err: any) {
            console.error('Error linking account:', err);
            setError(err.message || 'Failed to link account');
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmit = async (data: ExchangeFormValues) => {
        if (!user || !token) return;

        // Local validation: Check if exchange already linked
        const exists = linkedAccounts.find(acc => acc.exchange === data.exchange);
        if (exists) {
            form.setError('exchange', {
                type: 'manual',
                message: 'You have already linked this exchange.'
            });
            return;
        }

        await handleAddAccount(data);
    };

    const handleDelete = async (id: string) => {
        // Optimistic Update: Remove from list immediately
        const previousAccounts = [...linkedAccounts];
        setLinkedAccounts(prev => prev.filter(acc => acc.id !== id));
        setDeleteConfirm(null);

        try {
            const { error } = await supabase
                .from('user_exchange_accounts')
                .delete()
                .eq('id', id);

            if (error) throw error;

        } catch (err: any) {
            console.error('Error deleting account:', err);
            setError('Failed to delete account');
            // Revert optimistic update
            setLinkedAccounts(previousAccounts);
        }
    };

    // --- UI Helpers ---

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" title="Verification in progress">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Pending
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                    </span>
                );
            case 'needs_relink':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Relink Needed
                    </span>
                );
            default:
                return <span className="text-gray-500 text-xs">{status}</span>;
        }
    };

    const formatExchangeName = (exchange: string) => {
        return exchange.charAt(0).toUpperCase() + exchange.slice(1);
    };

    const maskUid = (uid: string) => {
        if (uid.length <= 6) return uid;
        return `${uid.slice(0, 3)}...${uid.slice(-3)}`;
    };

    // --- Render ---

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    Exchange Connections
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Link your exchange accounts to enable automatic fee rebates and portfolio tracking.
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-xl">

                {/* Section 1: Link New Account */}
                <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-500" />
                        Link New Account
                    </h3>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
                        {/* Exchange Select */}
                        <div className="w-full md:w-1/3 space-y-1.5">
                            <label className="text-xs font-medium text-gray-400">Exchange</label>
                            <select
                                {...form.register('exchange')}
                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
                            >
                                {EXCHANGES.map(ex => (
                                    <option key={ex} value={ex}>{formatExchangeName(ex)}</option>
                                ))}
                            </select>
                            {form.formState.errors.exchange && (
                                <p className="text-red-400 text-xs">{form.formState.errors.exchange.message}</p>
                            )}
                        </div>

                        {/* UID Input */}
                        <div className="w-full md:w-1/3 space-y-1.5">
                            <label className="text-xs font-medium text-gray-400">User UID</label>
                            <input
                                {...form.register('user_uid')}
                                type="text"
                                placeholder="Enter your Exchange UID"
                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                            {form.formState.errors.user_uid && (
                                <p className="text-red-400 text-xs">{form.formState.errors.user_uid.message}</p>
                            )}

                            {/* Help Text - Where to find UID */}
                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/5 rounded-lg p-2 border border-white/5 mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-gray-400 mb-1">Where to find your UID?</p>
                                    <ul className="space-y-0.5">
                                        <li><span className="text-gray-400">Binance:</span> Account → Dashboard → User ID</li>
                                        <li><span className="text-gray-400">Bybit:</span> Profile → Account & Security → UID</li>
                                        <li><span className="text-gray-400">OKX:</span> Profile → User Center → UID</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="w-full md:w-auto mt-auto pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Link className="w-4 h-4" />
                                        Connect Exchange
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Relink Information Card - When account needs to be relinked */}
                    {relinkInfo && (
                        <div className="mt-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    {/* Header */}
                                    <div>
                                        <h4 className="text-lg font-bold text-amber-300 mb-1">
                                            Account Not Linked to Apex
                                        </h4>
                                        <p className="text-sm text-gray-300">
                                            {relinkInfo.message}
                                        </p>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                                            📋 Follow These Steps:
                                        </p>
                                        <ol className="space-y-2 text-sm text-gray-300">
                                            <li className="flex gap-2">
                                                <span className="text-amber-400 font-bold">1.</span>
                                                <span>Click the referral link below to open {formatExchangeName(relinkInfo.exchange)}</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-amber-400 font-bold">2.</span>
                                                <span>Create a new account OR transfer your existing account to Apex's referral program</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-amber-400 font-bold">3.</span>
                                                <span>After completing, return here and link your account again</span>
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Referral Link Button */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <a
                                            href={relinkInfo.referralLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group"
                                        >
                                            <span>Open Apex Referral Link</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </a>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(relinkInfo.referralLink);
                                                // Optional: Show toast notification
                                            }}
                                            className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            title="Copy referral link"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="hidden sm:inline">Copy Link</span>
                                        </button>
                                    </div>

                                    {/* Help Text */}
                                    <div className="flex items-start gap-2 text-xs text-gray-400 bg-black/20 rounded-lg p-3 border border-white/5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <span className="font-semibold text-emerald-400">Why is this needed?</span>
                                            {' '}Apex can only provide rebates for accounts registered under our referral program.
                                            This ensures your trading volume is tracked and rewarded properly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {/* General Error Display */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Section 2: Linked Accounts List */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                            Linked Accounts
                        </h3>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                            {linkedAccounts.length} Connected
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : linkedAccounts.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Link className="w-6 h-6 text-gray-600" />
                            </div>
                            <p className="text-gray-400 font-medium">No accounts linked yet</p>
                            <p className="text-gray-600 text-sm mt-1">Connect an exchange above to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {linkedAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Exchange Icon Placeholder */}
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-gray-400 text-xs">
                                            {account.exchange.substring(0, 2).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-white">
                                                    {formatExchangeName(account.exchange)}
                                                </h4>
                                                {getStatusBadge(account.verification_status)}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span className="font-mono bg-black/50 px-1.5 py-0.5 rounded">
                                                    UID: {maskUid(account.user_uid)}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(account.created_at).toLocaleDateString()}
                                                </span>
                                                {account.metadata?.tier && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-emerald-400 font-medium">
                                                            {account.metadata.tier}
                                                        </span>
                                                    </>
                                                )}
                                                {account.metadata?.error_reason && account.verification_status !== 'verified' && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-red-400">
                                                            {account.metadata.error_reason}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        {deleteConfirm === account.id ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                                <span className="text-xs text-red-400 font-medium">Confirm?</span>
                                                <button
                                                    onClick={() => handleDelete(account.id)}
                                                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-md transition-colors"
                                                >
                                                    Yes, Delete
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium rounded-md transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(account.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Disconnect Account"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
