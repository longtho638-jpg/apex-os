'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClientSide } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = getSupabaseClientSide();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let authListener: { subscription: { unsubscribe: () => void } } | null = null;

        const handleAuthCallback = async () => {
            // 1. Check for errors in URL fragment (Hash)
            // This is synchronous and safe
            const hash = window.location.hash;
            if (hash) {
                const params = new URLSearchParams(hash.substring(1));
                const errorDescription = params.get('error_description');
                const errorCode = params.get('error_code');

                if (errorDescription || errorCode) {
                    logger.error('Auth Error:', errorDescription);
                    setError(errorDescription?.replace(/\+/g, ' ') || 'Authentication failed');
                    return;
                }
            }

            // 2. Check Session
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    logger.error('Auth callback error:', sessionError);
                    setError(sessionError.message);
                    return;
                }

                const next = searchParams.get('next') || '/dashboard';

                if (session) {
                    router.push(next);
                } else {
                    // Handle Implicit Flow (Hash) manually
                    const { data } = supabase.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_IN' && session) {
                            router.push(next);
                        }
                    });
                    authListener = data;
                }
            } catch (err: unknown) {
                logger.error('Unexpected auth error:', err);
                const message = err instanceof Error ? err.message : 'An unexpected error occurred';
                setError(message);
            }
        };

        handleAuthCallback();

        return () => {
            if (authListener) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [router, searchParams, supabase]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="max-w-md w-full bg-[#111] border border-red-900/50 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-white">Verification Failed</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/en/forgot-password')}
                        className="w-full bg-[#00FF94] text-black font-bold py-3 rounded-lg hover:bg-[#00cc76] transition-colors"
                    >
                        Request New Link
                    </button>
                    <button
                        onClick={() => router.push('/en/login')}
                        className="mt-4 text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#00FF94]" />
                <p className="text-gray-400">Verifying access...</p>
            </div>
        </div>
    );
}
