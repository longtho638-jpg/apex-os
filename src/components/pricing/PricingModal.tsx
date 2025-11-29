'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X, Check, Zap, TrendingUp, Crown } from 'lucide-react';
import { CheckoutModal } from '@/components/payments/CheckoutModal';
import { UNIFIED_TIERS } from '@/config/unified-tiers';
import { PaymentTier } from '@/config/payment-tiers';
import { trackEvent } from '@/lib/analytics-mock';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentTier: string;
  trigger: 'rate_limit' | 'upgrade_button' | 'manual';
}

const TIER_ICONS = {
  FREE: Zap,
  PRO: TrendingUp,
  TRADER: Crown,
  ELITE: Crown,
} as const;

const TIER_COLORS = {
  FREE: 'zinc',
  PRO: 'emerald',
  TRADER: 'blue',
  ELITE: 'purple',
} as const;

// Map UNIFIED_TIERS to component format
const TIER_CONFIG = {
  pro: {
    ...UNIFIED_TIERS.PRO,
    icon: TIER_ICONS.PRO,
    color: TIER_COLORS.PRO,
    ai_requests: UNIFIED_TIERS.PRO.aiRequestsPerDay,
    signals: UNIFIED_TIERS.PRO.tradingSignalsPerMonth === Infinity ? 'Unlimited' : UNIFIED_TIERS.PRO.tradingSignalsPerMonth,
  },
  trader: {
    ...UNIFIED_TIERS.TRADER,
    icon: TIER_ICONS.TRADER,
    color: TIER_COLORS.TRADER,
    ai_requests: UNIFIED_TIERS.TRADER.aiRequestsPerDay,
    signals: UNIFIED_TIERS.TRADER.tradingSignalsPerMonth === Infinity ? 'Unlimited' : UNIFIED_TIERS.TRADER.tradingSignalsPerMonth,
  },
  elite: {
    ...UNIFIED_TIERS.ELITE,
    icon: TIER_ICONS.ELITE,
    color: TIER_COLORS.ELITE,
    ai_requests: UNIFIED_TIERS.ELITE.aiRequestsPerDay === Infinity ? 'Unlimited' : UNIFIED_TIERS.ELITE.aiRequestsPerDay,
    signals: UNIFIED_TIERS.ELITE.tradingSignalsPerMonth === Infinity ? 'Unlimited' : UNIFIED_TIERS.ELITE.tradingSignalsPerMonth,
  },
} as const;

