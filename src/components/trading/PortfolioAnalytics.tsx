'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, Trophy, XCircle, Percent } from 'lucide-react';

interface Stats {
  winRate: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
}

export function PortfolioAnalytics({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <GlassCard className="p-4 text-center">
        <p className="text-zinc-400 text-xs mb-1 flex items-center justify-center gap-1">
            <Percent className="w-3 h-3" /> Win Rate
        </p>
        <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
      </GlassCard>

      <GlassCard className="p-4 text-center">
        <p className="text-zinc-400 text-xs mb-1 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total PnL
        </p>
        <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${stats.totalPnL.toLocaleString()}
        </p>
      </GlassCard>

      <GlassCard className="p-4 text-center">
        <p className="text-zinc-400 text-xs mb-1 flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" /> Best Trade
        </p>
        <p className="text-2xl font-bold text-emerald-400">+${stats.bestTrade.toLocaleString()}</p>
      </GlassCard>

      <GlassCard className="p-4 text-center">
        <p className="text-zinc-400 text-xs mb-1 flex items-center justify-center gap-1">
            <XCircle className="w-3 h-3 text-red-500" /> Worst Trade
        </p>
        <p className="text-2xl font-bold text-red-400">-${Math.abs(stats.worstTrade).toLocaleString()}</p>
      </GlassCard>
    </div>
  );
}