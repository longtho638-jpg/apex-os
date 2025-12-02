'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ProfitCalculatorPage() {
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [exitPrice, setExitPrice] = useState<number>(0);
  const [positionSize, setPositionSize] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(1);
  const [isLong, setIsLong] = useState(true);

  const calculateProfit = () => {
    if (!entryPrice || !exitPrice || !positionSize) return 0;

    const priceDiff = isLong ? exitPrice - entryPrice : entryPrice - exitPrice;
    const percentageChange = (priceDiff / entryPrice) * 100;
    const profit = (positionSize * leverage * percentageChange) / 100;

    return profit;
  };

  const profit = calculateProfit();
  const roi = positionSize ? (profit / positionSize) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Crypto Profit Calculator
          </h1>
          <p className="text-zinc-400">
            Calculate potential profits, ROI, and risk for your crypto trades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" /> Trade Details
            </h3>

            <div className="space-y-6">
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setIsLong(true)}
                  className={`flex-1 py-2 rounded-md font-medium transition ${isLong ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Long
                </button>
                <button
                  onClick={() => setIsLong(false)}
                  className={`flex-1 py-2 rounded-md font-medium transition ${!isLong ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Short
                </button>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Entry Price ($)</label>
                <input
                  type="number"
                  value={entryPrice || ''}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 50000"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Exit Price ($)</label>
                <input
                  type="number"
                  value={exitPrice || ''}
                  onChange={(e) => setExitPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 55000"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Position Size ($)</label>
                <input
                  type="number"
                  value={positionSize || ''}
                  onChange={(e) => setPositionSize(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Leverage (x{leverage})</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Results
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Total Profit/Loss</span>
                  <span className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${profit.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">ROI</span>
                  <span className={`text-xl font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {roi.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400">Total Value</span>
                  <span className="text-xl font-bold text-white">
                    ${(positionSize + profit).toFixed(2)}
                  </span>
                </div>
              </div>
            </GlassCard>

            <Link
              href="/signup"
              className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Get AI Signals
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <h3 className="text-lg font-bold mb-2 text-white">Ready to execute?</h3>
            <p className="text-zinc-400 text-sm mb-4">Open this position in the terminal instantly.</p>
            <Link
              href={`/dashboard/trading?symbol=BTC&side=${isLong ? 'buy' : 'sell'}&amount=${positionSize}&leverage=${leverage}`}
              className="inline-block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Trade Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
