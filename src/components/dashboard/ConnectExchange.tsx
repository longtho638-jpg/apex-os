'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronRight, Check, AlertCircle, Lock, RefreshCw, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'isomorphic-dompurify';
import { Exchange, EXCHANGES, VerificationResult } from '@/types/exchange';
import { useTranslations } from 'next-intl';

export default function ConnectExchange() {
    const t = useTranslations('DashboardComponents.ConnectExchange');
    const { token } = useAuth();
    const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
    const [uid, setUid] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [resultData, setResultData] = useState<VerificationResult | null>(null);

    const handleConnect = async () => {
        if (!uid || !selectedExchange) return;

        // Sanitize Input
        const sanitizedUid = DOMPurify.sanitize(uid).trim();

        // Validate UID format (Alphanumeric only)
        if (!/^[a-zA-Z0-9]+$/.test(sanitizedUid)) {
            setStatus('error');
            setMessage(t('error_format'));
            return;
        }

        setStatus('verifying');
        setMessage('');

        try {
            const res = await fetch('/api/v1/user/verify-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange: selectedExchange,
                    user_uid: sanitizedUid
                })
            });

            const data: VerificationResult = await res.json();

            if (data.success && data.verified) {
                setStatus('success');
                setResultData(data);
            } else {
                setStatus('error');
                setMessage(data.message || 'Verification failed');
                if (data.referral_link) {
                    setResultData(data);
                }
            }
        } catch (err) {
            setStatus('error');
            setMessage(t('error_network'));
        }
    };

    const closeModal = () => {
        setSelectedExchange(null);
        setUid('');
        setStatus('idle');
        setMessage('');
        setResultData(null);
    };

    return (
        <div className="rounded-xl border border-[#00FF00]/30 bg-[#00FF00]/5 p-6 relative overflow-hidden group">
            {/* Background Effects - Toned down to prevent overlap issues */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF00]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/20">
                            <Wallet className="h-5 w-5 text-[#00FF00]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-mono text-white">{t('uplink')}</h3>
                            <p className="text-[10px] text-[#00FF00]/70 font-mono tracking-wider">{t('protocol')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
                        {t('system_online')}
                    </div>
                </div>

                {/* Exchange Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {EXCHANGES.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => setSelectedExchange(ex)}
                            className="group/btn flex flex-col items-center justify-center p-3 rounded-lg border border-white/5 bg-black/40 hover:border-[#00FF00]/50 hover:bg-[#00FF00]/10 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover/btn:bg-[#00FF00]/20 transition-colors">
                                <Globe className="h-4 w-4 text-gray-400 group-hover/btn:text-[#00FF00]" />
                            </div>
                            <span className="capitalize text-[10px] font-mono font-bold text-gray-400 group-hover/btn:text-[#00FF00]">{ex}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedExchange && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0a0a0a] border border-[#00FF00]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Modal Content */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-center justify-center mx-auto mb-3">
                                        <RefreshCw className={cn("h-6 w-6 text-[#00FF00]", status === 'verifying' && "animate-spin")} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-mono">{t('link_exchange', { exchange: selectedExchange.toUpperCase() })}</h3>
                                    <p className="text-xs text-gray-400 font-mono mt-1">{t('enter_uid')}</p>
                                </div>

                                {status === 'success' ? (
                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-[#00FF00]/10 border border-[#00FF00]/20 rounded-lg">
                                            <p className="text-[#00FF00] font-bold flex items-center justify-center gap-2">
                                                <Check className="h-4 w-4" />
                                                {t('verified')}
                                            </p>
                                            {resultData?.metadata?.tier && (
                                                <p className="text-xs text-[#00FF00]/70 mt-1 font-mono">
                                                    {t('tier')} {resultData.metadata.tier}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="w-full bg-[#00FF00] text-black font-bold font-mono py-3 rounded-lg hover:bg-[#00FF00]/90 transition-colors"
                                        >
                                            {t('close')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-500 font-mono mb-1 block">{t('user_uid')}</label>
                                            <input
                                                type="text"
                                                value={uid}
                                                onChange={(e) => setUid(e.target.value)}
                                                disabled={status === 'verifying'}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#00FF00] transition-colors"
                                                placeholder="e.g. 12345678"
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
                                                <div className="flex items-center gap-2 text-red-400 text-xs">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {message}
                                                </div>
                                                {resultData?.referral_link && (
                                                    <a
                                                        href={resultData.referral_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-center text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded transition-colors"
                                                    >
                                                        Create Account Here
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleConnect}
                                            disabled={!uid || status === 'verifying'}
                                            className="w-full bg-[#00FF00] text-black font-bold font-mono py-3 rounded-lg hover:bg-[#00FF00]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'verifying' ? t('verifying') : t('verify_link')}
                                            {!status && <ChevronRight className="h-4 w-4" />}
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
