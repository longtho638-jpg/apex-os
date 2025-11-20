"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Zap } from 'lucide-react';

interface LockedFeatureProps {
    feature: string;
    description?: string;
    estimatedValue?: string;
    children?: React.ReactNode;
}

export default function LockedFeature({
    feature,
    description,
    estimatedValue,
    children
}: LockedFeatureProps) {
    const router = useRouter();

    return (
        <div className="relative">
            {/* Background blur */}
            <div className="filter blur-sm opacity-30 pointer-events-none">
                {children}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md border-2 border-yellow-500/30 rounded-xl flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-yellow-500" size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-zinc-100 mb-2">
                        🔒 {feature}
                    </h3>

                    {description && (
                        <p className="text-sm text-zinc-400 mb-4">
                            {description}
                        </p>
                    )}

                    {estimatedValue && (
                        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 mb-4">
                            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                                Estimated Value
                            </div>
                            <div className="text-lg font-bold text-emerald-500">
                                {estimatedValue}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/offer')}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Zap size={18} />
                        Unlock with Founders ($99)
                    </button>

                    <p className="text-xs text-zinc-500 mt-3">
                        Limited to 100 early users • 13 spots left
                    </p>
                </div>
            </div>
        </div>
    );
}
