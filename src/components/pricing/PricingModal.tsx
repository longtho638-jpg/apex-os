'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { X, Check, Zap, TrendingUp, Crown, Bot } from 'lucide-react';
import { UNIFIED_TIERS, TIER_ORDER, type TierId } from '@apex-os/vibe-payment';
import { trackEvent } from '@/lib/analytics-mock';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentTier: string;
  trigger: 'rate_limit' | 'upgrade_button' | 'manual';
}

const TIER_ICONS: Record<TierId, typeof Zap> = {
  EXPLORER: Zap,
  OPERATOR: TrendingUp,
  ARCHITECT: Crown,
  SOVEREIGN: Bot,
};

const TIER_COLORS: Record<TierId, string> = {
  EXPLORER: 'text-zinc-400',
  OPERATOR: 'text-emerald-400',
  ARCHITECT: 'text-blue-400',
  SOVEREIGN: 'text-purple-400',
};

export function PricingModal({ isOpen, onClose, userId, currentTier, trigger }: PricingModalProps) {
  if (!isOpen) return null;

  trackEvent({
    event_name: 'pricing_modal_viewed',
    user_id: userId,
    metadata: { trigger, current_tier: currentTier },
  });

  const urgencyMessage = trigger === 'rate_limit'
    ? "You've hit your daily limit! Trade more to unlock higher tiers."
    : "Trade more volume to auto-unlock better spreads & more agents.";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-6xl w-full my-8">
        <GlassCard className="p-8 relative bg-[#030303]">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{urgencyMessage}</h2>
            <p className="text-zinc-400 text-lg">
              All tiers are <span className="text-emerald-400 font-bold">$0/mo</span> — unlock by trading volume
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {TIER_ORDER.map((tierId) => {
              const tier = UNIFIED_TIERS[tierId];
              const Icon = TIER_ICONS[tierId];
              const color = TIER_COLORS[tierId];
              const isCurrent = currentTier === tierId;
              const isHighlighted = tierId === 'ARCHITECT';

              return (
                <div
                  key={tierId}
                  className={`relative border-2 rounded-lg p-6 transition-all ${
                    isHighlighted ? 'border-blue-400 bg-blue-400/5 scale-105' :
                    isCurrent ? 'border-emerald-400 bg-emerald-400/5' :
                    'border-white/10 hover:border-white/20'
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-sm font-bold whitespace-nowrap">
                      Best Value
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-8 h-8 ${color}`} />
                    <div>
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p className="text-2xl font-bold text-emerald-400">$0<span className="text-sm text-zinc-400">/mo</span></p>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-3 mb-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Spread</span>
                      <span className="font-bold">{(tier.spreadBps / 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Rebate</span>
                      <span className="font-bold text-emerald-400">{(tier.selfRebateRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Agents</span>
                      <span className="font-bold">{tier.agentSlots === Infinity ? '∞' : tier.agentSlots}</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {tier.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent && (
                    <div className="mt-4 text-center text-sm text-emerald-400 font-bold">Current Tier</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button onClick={onClose} variant="outline" className="px-8 py-3">
              Got It
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-400">
            RaaS Model — Trade more volume to auto-unlock higher tiers
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
