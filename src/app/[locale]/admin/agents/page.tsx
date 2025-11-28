'use client';

import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Bot, Power, Activity, Terminal } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';

export default function AgentsPage() {
  const agents = [
    { name: 'Market Maker', status: 'online', uptime: '99.9%', profit: '+$1,240' },
    { name: 'Risk Guardian', status: 'online', uptime: '100%', profit: '-' },
    { name: 'Arbitrage Scout', status: 'offline', uptime: '85.4%', profit: '+$420' },
  ];

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
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Bot className="h-7 w-7 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Agent Network</h1>
                  <p className="text-sm text-zinc-400">Monitor and control AI agents</p>
                </div>
              </div>
              <Button3D className="px-4 py-2 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/50">
                Deploy New Agent
              </Button3D>
            </div>
          </header>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <GlassCard key={i} className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${agent.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-zinc-600'}`} />
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                  </div>
                  <button className={`p-2 rounded-lg transition-colors ${
                    agent.status === 'online' ? 'hover:bg-red-500/20 text-emerald-400 hover:text-red-400' : 'hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400'
                  }`}>
                    <Power className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-xs text-zinc-500 mb-1">Uptime</div>
                    <div className="font-mono text-white">{agent.uptime}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-xs text-zinc-500 mb-1">Profit (24h)</div>
                    <div className={`font-mono ${agent.profit.startsWith('+') ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {agent.profit}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Terminal className="w-3 h-3" /> View Logs
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