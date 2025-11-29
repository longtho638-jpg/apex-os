'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Lock, Unlock, Coins } from 'lucide-react';
import { calculateVesting } from '@/lib/finance/vesting';

export function ClaimWidget() {
  // Mock data
  const totalTokens = 5000;
  const purchaseDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 15); // 15 days ago
  
  const { claimable, locked } = calculateVesting(totalTokens, purchaseDate);

  return (
    <GlassCard className="p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Coins className="w-5 h-5 text-yellow-400" /> Your Allocation
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-zinc-300">Available</span>
            </div>
            <span className="font-bold text-white">{claimable.toFixed(2)} APEX</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                <span className="text-sm text-zinc-300">Locked</span>
            </div>
            <span className="font-bold text-zinc-500">{locked.toFixed(2)} APEX</span>
        </div>

        <button 
            disabled={claimable <= 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors"
        >
            Claim Tokens
        </button>
        
        <p className="text-xs text-center text-zinc-500">Next unlock in 15 days</p>
      </div>
    </GlassCard>
  );
}
