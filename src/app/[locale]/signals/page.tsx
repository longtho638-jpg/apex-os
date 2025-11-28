'use client';

import { Sidebar } from '@/components/os/sidebar';
import { SignalsDashboard } from '@/components/trading/SignalsDashboard';
import { Zap } from 'lucide-react';

export default function SignalsPage() {
    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <Zap className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Trading Signals</h1>
                            <p className="text-xs text-zinc-400">AI-powered market signals</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <SignalsDashboard />
                </div>
            </main>
        </div>
    );
}
