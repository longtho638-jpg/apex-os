'use client';

import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { GitBranch, Play, BarChart2, Settings } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';

export default function AgentStrategiesPage() {
  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        
        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                  <GitBranch className="h-7 w-7 text-pink-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Strategies</h1>
                  <p className="text-sm text-zinc-400">Manage algorithmic trading logic</p>
                </div>
              </div>
              <Button3D>Create Strategy</Button3D>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {['Momentum Alpha', 'Mean Reversion v2', 'Arb Hunter'].map((strategy, i) => (
              <GlassCard key={i} className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{strategy}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    High-frequency momentum strategy focused on BTC/ETH pairs.
                  </p>
                </div>

                <div className="flex gap-8 text-center">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Win Rate</div>
                    <div className="font-mono text-emerald-400 font-bold">68.4%</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Sharpe</div>
                    <div className="font-mono text-white font-bold">2.4</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Drawdown</div>
                    <div className="font-mono text-red-400 font-bold">-4.2%</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Backtest">
                    <Play className="w-5 h-5 text-zinc-400 hover:text-white" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Performance">
                    <BarChart2 className="w-5 h-5 text-zinc-400 hover:text-white" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Configure">
                    <Settings className="w-5 h-5 text-zinc-400 hover:text-white" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}