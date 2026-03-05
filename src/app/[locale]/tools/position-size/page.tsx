'use client';

import { Activity, Shield, Target } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';

export default function PositionSizeCalculatorPage() {
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPercentage, setRiskPercentage] = useState<number>(1);
  const [stopLossDistance, setStopLossDistance] = useState<number>(5); // % distance

  const calculatePosition = () => {
    if (!accountSize || !riskPercentage || !stopLossDistance) return 0;

    const riskAmount = (accountSize * riskPercentage) / 100;
    const positionSize = riskAmount / (stopLossDistance / 100);

    return positionSize;
  };

  const positionSize = calculatePosition();
  const riskAmount = (accountSize * riskPercentage) / 100;

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Position Size Calculator
          </h1>
          <p className="text-zinc-400">Manage risk like a pro. Calculate the perfect position size for every trade.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Risk Parameters
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Account Balance ($)</label>
                <input
                  type="number"
                  value={accountSize || ''}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 10000"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Risk per Trade (%)</label>
                <input
                  type="number"
                  value={riskPercentage || ''}
                  onChange={(e) => setRiskPercentage(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 1"
                />
                <p className="text-xs text-zinc-500 mt-1">Recommended: 1-2%</p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Stop Loss Distance (%)</label>
                <input
                  type="number"
                  value={stopLossDistance || ''}
                  onChange={(e) => setStopLossDistance(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Recommended Size
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Position Size</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${positionSize.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Risk Amount</span>
                  <span className="text-xl font-bold text-red-400">${riskAmount.toFixed(2)}</span>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-300">
                    <strong>Pro Tip:</strong> Even if this trade hits your stop loss, you will only lose{' '}
                    {riskPercentage}% of your account.
                  </p>
                </div>
              </div>
            </GlassCard>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 text-center">
              <h3 className="text-lg font-bold mb-2 text-white flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Smart Risk Management
              </h3>
              <p className="text-zinc-400 text-sm mb-4">Our AI manages risk automatically for every trade signal.</p>
              <Link
                href="/signup"
                className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-sm"
              >
                Automate Risk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