export function PricingModal({ isOpen, onClose, userId, currentTier, trigger }: PricingModalProps) {
  const [selectedTier, setSelectedTier] = useState<'pro' | 'trader' | 'elite'>('pro');
  const [showCheckout, setShowCheckout] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  if (!isOpen) return null;

  // Track modal view
  if (isOpen) {
    trackEvent({
      event_name: 'pricing_modal_viewed',
      user_id: userId,
      metadata: { trigger, current_tier: currentTier },
    });
  }

  if (showCheckout) {
    return (
      <CheckoutModal
        tier={selectedTier.toUpperCase() as PaymentTier} // Map to checkout tiers
        userEmail="" // Ideally pass email or fetch it
        onClose={() => {
          setShowCheckout(false);
          onClose();
        }}
        billingPeriod={billingPeriod}
      // isOpen={true} // CheckoutModal handles its own visibility usually via conditional render or parent
      />
    );
  }

  const urgencyMessage = trigger === 'rate_limit'
    ? "⚠️ You've hit your daily limit!"
    : "Unlock full potential of ApexOS";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-6xl w-full my-8">
        <GlassCard className="p-8 relative bg-[#030303]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{urgencyMessage}</h2>
            <p className="text-zinc-400 text-lg mb-6">
              Upgrade now and get <span className="text-emerald-400 font-bold">20% off</span> with code <span className="text-emerald-400 font-bold">TRIAL20</span>
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-white' : 'text-zinc-400'}`}>Monthly</span>
              <button
                onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-zinc-700 rounded-full transition-colors focus:outline-none"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-emerald-400 rounded-full transition-transform ${billingPeriod === 'annual' ? 'translate-x-7' : ''}`} />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'annual' ? 'text-white' : 'text-zinc-400'}`}>
                Yearly <span className="text-emerald-400 text-xs ml-1">(Save 17%)</span>
              </span>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {(['pro', 'trader', 'elite'] as const).map((tier) => {
              const config = TIER_CONFIG[tier];
              const Icon = config.icon;
              const isSelected = selectedTier === tier;
              const isCurrent = currentTier === tier;

              const price = billingPeriod === 'annual' ? config.annualPrice : config.monthlyPrice;
              const period = billingPeriod === 'annual' ? '/yr' : '/mo';

              // Dynamic styles based on tier color
              const borderColor = isSelected
                ? tier === 'pro' ? 'border-emerald-400 bg-emerald-400/5'
                  : tier === 'trader' ? 'border-blue-400 bg-blue-400/5'
                    : 'border-purple-400 bg-purple-400/5'
                : 'border-white/10 hover:border-white/20';

              const iconColor = tier === 'pro' ? 'text-emerald-400'
                : tier === 'trader' ? 'text-blue-400'
                  : 'text-purple-400';

              return (
                <div
                  key={tier}
                  onClick={() => !isCurrent && setSelectedTier(tier)}
                  className={`relative border-2 rounded-lg p-6 transition-all cursor-pointer ${borderColor} ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {config.highlight && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 ${tier === 'pro' ? 'bg-emerald-500' : tier === 'trader' ? 'bg-blue-500' : 'bg-purple-500'
                      } rounded-full text-sm font-bold whitespace-nowrap`}>
                      {config.highlight}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                    <div>
                      <h3 className="text-xl font-bold">{config.name}</h3>
                      <p className={`text-2xl font-bold ${iconColor}`}>
                        ${price}<span className="text-sm text-zinc-400">{period}</span>
                      </p>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">AI Requests</span>
                      <span className="font-bold">{config.ai_requests}/day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Signals</span>
                      <span className="font-bold">{config.signals}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {config.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent && (
                    <div className="mt-4 text-center text-sm text-zinc-500">
                      Current Plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3">Feature</th>
                    <th className="text-center p-3">Free</th>
                    <th className="text-center p-3 bg-emerald-400/5">Pro</th>
                    <th className="text-center p-3">Trader</th>
                    <th className="text-center p-3">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="p-3">AI Chat Requests</td>
                    <td className="text-center p-3">10/day</td>
                    <td className="text-center p-3 bg-emerald-400/5 font-bold">100/day</td>
                    <td className="text-center p-3">500/day</td>
                    <td className="text-center p-3">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">Trading Signals</td>
                    <td className="text-center p-3">3/month</td>
                    <td className="text-center p-3 bg-emerald-400/5 font-bold">Unlimited</td>
                    <td className="text-center p-3">Unlimited</td>
                    <td className="text-center p-3">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">Auto-Trading</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3 bg-emerald-400/5">❌</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-3">Support Response Time</td>
                    <td className="text-center p-3">3-5 days</td>
                    <td className="text-center p-3 bg-emerald-400/5 font-bold">24 hours</td>
                    <td className="text-center p-3">1 hour</td>
                    <td className="text-center p-3">Instant</td>
                  </tr>
                  <tr>
                    <td className="p-3">Direct Commission (Total Potential)</td>
                    <td className="text-center p-3">0%</td>
                    <td className="text-center p-3 bg-emerald-400/5">20% <span className="text-xs text-zinc-400">(35%)</span></td>
                    <td className="text-center p-3">25% <span className="text-xs text-zinc-400">(55%)</span></td>
                    <td className="text-center p-3 font-bold">30% <span className="text-xs text-emerald-400">(75%)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8 py-3"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                trackEvent({
                  event_name: 'pricing_modal_upgrade_clicked',
                  user_id: userId,
                  metadata: { selected_tier: selectedTier, trigger, billing_period: billingPeriod },
                });
                setShowCheckout(true);
              }}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-lg font-bold"
            >
              Upgrade to {TIER_CONFIG[selectedTier].name} - ${billingPeriod === 'annual' ? TIER_CONFIG[selectedTier].annualPrice : TIER_CONFIG[selectedTier].monthlyPrice}/{billingPeriod === 'annual' ? 'yr' : 'mo'}
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-6 text-center text-sm text-zinc-400">
            🔒 Secure payment • 💳 Crypto accepted • ⚡ Instant activation • 🔄 Cancel anytime
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
