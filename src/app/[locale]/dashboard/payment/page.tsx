"use client";

import { Check, Zap, TrendingUp, Crown, Bot, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';
import { UNIFIED_TIERS, TIER_ORDER, type TierId } from '@apex-os/vibe-payment';
import { useUserTier } from '@/hooks/useUserTier';

const TIER_ICONS: Record<TierId, typeof Zap> = {
  EXPLORER: Zap,
  OPERATOR: TrendingUp,
  ARCHITECT: Crown,
  SOVEREIGN: Bot,
};

const TIER_COLORS: Record<TierId, { text: string; border: string; bg: string }> = {
  EXPLORER: { text: 'text-zinc-400', border: 'border-zinc-500/20', bg: 'bg-zinc-500/5' },
  OPERATOR: { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  ARCHITECT: { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
  SOVEREIGN: { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
};

const VOLUME_LABELS: Record<TierId, string> = {
  EXPLORER: 'Up to $10K/mo',
  OPERATOR: '$10K–$100K/mo',
  ARCHITECT: '$100K–$1M/mo',
  SOVEREIGN: '$1M+/mo',
};

export default function PaymentPage() {
  const { tier: currentTier } = useUserTier();

  return (
    <div className="relative min-h-full bg-[#030303] text-white font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 h-20 flex items-center px-8 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">RaaS Tier Overview</h1>
            <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Zero fees — auto-upgrade by volume</p>
          </div>
        </div>
      </header>

      <div className="p-8 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-lg text-zinc-400">
            All tiers are <span className="text-emerald-400 font-bold">$0/mo</span>. Trade more volume to unlock better spreads & more AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {TIER_ORDER.map((tierId, index) => {
            const tier = UNIFIED_TIERS[tierId];
            const Icon = TIER_ICONS[tierId];
            const colors = TIER_COLORS[tierId];
            const isPopular = tierId === 'ARCHITECT';

            return (
              <motion.div
                key={tierId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col h-full p-6 rounded-3xl border backdrop-blur-xl transition-all group ${
                  isPopular
                    ? 'bg-gradient-to-b from-cyan-900/20 to-black border-cyan-500/30 shadow-2xl shadow-cyan-500/10 scale-[1.02] z-10'
                    : `${colors.bg} ${colors.border} hover:bg-white/10`
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className={`text-xl font-black tracking-tight ${colors.text}`}>{tier.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{VOLUME_LABELS[tierId]}</p>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-black text-white tracking-tighter">$0<span className="text-sm text-zinc-500">/mo</span></div>
                </div>

                <div className="mb-6 space-y-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between text-sm">
                    <span className="text-zinc-400">Spread</span>
                    <span className="font-bold">{(tier.spreadBps / 100).toFixed(2)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between text-sm">
                    <span className="text-zinc-400">Self Rebate</span>
                    <span className="font-bold text-emerald-400">{(tier.selfRebateRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between text-sm">
                    <span className="text-zinc-400">AI Agents</span>
                    <span className="font-bold">{tier.agentSlots === Infinity ? '∞' : tier.agentSlots}</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                  {tier.features.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-zinc-300">
                      <Check className={`w-3 h-3 ${colors.text} mt-0.5 shrink-0`} />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button3D full variant={isPopular ? 'primary' : 'glass'}>
                  {currentTier === tierId ? 'Current Tier' : (
                    <span className="flex items-center gap-2">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button3D>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
