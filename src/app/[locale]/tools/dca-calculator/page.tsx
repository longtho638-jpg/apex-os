'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Clock, Coins, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DCACalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(500);
  const [duration, setDuration] = useState<number>(12); // Months
  const [expectedGrowth, setExpectedGrowth] = useState<number>(10); // % annual

  const calculateDCA = () => {
    const totalInvested = monthlyInvestment * duration;
    // Simplified compound interest for monthly contribution
    // FV = P * (((1 + r)^n - 1) / r) * (1 + r)
    // where P is monthly payment, r is monthly interest rate, n is number of months
    
    const r = expectedGrowth / 100 / 12;
    let futureValue = 0;
    
    if (r === 0) {
        futureValue = totalInvested;
    } else {
        futureValue = monthlyInvestment * (((Math.pow(1 + r, duration) - 1) / r)) * (1 + r);
    }
    
    const profit = futureValue - totalInvested;
    
    return { totalInvested, futureValue, profit };
  };

  const { totalInvested, futureValue, profit } = calculateDCA();

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            DCA Calculator
          </h1>
          <p className="text-zinc-400">
            Visualize the power of Dollar Cost Averaging over time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" /> Investment Plan
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Monthly Investment ($)</label>
                <input
                  type="number"
                  value={monthlyInvestment || ''}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Duration (Months)</label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-2"
                />
                <div className="flex justify-between text-xs text-zinc-500">
                    <span>1 Mo</span>
                    <span className="text-emerald-400 font-bold">{duration} Months ({Math.floor(duration/12)}y {duration%12}m)</span>
                    <span>10 Yrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Expected Annual Growth (%)</label>
                <input
                  type="number"
                  value={expectedGrowth || ''}
                  onChange={(e) => setExpectedGrowth(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Projection
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Total Invested</span>
                  <span className="text-xl font-bold text-white">
                    ${totalInvested.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Projected Value</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${futureValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Profit</span>
                  <span className={`text-xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </GlassCard>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 text-center">
              <h3 className="text-lg font-bold mb-2 text-white flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" /> Automate Your DCA
              </h3>
              <p className="text-zinc-400 text-sm mb-4">Our bots can execute DCA trades for you automatically, 24/7.</p>
              <Link 
                href="/signup"
                className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-sm"
              >
                Start DCA Bot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
