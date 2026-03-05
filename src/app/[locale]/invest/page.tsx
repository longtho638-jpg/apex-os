'use client';

import { Shield, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';

export default function InvestPage() {
  const { available, refresh } = useWallet();
  const { tier } = useUserTier();
  const [investAmount, setInvestAmount] = useState('');

  // Tier-based APY
  const baseAPY = 12;
  const tierBonus = tier === 'SOVEREIGN' ? 8 : tier === 'ARCHITECT' ? 5 : tier === 'OPERATOR' ? 2 : 0;
  const totalAPY = baseAPY + tierBonus;

  const handleInvest = () => {
    const amount = parseFloat(investAmount);
    if (!amount || amount <= 0) return toast.error('Invalid amount');
    if (amount > available) return toast.error('Insufficient funds');

    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Allocating capital to AI Fund...',
      success: `Successfully invested $${amount.toLocaleString()}!`,
      error: 'Investment failed',
    });
    // In real app: Call API to deduct balance and create investment record
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              AI Investment Fund
            </h1>
            <p className="text-zinc-400">Autonomous High-Frequency Trading managed by Apex AI.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-400 text-sm">Target APY</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-4xl font-bold text-emerald-400">{totalAPY}%</div>
              <div className="text-xs text-zinc-500 mt-1">
                {tierBonus > 0 ? `Includes +${tierBonus}% ${tier} Bonus` : 'Upgrade Tier for higher APY'}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-400 text-sm">Total AUM</span>
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-white">$42.5M</div>
              <div className="text-xs text-zinc-500 mt-1">Assets Under Management</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-400 text-sm">Your Balance</span>
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-white">${available.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-1">Available to Invest</div>
            </GlassCard>
          </div>

          <GlassCard className="max-w-xl mx-auto p-8 border-purple-500/30">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Deposit Capital
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Amount (USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-lg font-bold focus:border-purple-500 outline-none transition-colors"
                    placeholder="0.00"
                  />
                  <button
                    onClick={() => setInvestAmount(available.toString())}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-400 font-bold hover:text-purple-300"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Est. Monthly Earnings</span>
                  <span className="text-emerald-400 font-bold">
                    +${investAmount ? ((parseFloat(investAmount) * (totalAPY / 100)) / 12).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Lock-up Period</span>
                  <span className="text-white font-bold">7 Days</span>
                </div>
              </div>

              <button
                onClick={handleInvest}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all"
              >
                Confirm Investment
              </button>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
