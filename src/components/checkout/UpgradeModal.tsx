'use client';

import { useState } from 'react';
import { CheckoutModal } from '@/components/payments/CheckoutModal';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { TierId } from '@/config/unified-tiers';
import { PaymentTier } from '@/config/payment-tiers';

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

export function UpgradeModal({
  isOpen,
  onClose,
  trigger,
  userId,
  currentTier = 'free',
}: UpgradeModalProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierId>('PRO');

  if (!isOpen) return null;

  const urgencyColors = {
    low: 'border-blue-400/20 bg-blue-400/5',
    medium: 'border-yellow-400/20 bg-yellow-400/5',
    high: 'border-red-400/20 bg-red-400/5',
  };

  if (showCheckout) {
    return (
      <CheckoutModal
        tier={selectedTier as unknown as PaymentTier | TierId}
        userEmail="" // Ideally fetch or pass this
        onClose={() => {
          setShowCheckout(false);
          onClose();
        }}
        // isOpen={true} // Handled by conditional rendering
        // isOpen={true} // Handled by conditional rendering
        initialDiscountCode={trigger.discount}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className={`max-w-lg w-full p-8 relative ${urgencyColors[trigger.urgency]}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <Sparkles className="w-16 h-16 text-emerald-400" />
        </div>

        {/* Trigger message */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {trigger.type === 'limit_reached' && 'Unlock Unlimited Access'}
          {trigger.type === 'win_achieved' && 'Celebrate Your Win!'}
          {trigger.type === 'trial_ending' && 'Don\'t Lose Access'}
          {trigger.type === 'missed_money' && 'Claim Pending Funds'}
        </h2>

        <p className="text-center text-lg mb-6">{trigger.message}</p>

        {/* Discount badge */}
        {trigger.discount && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6 text-center">
            <p className="text-emerald-400 font-bold">
              🎁 Use code <span className="text-xl text-white mx-1 bg-emerald-600 px-2 py-0.5 rounded">{trigger.discount}</span> for 20% off!
            </p>
          </div>
        )}

        {/* Tier selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['PRO', 'TRADER'] as TierId[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-4 rounded-lg border-2 transition ${selectedTier === tier
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-white/10 hover:border-white/20'
                }`}
            >
              <p className="font-bold capitalize">{tier}</p>
              <p className="text-sm text-zinc-400">
                ${tier === 'PRO' ? '29' : '97'}/mo
              </p>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Maybe Later
          </Button>
          <Button
            onClick={() => setShowCheckout(true)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold"
          >
            Upgrade Now
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
