'use client';

import { Sparkles, TrendingUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: {
    type: 'limit_reached' | 'win_achieved' | 'trial_ending' | 'missed_money';
    message: string;
    urgency: 'low' | 'medium' | 'high';
    discount?: string;
  };
  userId: string;
  currentTier?: string;
}

export function UpgradeModal({ isOpen, onClose, trigger }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const urgencyColors = {
    low: 'border-blue-400/20 bg-blue-400/5',
    medium: 'border-yellow-400/20 bg-yellow-400/5',
    high: 'border-red-400/20 bg-red-400/5',
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className={`max-w-lg w-full p-8 relative ${urgencyColors[trigger.urgency]}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <Sparkles className="w-16 h-16 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          {trigger.type === 'limit_reached' && 'Increase Volume to Unlock'}
          {trigger.type === 'win_achieved' && 'Celebrate Your Win!'}
          {trigger.type === 'trial_ending' && 'Keep Trading to Stay'}
          {trigger.type === 'missed_money' && 'Claim Pending Funds'}
        </h2>

        <p className="text-center text-lg mb-6">{trigger.message}</p>

        {/* RaaS Volume Tiers */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            Trade more to auto-unlock higher tiers
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white/5 rounded">
              <span className="text-zinc-400">Operator</span>
              <span className="text-white font-bold ml-2">$10K+/mo</span>
            </div>
            <div className="p-2 bg-white/5 rounded">
              <span className="text-zinc-400">Architect</span>
              <span className="text-white font-bold ml-2">$100K+/mo</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">$0/mo forever — tiers unlock via trading volume</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              onClose();
              router.push('/en/dashboard/trading');
            }}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold"
          >
            Start Trading
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
