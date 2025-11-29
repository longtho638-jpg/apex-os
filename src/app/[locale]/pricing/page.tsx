'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Shield, Clock, Zap, CreditCard, CheckCircle } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { useTranslations } from '@/contexts/I18nContext';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { PricingCalculator } from '@/components/pricing/PricingCalculator';
import { UNIFIED_TIERS } from '@/config/unified-tiers';

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const t = useTranslations('Pricing');

  const TIERS = [
    {
      name: t('tiers.free.name'),
      monthlyPrice: UNIFIED_TIERS.FREE.monthlyPrice,
      annualPrice: UNIFIED_TIERS.FREE.annualPrice,
      description: 'For beginners tracking their first rebates.',
      features: t('tiers.free.features', { returnObjects: true }) as string[],
      limitations: ['No Export', 'No API Access'],
      cta: t('tiers.free.name'),
      popular: false,
      period: t('tiers.free.period')
    },
    {
      name: t('tiers.pro.name'),
      monthlyPrice: UNIFIED_TIERS.PRO.monthlyPrice,
      annualPrice: UNIFIED_TIERS.PRO.annualPrice,
      description: 'Maximize profits with advanced tools.',
      features: t('tiers.pro.features', { returnObjects: true }) as string[],
      limitations: [],
      cta: t('tiers.pro.name'),
      popular: true,
      badge: t('tiers.pro.badge'),
      period: t('tiers.pro.period')
    },
    {
      name: t('tiers.trader.name'),
      monthlyPrice: UNIFIED_TIERS.TRADER.monthlyPrice,
      annualPrice: UNIFIED_TIERS.TRADER.annualPrice,
      description: 'For algo traders and high volume pros.',
      features: t('tiers.trader.features', { returnObjects: true }) as string[],
      limitations: [],
      cta: t('tiers.trader.name'),
      popular: false,
      period: t('tiers.trader.period')
    },
    {
      name: t('tiers.elite.name'),
      monthlyPrice: UNIFIED_TIERS.ELITE.monthlyPrice,
      annualPrice: UNIFIED_TIERS.ELITE.annualPrice,
      description: 'Enterprise-grade solution for funds.',
      features: t('tiers.elite.features', { returnObjects: true }) as string[],
      limitations: [],
      cta: t('tiers.elite.name'),
      popular: false,
      period: t('tiers.elite.period')
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <ParticleBackground />
      <SiteHeader />

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="outline" className="mb-6 border-emerald-500/50 text-emerald-400 px-4 py-1.5 text-sm tracking-widest uppercase">
            🔥 {t('urgency.limited')}
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-tight">
            {t('hero.title')}
          </h1>

          <PricingCalculator />
        </motion.div>
      </div>

      {/* Pricing Tiers */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-zinc-400'}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-emerald-600" />
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-zinc-400'}`}>
              Annual <span className="text-emerald-400 text-xs ml-1 font-bold tracking-wide uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Save 17%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`
                    relative h-full p-6 flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden group
                    ${tier.popular
                    ? 'bg-emerald-900/10 border-emerald-500/50 shadow-2xl shadow-emerald-900/20 scale-105 z-10'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }
                `}>
                  {tier.popular && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                  )}

                  <div className="mb-6">
                    <h3 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-emerald-400' : 'text-white'}`}>{tier.name}</h3>
                    <p className="text-sm text-zinc-400 h-10 leading-snug">{tier.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white tracking-tight">
                        $<AnimatedNumber value={isAnnual ? tier.annualPrice : tier.monthlyPrice} />
                      </span>
                      <span className="text-zinc-500 text-sm font-medium">{isAnnual ? '/yr' : '/mo'}</span>
                    </div>
                  </div>

                  <Button3D full variant={tier.popular ? 'primary' : 'glass'} className="mb-8" onClick={() => router.push('/signup')}>
                    {tier.cta}
                  </Button3D>

                  <div className="space-y-4 flex-1">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}