'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Bot, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { BacktestRunner } from '@/components/admin/agents/BacktestRunner';

interface Agent {
  id: string;
  name: string;
  strategy_type: string;
  risk_level: string;
  description: string;
  total_aum: number;
  roi_30d: number;
}

export default function AgentMarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    // Mock fetch (replace with API)
    setAgents([
        { id: '1', name: 'DeepSeek Alpha', strategy_type: 'Sentiment', risk_level: 'High', description: 'Trades based on news sentiment.', total_aum: 450000, roi_30d: 42.5 },
        { id: '2', name: 'BitFlow Trend', strategy_type: 'Momentum', risk_level: 'Medium', description: 'Follows strong BTC trends.', total_aum: 125000, roi_30d: 18.2 },
        { id: '3', name: 'Stable Grid', strategy_type: 'Mean Reversion', risk_level: 'Low', description: 'Farms volatility in ranges.', total_aum: 850000, roi_30d: 5.8 },
    ]);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Apex AI Fund
            </h1>
            <p className="text-zinc-400">Invest in autonomous trading agents.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
                <GlassCard key={agent.id} className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Bot className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{agent.name}</h3>
                                <p className="text-xs text-zinc-400 capitalize">{agent.strategy_type}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                            agent.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            agent.risk_level === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                            {agent.risk_level} Risk
                        </span>
                    </div>

                    <p className="text-sm text-zinc-300 mb-6 flex-1">
                        {agent.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                            <p className="text-xs text-zinc-500 mb-1">30d ROI</p>
                            <p className="font-bold text-emerald-400 text-lg">+{agent.roi_30d}%</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                            <p className="text-xs text-zinc-500 mb-1">AUM</p>
                            <p className="font-bold text-white text-lg">${(agent.total_aum / 1000).toFixed(0)}k</p>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors mb-2">
                        Invest Now
                    </button>
                    
                    <BacktestRunner agentId={agent.id} />
                </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
