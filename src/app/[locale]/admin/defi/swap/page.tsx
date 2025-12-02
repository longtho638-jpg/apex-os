import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeftRight } from 'lucide-react';
// import SwapInterface from '@/components/defi/SwapInterface';

export default function SwapPage() {
    const t = useTranslations();

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ArrowLeftRight className="h-6 w-6 text-blue-500" />
                        DEX Swap
                    </h1>
                    <p className="text-zinc-400">Instant token swaps with best execution</p>
                </div>
            </div>

            <div className="flex justify-center py-12">
                {/* <SwapInterface /> */}
            </div>
        </div>
    );
}
