'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocaleRoot() {
    const router = useRouter();

    useEffect(() => {
        // Check for hash params (magic link tokens or errors)
        const hash = window.location.hash;

        if (hash) {
            console.log('Home page detected hash:', hash);

            // Check for errors (expired link, access denied, etc.)
            if (hash.includes('error=')) {
                console.log('Error detected, redirecting to login with error');
                const params = new URLSearchParams(hash.substring(1));
                const error = params.get('error');
                const errorDescription = params.get('error_description');
                router.replace(`/login?error=${error}&message=${encodeURIComponent(errorDescription || 'Authentication error')}`);
                return;
            }

            // Check for magic link/recovery tokens
            if (hash.includes('access_token') || hash.includes('type=')) {
                console.log('Auth token detected, redirecting to reset-password');
                router.replace(`/reset-password${hash}`);
                return;
            }
        }

        // No hash or special params, redirect to dashboard
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="text-center">
                <div className="text-xl font-mono animate-pulse">Redirecting...</div>
            </div>
        </div>
    );
}
