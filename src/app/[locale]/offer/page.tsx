'use client';

import { UNIFIED_TIERS } from '@apex-os/vibe-payment';
import { motion } from 'framer-motion';
import { AlertCircle, Calculator, Check, Crown, Rocket, TrendingUp, Users, Zap } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button3D } from '@/components/marketing/Button3D';
import { Sidebar } from '@/components/os/sidebar';

export default function OfferPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [activeReferrals, setActiveReferrals] = useState(3);
  const [avgVolume, setAvgVolume] = useState(50000);

  const AVG_FEE_RATE = 0.0005;
  const APEX_COMMISSION_SHARE = 0.4;

  const calculateEarnings = (tierId: string, refs: number, vol: number) => {
    const tier = UNIFIED_TIERS[tierId as keyof typeof UNIFIED_TIERS];
    if (!tier) return { commission: 0, rebate: 0, total: 0 };

    const baseRevenue = refs * vol * AVG_FEE_RATE * APEX_COMMISSION_SHARE;
    const selfRevenue = vol * AVG_FEE_RATE * APEX_COMMISSION_SHARE;

    const commission = baseRevenue * tier.commissionRates.l1;
    const rebate = selfRevenue * tier.selfRebateRate;

    return { commission, rebate, total: commission + rebate };
  };

  const tiers = [
    {
      id: 'EXPLORER',
      name: UNIFIED_TIERS.EXPLORER.name,
      volumeRange: '$0 – $10K/mo',
      spreadBps: UNIFIED_TIERS.EXPLORER.spreadBps,
      features: UNIFIED_TIERS.EXPLORER.features.slice(0, 4),
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10',
      border: 'border-zinc-500/20',
      icon: Users,
      highlight: false,
    },
    {
      id: 'OPERATOR',
      name: UNIFIED_TIERS.OPERATOR.name,
      volumeRange: '$10K – $100K/mo',
      spreadBps: UNIFIED_TIERS.OPERATOR.spreadBps,
      features: UNIFIED_TIERS.OPERATOR.features.slice(0, 4),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: Zap,
      highlight: false,
    },
    {
      id: 'ARCHITECT',
      name: UNIFIED_TIERS.ARCHITECT.name,
      volumeRange: '$100K – $1M/mo',
      spreadBps: UNIFIED_TIERS.ARCHITECT.spreadBps,
      features: UNIFIED_TIERS.ARCHITECT.features.slice(0, 4),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      icon: TrendingUp,
      highlight: true,
      badge: 'BEST VALUE',
    },
    {
      id: 'SOVEREIGN',
      name: UNIFIED_TIERS.SOVEREIGN.name,
      volumeRange: '$1M+/mo',
      spreadBps: UNIFIED_TIERS.SOVEREIGN.spreadBps,
      features: UNIFIED_TIERS.SOVEREIGN.features.slice(0, 4),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: Crown,
      highlight: false,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden selection:bg-[#00FF94]/20">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative custom-scrollbar">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] font-bold text-xs mb-6 tracking-wider"
            >
              <Rocket className="h-3 w-3" />
              RAAS — ZERO FEES FOREVER
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Trade More. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] to-cyan-400">
                Earn More. Pay Nothing.
              </span>
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              $0/mo forever. Tiers unlock automatically via trading volume. Every trade earns you{' '}
              <span className="text-[#00FF94] font-bold">spread rebates</span> and
              <span className="text-[#00FF94] font-bold"> referral commissions</span>.
            </p>
          </div>

          {/* ROI Simulator */}
          <div className="mb-16 p-1 rounded-3xl bg-gradient-to-r from-zinc-800 to-zinc-900 shadow-2xl">
            <div className="bg-[#0A0A0A] rounded-[22px] p-8 md:p-12 border border-white/5">
              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Calculator className="text-purple-400" />
                      Earnings Simulator
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-zinc-400">Active Referrals</span>
                          <span className="text-white font-bold text-lg">{activeReferrals}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={activeReferrals}
                          onChange={(e) => setActiveReferrals(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-zinc-400">Avg. Volume / User</span>
                          <span className="text-white font-bold text-lg">${avgVolume.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="500000"
                          step="10000"
                          value={avgVolume}
                          onChange={(e) => setAvgVolume(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#00FF94] shrink-0" />
                      <p>
                        <span className="text-white font-bold">Zero fees.</span> You never pay a subscription. Earnings
                        are pure profit from spread rebates + referral commissions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {tiers.map((tier) => {
                    const earnings = calculateEarnings(tier.id, activeReferrals, avgVolume);

                    return (
                      <motion.div
                        key={tier.id}
                        layout
                        className={`relative p-5 rounded-2xl border flex flex-col justify-between bg-gradient-to-b from-zinc-900/80 to-black ${tier.border}`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <tier.icon className={`w-4 h-4 ${tier.color}`} />
                            <span className={`font-bold text-sm ${tier.color}`}>{tier.name}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 mb-4">{tier.volumeRange}</div>
                          <div className="space-y-1 mb-4">
                            <div className="text-xs text-zinc-500">Spread</div>
                            <div className="text-lg font-bold text-white">{(tier.spreadBps / 100).toFixed(2)}%</div>
                          </div>
                        </div>

                        <div className={'pt-3 border-t border-white/10'}>
                          <div className="text-xs text-zinc-400 mb-1">Monthly Earnings</div>
                          <div className="text-xl font-black text-[#00FF94]">+${earnings.total.toFixed(0)}</div>
                          <div className="text-[10px] text-zinc-600 flex gap-2 mt-1">
                            <span>Ref: ${earnings.commission.toFixed(0)}</span>
                            <span>Self: ${earnings.rebate.toFixed(0)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl border ${tier.border} ${tier.bg} backdrop-blur-md flex flex-col h-full group hover:-translate-y-1 transition-all duration-300`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00FF94] text-black text-[10px] font-bold shadow-lg shadow-emerald-500/20">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className={`w-10 h-10 rounded-lg ${tier.bg} border ${tier.border} flex items-center justify-center mb-4`}
                  >
                    <tier.icon className={`h-5 w-5 ${tier.color}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$0</span>
                    <span className="text-sm text-zinc-500">/mo forever</span>
                  </div>
                  <div className="text-xs text-[#00FF94] mt-1 font-medium">{tier.volumeRange} volume to unlock</div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check className={`h-3 w-3 ${tier.color} mt-0.5 shrink-0`} />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button3D
                  full
                  variant={tier.highlight ? 'primary' : 'glass'}
                  className="w-full"
                  onClick={() => router.push(`/${locale}/dashboard/trading`)}
                >
                  Start Trading
                </Button3D>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
