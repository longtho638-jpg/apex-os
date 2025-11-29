'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { DollarSign, Calculator, Calendar } from 'lucide-react';

export function ExitCalculator() {
  const [valuation, setValuation] = useState(50000000); // $50M
  const [equity, setEquity] = useState(60); // 60%
  const [taxRate, setTaxRate] = useState(20); // 20%

  const grossExit = valuation * (equity / 100);
  const netExit = grossExit * (1 - taxRate / 100);
  const monthlyBurn = 20000; // Assuming $20k/mo lifestyle
  const freedomYears = netExit / (monthlyBurn * 12);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-emerald-400" />
        <h3 className="text-xl font-bold">Exit Simulator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
            <label className="block text-xs text-zinc-400 mb-2">Target Valuation ($)</label>
            <input 
                type="number" 
                value={valuation}
                onChange={(e) => setValuation(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
            />
        </div>
        <div>
            <label className="block text-xs text-zinc-400 mb-2">Your Equity (%)</label>
            <input 
                type="number" 
                value={equity}
                onChange={(e) => setEquity(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
            />
        </div>
        <div>
            <label className="block text-xs text-zinc-400 mb-2">Tax Rate (%)</label>
            <input 
                type="number" 
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl">
            <p className="text-zinc-400 text-xs mb-1">Net Cashout</p>
            <p className="text-3xl font-bold text-emerald-400 font-mono">
                ${netExit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl">
            <p className="text-zinc-400 text-xs mb-1">Financial Freedom</p>
            <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-blue-400 font-mono">
                    {freedomYears.toFixed(1)}
                </p>
                <span className="text-sm text-zinc-500 mb-1">Years</span>
            </div>
        </div>
      </div>
    </GlassCard>
  );
}
