'use client';

import { Crown, Users, Wallet } from 'lucide-react';
import { Sidebar } from '@/components/os/sidebar';
import { CopyTradingLeaderboard } from '@/components/trading/CopyTradingLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';

export default function CopyTradingPage() {
  const { user } = useAuth();
  const { available } = useWallet();
  const { tier } = useUserTier();
  const copyFee = tier === 'SOVEREIGN' ? 0 : tier === 'ARCHITECT' ? 5 : 10;

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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <Wallet className="w-3 h-3 text-zinc-400" />
            <span className="text-xs text-zinc-400">Available:</span>
            <span className="text-xs font-bold text-[#00FF94]">${available.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-500">
              {tier} Tier: {copyFee}% Fee
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* FOMO Banner */}
            {/* Stats Summary */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-xs text-purple-300 mb-1">Total Copied Volume</div>
                <div className="text-2xl font-bold text-white">$2.4M</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-blue-300 mb-1">Active Copiers</div>
                <div className="text-2xl font-bold text-white">1,248</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-300 mb-1">Avg. Monthly Return</div>
                <div className="text-2xl font-bold text-[#00FF94]">+18.5%</div>
              </div>
            </div>

            <CopyTradingLeaderboard userId={user?.id || ''} />
          </div>
        </div>
      </main>
    </div>
  );
}
