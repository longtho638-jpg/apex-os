'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ConnectWallet } from '@/components/dao/ConnectWallet';
import { Lock, TrendingUp, Clock, Coins } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

export default function StakingPage() {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(30);
  const { available, refresh } = useWallet();
  const [stakedBalance, setStakedBalance] = useState(0);
  const [rewards, setRewards] = useState(0);

  const apy = lockPeriod === 30 ? 5 : lockPeriod === 90 ? 10 : 20;

  const handleStake = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return toast.error('Invalid Amount');
    if (val > available) return toast.error('Insufficient Funds');

    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Staking tokens...',
      success: () => {
        setStakedBalance(prev => prev + val);
        setAmount('');
        refresh(); // Update wallet balance
        return `Successfully staked ${val} APEX!`;
      },
      error: 'Staking failed'
    });
  };

  const handleClaim = async () => {
    if (rewards <= 0) return toast.error('No rewards to claim');

    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Claiming rewards...',
      success: () => {
        setRewards(0);
        refresh();
        return 'Rewards claimed to wallet!';
      },
      error: 'Claim failed'
    });
  };

  // Simulate rewards accumulation
  useState(() => {
    const interval = setInterval(() => {
      if (stakedBalance > 0) {
        setRewards(prev => prev + (stakedBalance * (apy / 100) / 365 / 24 / 60)); // Per minute
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Apex Vault
              </h1>
              <p className="text-zinc-400">Stake APEX tokens to earn yield and voting power.</p>
            </div>
            <ConnectWallet />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Staking Form */}
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" /> Stake Tokens
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm text-zinc-400">Amount to Stake (APEX)</label>
                    <span className="text-xs text-zinc-500">Available: <span className="text-white font-mono">${available.toLocaleString()}</span></span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="0.00"
                    />
                    <Coins className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Lock Period</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[30, 90, 365].map((days) => (
                      <button
                        key={days}
                        onClick={() => setLockPeriod(days)}
                        className={`py-3 rounded-lg border font-bold transition-all ${lockPeriod === days
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20'
                          }`}
                      >
                        {days} Days
                        <span className="block text-xs font-normal mt-1">{days === 30 ? '5%' : days === 90 ? '10%' : '20%'} APY</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-400 text-sm">Estimated APY</span>
                    <span className="text-emerald-400 font-bold">{apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Voting Power</span>
                    <span className="text-indigo-400 font-bold">{amount ? amount : '0'} VP</span>
                  </div>
                </div>

                <button
                  onClick={handleStake}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  Stake Now
                </button>
              </div>
            </GlassCard>

            {/* Stats */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Your Staked Balance</h3>
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-4xl font-bold text-white font-mono">{stakedBalance.toFixed(2)} <span className="text-sm text-zinc-500">APEX</span></p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Claimable Rewards</h3>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-4xl font-bold text-emerald-400 font-mono">{rewards.toFixed(6)} <span className="text-sm text-zinc-500">APEX</span></p>
                <button
                  onClick={handleClaim}
                  className="mt-4 w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold hover:bg-emerald-500/20 transition"
                >
                  Claim Rewards
                </button>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold mb-4">Staking History</h3>
                <div className="text-center py-8 text-zinc-500">
                  No staking history found.
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
