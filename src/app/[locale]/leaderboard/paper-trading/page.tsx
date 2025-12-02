'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { CopyTradingLeaderboard } from '@/components/trading/CopyTradingLeaderboard';
import { useAuth } from '@/contexts/AuthContext';

export default function PaperTradingLeaderboardPage() {
  const { user } = useAuth();

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
              🏆 Global Arena Leaderboard
            </h1>
            <p className="text-zinc-400 mb-6">Top traders this week. Prove your skills and earn your place.</p>

            <div className="inline-flex items-center gap-8 px-8 py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs text-yellow-500 uppercase tracking-widest font-bold mb-1">Weekly Prize Pool</div>
                <div className="text-3xl font-black text-white">$5,000 USDT</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Round Ends In</div>
                <div className="text-xl font-mono text-white">2d 14h 30m</div>
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto">
            <CopyTradingLeaderboard userId={user?.id || ''} />
          </div>
        </div>
      </main>
    </div>
  );
}
