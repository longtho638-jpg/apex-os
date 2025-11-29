'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Trophy, User, TrendingUp } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'WhaleHunter99', pnl: 14500, winRate: 78, tier: 'ELITE' },
  { rank: 2, name: 'SatoshiDisciple', pnl: 12200, winRate: 65, tier: 'TRADER' },
  { rank: 3, name: 'AlphaSeeker', pnl: 9800, winRate: 72, tier: 'PRO' },
  { rank: 4, name: 'MoonBoy_XZ', pnl: 5400, winRate: 55, tier: 'FREE' },
  { rank: 5, name: 'QuantDev', pnl: 3200, winRate: 82, tier: 'TRADER' },
];

export default function PaperTradingLeaderboardPage() {
  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
              🏆 Simulation Arena Leaderboard
            </h1>
            <p className="text-zinc-400">Top traders this week. Prove your skills without risking real capital.</p>
          </header>

          <GlassCard className="max-w-4xl mx-auto p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-sm text-zinc-500">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Trader</th>
                    <th className="p-4 text-right">Weekly PnL</th>
                    <th className="p-4 text-right">Win Rate</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LEADERBOARD.map((user) => (
                    <tr key={user.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        {user.rank === 1 ? <span className="text-2xl">🥇</span> :
                         user.rank === 2 ? <span className="text-2xl">🥈</span> :
                         user.rank === 3 ? <span className="text-2xl">🥉</span> :
                         <span className="font-bold text-zinc-400">#{user.rank}</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-bold">{user.name}</p>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">{user.tier}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                        +${user.pnl.toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-white">
                        {user.winRate}%
                      </td>
                      <td className="p-4 text-center">
                        <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto">
                            <TrendingUp className="w-3 h-3" /> Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
