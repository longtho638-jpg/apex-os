'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocaleRoot() {
    const router = useRouter();

    useEffect(() => {
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
