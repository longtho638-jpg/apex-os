'use client';

import { MessageSquare, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { createClient } from '@/lib/supabase/client';

export default function CommunityPage() {
  const [whales, setWhales] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Fetch Top Teams
    const fetchTeams = async () => {
      const { data } = await supabase.from('teams').select('*').order('total_volume', { ascending: false }).limit(5);
      if (data) setTeams(data);
    };

    // Simulate Whale Alerts (since we might not have enough real large txs yet)
    const mockWhales = [
      { id: 1, user: 'Whale_0x1', action: 'Bought BTC', amount: '$1,250,000', time: '2m ago' },
      { id: 2, user: 'ElonMusk_Clone', action: 'Long ETH 50x', amount: '$500,000', time: '5m ago' },
      { id: 3, user: 'Satoshi_Fan', action: 'Staked APEX', amount: '$200,000', time: '12m ago' },
    ];
    setWhales(mockWhales);
    fetchTeams();
  }, [supabase.from]);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Community Hub</h1>
            <p className="text-zinc-400">Connect with the ApexOS global network.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> Whale Alerts
                </h2>
                <div className="space-y-4">
                  {whales.map((whale) => (
                    <div
                      key={whale.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                          W
                        </div>
                        <div>
                          <p className="font-bold text-white">{whale.user}</p>
                          <p className="text-xs text-zinc-400">{whale.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">{whale.amount}</p>
                        <p className="text-xs text-zinc-500">{whale.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" /> Trending Discussions
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <h3 className="font-bold text-white mb-1">Bitcoin to $100k by EOY?</h3>
                    <p className="text-sm text-zinc-400 mb-2">
                      Analysis of the current market structure and institutional inflows...
                    </p>
                    <div className="flex gap-4 text-xs text-zinc-500">
                      <span>💬 124 replies</span>
                      <span>🔥 Hot Topic</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <h3 className="font-bold text-white mb-1">Best Copy Trading Strategy for Low Risk</h3>
                    <p className="text-sm text-zinc-400 mb-2">Sharing my settings for the "Safe Haven" bot...</p>
                    <div className="flex gap-4 text-xs text-zinc-500">
                      <span>💬 89 replies</span>
                      <span>💡 Strategy</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Top Wolf Packs
                </h2>
                <div className="space-y-3">
                  {teams.length > 0 ? (
                    teams.map((team, i) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold w-4 ${i === 0 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            #{i + 1}
                          </span>
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-mono">
                          ${(team.total_volume / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm">No teams found.</p>
                  )}
                </div>
                <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors">
                  View All Packs
                </button>
              </GlassCard>

              <GlassCard className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
                <h2 className="text-lg font-bold mb-2">Join the Elite</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Unlock exclusive channels and signals by upgrading your tier.
                </p>
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-purple-500/20">
                  Upgrade Now
                </button>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
