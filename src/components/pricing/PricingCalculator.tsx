'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';

export function PricingCalculator() {
  const [volume, setVolume] = useState(100000);
  const [rebateRate, setRebateRate] = useState(0.05); // 0.05% avg rebate

  const monthlySavings = volume * (rebateRate / 100);
  const annualSavings = monthlySavings * 12;
  const cost = 97 * 12; // Trader tier annual
  const roi = ((annualSavings - cost) / cost) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-white">ROI Calculator</h3>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-zinc-400">Monthly Trading Volume</span>
            <span className="font-mono text-white font-bold">${volume.toLocaleString('en-US')}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="5000000"
            step="10000"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-2">
            <span>$10k</span>
            <span>$5M+</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-white/5">
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <DollarSign size={12} /> Monthly Recovery
            </div>
            <div className="text-2xl font-bold text-white">
              $<AnimatedNumber value={monthlySavings} />
            </div>
          </div>
          
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <TrendingUp size={12} /> Annual Value
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              $<AnimatedNumber value={annualSavings} />
            </div>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Percent size={12} /> Estimated ROI
            </div>
            <div className={`text-2xl font-bold ${roi > 0 ? 'text-blue-400' : 'text-zinc-400'}`}>
              <AnimatedNumber value={Math.max(0, roi)} />%
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-zinc-500">
            *Based on average rebate rate of 0.05%. Actual rates vary by exchange and tier.
          </p>
        </div>
      </div>
    </div>
  );
}
