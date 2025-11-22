"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function RebatesPage() {
    const t = useTranslations('Rebates');

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[#00FF94]/10 rounded-lg border border-[#00FF94]/20">
                        <Coins className="h-6 w-6 text-[#00FF94]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Kiếm Toàn Phí</h1>
                        <p className="text-sm text-gray-400">Rebates & Rewards</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <Coins className="h-16 w-16 text-[#00FF94] mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-gray-400">Rebate tracking system under development</p>
                </div>
            </main>
        </div>
    );
}
