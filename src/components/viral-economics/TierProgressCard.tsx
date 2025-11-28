import React from 'react';
import { Crown, TrendingUp, Users } from 'lucide-react';

interface TierProgressProps {
  currentTier: string;
  nextTier: string;
  referralCount: number;
  referralTarget: number;
  volume: number;
  volumeTarget: number;
}

export function TierProgressCard({
  currentTier,
  nextTier,
  referralCount,
  referralTarget,
  volume,
  volumeTarget
}: TierProgressProps) {
  const refProgress = Math.min(100, (referralCount / referralTarget) * 100);
  const volProgress = Math.min(100, (volume / volumeTarget) * 100);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white border border-gray-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">Current Tier</h3>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <Crown className="w-6 h-6" />
            {currentTier}
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">Next Tier</h3>
          <div className="text-xl font-semibold text-gray-300">{nextTier}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Active Referrals</span>
            <span className="font-mono">{referralCount} / {referralTarget}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${refProgress}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-400" /> Monthly Volume</span>
            <span className="font-mono">${volume.toLocaleString()} / ${volumeTarget.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${volProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
