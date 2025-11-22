"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ResourcesPage() {
    const t = useTranslations('Resources');

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <BookOpen className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Tài Nguyên</h1>
                        <p className="text-sm text-gray-400">Learning Resources</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <BookOpen className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-gray-400">Resource library under development</p>
                </div>
            </main>
        </div>
    );
}
