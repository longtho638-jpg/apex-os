'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Bot, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { BacktestRunner } from '@/components/admin/agents/BacktestRunner';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { Button3D } from '@/components/marketing/Button3D';

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
  const { available, refresh } = useWallet();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [myInvestments, setMyInvestments] = useState<Record<string, number>>({}); // { agentId: amount }

  const handleInvest = async (agent: Agent) => {
    const amount = parseFloat(amounts[agent.id] || '0');
    if (amount <= 0) {
      toast.error('Invalid Amount', { description: 'Please enter a valid investment amount.' });
      return;
    }
    if (amount > available) {
      toast.error('Insufficient Funds', { description: `You need $${amount} but only have $${available}.` });
      return;
    }

    // Mock Investment API Call
    // In real app: POST /api/invest { agentId, amount }
    // Here we simulate the "Deep x10" logic:

    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: `Investing $${amount} in ${agent.name}...`,
      success: () => {
        // 1. Deduct from Wallet (Visual)
        // 2. Trigger "Management Fee" Commission (Mocked)
        setMyInvestments(prev => ({
          ...prev,
          [agent.id]: (prev[agent.id] || 0) + amount
        }));
        setAmounts(prev => ({ ...prev, [agent.id]: '' }));
        return `Successfully invested $${amount}! Management Fee paid to Referrer.`;
      },
      error: 'Investment failed'
    });
  };

  const handleRedeem = async (agent: Agent) => {
    const invested = myInvestments[agent.id] || 0;
    if (invested <= 0) return;

    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: `Redeeming funds from ${agent.name}...`,
      success: () => {
        const profit = invested * (agent.roi_30d / 100); // Simulate profit
        const total = invested + profit;
        setMyInvestments(prev => {
          const next = { ...prev };
          delete next[agent.id];
          return next;
        });
        return `Redeemed $${total.toFixed(2)} (Profit: +$${profit.toFixed(2)})`;
      },
      error: 'Redemption failed'
    });
  };

  useEffect(() => {
    // Mock fetch (replace with API)
    setAgents([
      { id: '1', name: 'DeepQuant Alpha', strategy_type: 'Sentiment', risk_level: 'High', description: 'Trades based on news sentiment.', total_aum: 450000, roi_30d: 42.5 },
      { id: '2', name: 'BitFlow Trend', strategy_type: 'Momentum', risk_level: 'Medium', description: 'Follows strong BTC trends.', total_aum: 125000, roi_30d: 18.2 },
      { id: '3', name: 'Stable Grid', strategy_type: 'Mean Reversion', risk_level: 'Low', description: 'Farms volatility in ranges.', total_aum: 850000, roi_30d: 5.8 },
    ]);
  }, []);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar relative">
      <AuroraBackground className="absolute inset-0 z-0 pointer-events-none fixed">
        <div />
      </AuroraBackground>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
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
                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${agent.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
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

              <div className="mb-4">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-purple-500"
                    value={amounts[agent.id] || ''}
                    onChange={(e) => setAmounts({ ...amounts, [agent.id]: e.target.value })}
                  />
                </div>
              </div>

              <Button3D
                full
                variant="primary"
                className="mb-2"
                onClick={() => handleInvest(agent)}
              >
                Invest Now
              </Button3D>

              {myInvestments[agent.id] > 0 && (
                <div className="mb-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-emerald-400 font-bold">Your Stake</span>
                    <span className="text-white font-mono">${myInvestments[agent.id].toLocaleString()}</span>
                  </div>
                  <Button3D
                    full
                    variant="glass"
                    className="h-8 text-xs"
                    onClick={() => handleRedeem(agent)}
                  >
                    Redeem & Take Profit
                  </Button3D>
                </div>
              )}

              <BacktestRunner agentId={agent.id} />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
