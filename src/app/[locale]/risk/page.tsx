"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function RiskPage() {
    const t = useTranslations('Risk');

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <Shield className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Báo Về Rủi Ro</h1>
                        <p className="text-sm text-gray-400">Risk Management</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-gray-400">Risk management tools under development</p>
                </div>
            </main>
        </div>
    );
}
