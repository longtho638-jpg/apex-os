'use client';

import React from 'react';
import { CopyTradingLeaderboard } from '@/components/trading/CopyTradingLeaderboard';
import { Sidebar } from '@/components/os/sidebar';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CopyTradingPage() {
    const { user } = useAuth();

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Users className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Copy Trading</h1>
                            <p className="text-xs text-zinc-400">Follow top performing agents</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <CopyTradingLeaderboard userId={user?.id || ''} />
                    </div>
                </div>
            </main>
        </div>
    );
}