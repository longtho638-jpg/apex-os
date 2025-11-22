'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Get the full hash fragment (magic link token)
        const hash = window.location.hash;

        console.log('Landing page hash:', hash);

        if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
            // Magic link or password reset token detected
            // Redirect to reset-password page with the FULL hash preserved
            console.log('Redirecting to reset-password with hash:', hash);
            router.replace(`/reset-password${hash}`);
        } else {
            // No token found, redirecting to login
            console.log('No token found, redirecting to login');
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Redirecting...</p>
            </div>
        </div>
    );
}
