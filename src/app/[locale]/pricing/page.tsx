'use client';

import { Check, TrendingUp, Zap } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { PricingCalculator } from '@/components/pricing/PricingCalculator';
import { UNIFIED_TIERS, TIER_ORDER, type TierId } from '@apex-os/vibe-payment';

const VOLUME_LABEL_KEYS: Record<TierId, string> = {
  EXPLORER: 'volume_explorer',
  OPERATOR: 'volume_operator',
  ARCHITECT: 'volume_architect',
  SOVEREIGN: 'volume_sovereign',
};

export default function PricingPage() {
  const t = useTranslations('Pricing');

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <ParticleBackground />
      <SiteHeader />

      <div className="relative pt-40 pb-20 text-center px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-emerald-500/50 text-emerald-400 px-4 py-1.5 text-sm tracking-widest uppercase">
            {t('hero.badge')}
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-tight">{t('hero.title')}</h1>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <PricingCalculator />
        </motion.div>
      </div>

      {/* Tier Cards */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">{t('tiers.section_subtitle')}</p>
            <h2 className="text-3xl font-bold text-white">{t('tiers.section_title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIER_ORDER.map((tierId, index) => {
              const tier = UNIFIED_TIERS[tierId];
              const isHighlight = tierId === 'ARCHITECT';
              const spreadPct = (tier.spreadBps / 100).toFixed(2);
              const rebatePct = (tier.selfRebateRate * 100).toFixed(0);
              const slots = tier.agentSlots === Infinity ? '∞' : tier.agentSlots;

              return (
                <motion.div
                  key={tierId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex"
                >
                  <div className={`
                    relative w-full p-6 flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden
                    ${isHighlight
                      ? 'bg-emerald-900/10 border-emerald-500/50 shadow-2xl shadow-emerald-900/20 scale-105 z-10'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }
                  `}>
                    {isHighlight && (
                      <>
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">{t('tiers.most_popular')}</Badge>
                        </div>
                      </>
                    )}

                    {/* Tier name & price */}
                    <div className="mb-4">
                      <h3 className={`text-xl font-bold mb-1 ${isHighlight ? 'text-emerald-400' : 'text-white'}`}>
                        {tier.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mb-3">{t(`raas.${VOLUME_LABEL_KEYS[tierId]}`)}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">$0</span>
                        <span className="text-zinc-500 text-sm">/mo</span>
                      </div>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-center">
                        <p className="text-xs text-zinc-500 mb-0.5">{t('raas.spread_label')}</p>
                        <p className={`text-sm font-bold ${isHighlight ? 'text-emerald-400' : 'text-white'}`}>{spreadPct}%</p>
                      </div>
                      <div className="text-center border-x border-white/10">
                        <p className="text-xs text-zinc-500 mb-0.5">{t('raas.rebate_label')}</p>
                        <p className={`text-sm font-bold ${isHighlight ? 'text-emerald-400' : 'text-white'}`}>{rebatePct}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-zinc-500 mb-0.5">{t('raas.agents_label')}</p>
                        <p className={`text-sm font-bold ${isHighlight ? 'text-emerald-400' : 'text-white'}`}>{slots}</p>
                      </div>
                    </div>

                    <Button3D
                      full
                      variant={isHighlight ? 'primary' : 'glass'}
                      className="mb-6"
                      onClick={() => window.location.href = '/register'}
                    >
                      {t('tiers.start_trading')}
                    </Button3D>

                    {/* Features */}
                    <div className="space-y-3 flex-1">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SaaS vs RaaS Comparison */}
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{t('comparison.title')}</h2>
            <p className="text-zinc-400">{t('comparison.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SaaS column */}
            <div className="p-6 rounded-2xl bg-red-900/10 border border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-sm font-bold">✕</span>
                </div>
                <h3 className="text-lg font-bold text-red-400">{t('comparison.saas_title')}</h3>
              </div>
              {[
                t('comparison.saas_1'),
                t('comparison.saas_2'),
                t('comparison.saas_3'),
                t('comparison.saas_4'),
                t('comparison.saas_5'),
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 mb-3 text-sm text-zinc-400">
                  <span className="text-red-500 mt-0.5 shrink-0">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* RaaS column */}
            <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-emerald-400">{t('comparison.raas_title')}</h3>
              </div>
              {[
                t('comparison.raas_1'),
                t('comparison.raas_2'),
                t('comparison.raas_3'),
                t('comparison.raas_4'),
                t('comparison.raas_5'),
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 mb-3 text-sm text-zinc-300">
                  <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
