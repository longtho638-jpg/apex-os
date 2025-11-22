"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WolfPackPage() {
    const t = useTranslations('WolfPack');

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[#8B5CF6]/10 rounded-lg border border-[#8B5CF6]/20">
                        <Users className="h-6 w-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Wolf Pack</h1>
                        <p className="text-sm text-gray-400">Community & Collaboration</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <Users className="h-16 w-16 text-[#8B5CF6] mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-gray-400">Wolf Pack community features under development</p>
                </div>
            </main>
        </div>
    );
}
