'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClientSide } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = getSupabaseClientSide();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                router.push('/en/login?error=auth_callback_error');
                return;
            }

            if (session) {
                // Auth successful
                const next = searchParams.get('next') || '/dashboard';
                router.push(next);
            } else {
                // Handle Implicit Flow (Hash) manually if getSession doesn't pick it up immediately
                // Supabase client usually handles hash automatically, but we can listen to state change
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        const next = searchParams.get('next') || '/dashboard';
                        router.push(next);
                    }
                });

                return () => {
                    subscription.unsubscribe();
                };
            }
        };

        handleAuthCallback();
    }, [router, searchParams, supabase]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#00FF94]" />
                <p className="text-gray-400">Verifying access...</p>
            </div>
        </div>
    );
}
