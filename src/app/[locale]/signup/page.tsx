"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Terminal, ChevronRight, Lock, ShieldCheck, Globe, UserPlus } from 'lucide-react';
import { useTranslations } from '@/contexts/I18nContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Removed confirmPassword to simplify flow (Phase 4 requirement)
    // const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('Signup');

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(7).toUpperCase());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError(t('error_length'));
            return;
        }

        setIsLoading(true);
        analytics.track('signup_started', { email });

        try {
            const response = await fetch('/api/v1/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            analytics.track('signup_completed', { userId: data.userId || 'unknown' });
            setSuccess(true);

            if (data.require_confirmation) {
                return;
            }

            // Redirect to login (or dashboard if auto-login implemented)
            setTimeout(() => {
                router.push(`/${locale}/login?message=account_created`);
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen w-full bg-[#030303] text-white font-sans flex items-center justify-center p-4">
                <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 text-green-500 mb-6">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t('success')}</h2>
                    <p className="text-gray-400 mt-2">
                        Please check your email to confirm your account before logging in.
                    </p>
                    <button
                        onClick={() => router.push(`/${locale}/login`)}
                        className="mt-6 px-6 py-2 bg-[#00FF94] text-black font-bold rounded-lg hover:bg-[#00CC76] transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#030303] text-white font-sans flex items-center justify-center p-4 overflow-hidden relative selection:bg-[#00FF94]/20">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#00FF94]/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF94] via-[#8B5CF6] to-[#06B6D4]" />

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00FF94]/20 to-[#06B6D4]/20 border border-[#00FF94]/30 mb-6 shadow-[0_0_20px_rgba(0,255,148,0.2)]">
                            <UserPlus className="h-8 w-8 text-[#00FF94]" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            Start Free Trial
                        </h1>
                        <p className="text-gray-400 text-sm">7-day free trial. No credit card required.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('email_placeholder')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Globe className="h-5 w-5 text-gray-500 group-focus-within:text-[#00FF94] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF94]/50 focus:bg-black/60 transition-all"
                                    placeholder="name@example.com"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('password_placeholder')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#8B5CF6] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6]/50 focus:bg-black/60 transition-all"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#00FF94] to-[#06B6D4] hover:from-[#00CC76] hover:to-[#0596A6] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,148,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Start Free Trial</span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-[10px] text-gray-500 font-mono">
                        <div className="flex items-center gap-1.5 w-full justify-between">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3 w-3 text-[#00FF94]" />
                                <span>SECURE CONNECTION</span>
                            </div>
                            <div>ID: {sessionId || '-------'}</div>
                        </div>

                        <div className="text-center text-xs">
                            <span className="text-gray-500">{t('has_account')} </span>
                            <button
                                onClick={() => router.push(`/${locale}/login`)}
                                className="text-[#00FF94] hover:text-[#00CC76] font-bold transition-colors"
                            >
                                {t('login_link')}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}