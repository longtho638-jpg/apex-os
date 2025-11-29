'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ConnectWallet } from '@/components/dao/ConnectWallet';
import { Rocket, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { usePresale } from '@/hooks/usePresale';
import { ClaimWidget } from '@/components/launchpad/ClaimWidget';

export default function LaunchpadPage() {
  const [amount, setAmount] = useState('');
  const { buyTokens, isLoading, isSuccess, error, currentRound } = usePresale();

  const tokenAmount = amount ? parseFloat(amount) / (currentRound?.price || 0.05) : 0;
  const progress = currentRound ? (currentRound.tokens_sold / currentRound.token_allocation) * 100 : 0;

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Token Launchpad
              </h1>
              <p className="text-zinc-400">Early access to APEX tokens.</p>
            </div>
            <ConnectWallet />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Sale Card */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      {currentRound?.name || 'Loading...'} <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">LIVE</span>
                    </h2>
                    <p className="text-zinc-400">Join the revolution of AI-powered trading.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Token Price</p>
                    <p className="text-3xl font-bold text-emerald-400">${currentRound?.price || '0.05'}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Raised: ${(currentRound?.tokens_sold * currentRound?.price || 0).toLocaleString()}</span>
                    <span className="text-zinc-400">Target: ${(currentRound?.token_allocation * currentRound?.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-zinc-500 mt-1">{progress.toFixed(1)}% Sold</p>
                </div>

                {/* Buy Widget */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                  <div className="flex justify-between mb-4">
                    <label className="text-sm font-bold text-white">You Pay (USDT)</label>
                    <span className="text-sm text-zinc-400">Balance: 0.00 USDT</span>
                  </div>
                  <div className="relative mb-6">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-4 text-xl font-mono focus:border-orange-500 outline-none"
                      placeholder="1000"
                    />
                    <button className="absolute right-4 top-4 text-sm bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">
                        MAX
                    </button>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="bg-white/5 rounded-full p-2">
                        <span className="text-zinc-500">↓</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-4">
                    <label className="text-sm font-bold text-white">You Receive (APEX)</label>
                  </div>
                  <div className="w-full bg-black border border-white/10 rounded-lg p-4 text-xl font-mono text-zinc-400 mb-6">
                    {tokenAmount.toLocaleString()}
                  </div>

                  <button
                    onClick={() => buyTokens(parseFloat(amount))}
                    disabled={isLoading || !amount}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Processing...' : 'Buy Tokens Now'}
                  </button>

                  {isSuccess && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                          <CheckCircle className="w-4 h-4" /> Purchase successful!
                      </div>
                  )}
                  {error && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" /> {error}
                      </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <GlassCard className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-zinc-400" /> Sale Ends In
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xl font-bold text-white">12</p>
                            <p className="text-[10px] text-zinc-500">DAYS</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xl font-bold text-white">04</p>
                            <p className="text-[10px] text-zinc-500">HRS</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xl font-bold text-white">32</p>
                            <p className="text-[10px] text-zinc-500">MIN</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xl font-bold text-white">10</p>
                            <p className="text-[10px] text-zinc-500">SEC</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-400" /> Token Info
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-zinc-400">Symbol</span>
                            <span className="font-bold">APEX</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-zinc-400">Network</span>
                            <span className="font-bold">Ethereum</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-zinc-400">Total Supply</span>
                            <span className="font-bold">1,000,000,000</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-zinc-400">Vesting</span>
                            <span className="font-bold text-right">10% TGE, 12m linear</span>
                        </li>
                    </ul>
                </GlassCard>

                <ClaimWidget />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
