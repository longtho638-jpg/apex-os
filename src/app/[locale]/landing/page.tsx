'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  EyeOff,
  FileX,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { Button3D } from '@/components/marketing/Button3D';
import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { GradientText } from '@/components/marketing/GradientText';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { analytics } from '@/lib/analytics';

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations('Landing');

  const handleStartTrial = () => {
    analytics.track('start_trial_click');
    router.push('/signup');
  };

  const _handleViewPricing = () => {
    analytics.track('view_pricing_click');
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-red-500/30 overflow-x-hidden">
      <ParticleBackground />
      <SiteHeader />

      {/* 1. HERO SECTION - OPTIMIZED */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Red Alarm Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -z-10 animate-pulse duration-700" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-bold text-red-400 tracking-wide uppercase">
                Join 1,000+ traders making smarter decisions
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
              {t('hero.title').split('30%')[0]}
              <span className="text-red-500 relative inline-block mx-2">
                30%
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-red-500/50"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
              {t('hero.title').split('30%')[1]} <br />
              <GradientText from="from-white" to="to-zinc-400">
                {t('hero.subtitle').split('.')[0]}
              </GradientText>
              .
            </h1>

            <div className="text-6xl font-mono font-bold text-red-500 mb-2 flex justify-center items-center gap-2">
              <TrendingDown className="w-12 h-12" />
              $<AnimatedNumber value={1247} duration={3000} />
            </div>
            <p className="text-zinc-500 text-sm mb-12 uppercase tracking-widest">{t('hero.loss_label')}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Button3D
                variant="primary"
                onClick={handleStartTrial}
                className="!bg-red-600 !hover:shadow-red-500/30 text-lg h-16 px-10"
              >
                {t('hero.cta')} <ArrowRight className="ml-2 w-5 h-5 inline" />
              </Button3D>
              <p className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {t('hero.no_card')}
              </p>
            </div>
          </motion.div>

          {/* Dashboard Mockup - Negative State */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto max-w-4xl perspective-1000"
          >
            <div className="bg-[#0A0A0A] border border-red-500/20 rounded-xl overflow-hidden shadow-2xl shadow-red-900/20 transform rotate-x-12">
              <div className="h-12 bg-black/50 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-red-500/5 to-transparent h-[400px] flex flex-col items-center justify-center border-t border-red-500/10">
                <AlertCircle className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
                <h3 className="text-3xl font-bold text-white mb-2">Rebate Leakage Detected</h3>
                <p className="text-red-400 font-mono text-xl">-$1,247.00 / month</p>

                <div className="mt-8 w-full max-w-md h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[75%] animate-pulse" />
                </div>
                <div className="flex justify-between w-full max-w-md mt-2 text-xs text-zinc-500">
                  <span>Efficiency: 25%</span>
                  <span>Leakage: 75%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <SocialProofSection />

      {/* 2. PAIN POINTS - "Show the Wound" */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('problem.title')}</h2>
            <p className="text-xl text-zinc-400">Don't let manual tracking drain your alpha.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t('problem.miss_deadlines'), desc: t('problem.miss_deadlines_desc'), icon: Clock, loss: '$450' },
              { title: t('problem.lose_track'), desc: t('problem.lose_track_desc'), icon: FileX, loss: '$800' },
              { title: t('problem.no_visibility'), desc: t('problem.no_visibility_desc'), icon: EyeOff, loss: '$???' },
            ].map((item, i) => (
              <GlassmorphicCard key={i} className="hover:!border-red-500/50 group">
                <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">{item.desc}</p>
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                    {t('problem.loss_label')}
                  </span>
                  <span className="font-mono text-lg font-bold text-white">{item.loss}</span>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SOLUTION - "The Cure" */}
      <section className="py-32 bg-emerald-900/10 border-y border-emerald-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                {t('solution.title')}
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8">{t('solution.setup')}</h2>

              <div className="space-y-6">
                {[
                  { title: t('solution.auto_connect'), desc: 'Link Binance, OKX, Bybit via read-only API in seconds.' },
                  { title: t('solution.real_time'), desc: 'See every rebate hit your account the moment it happens.' },
                  { title: t('solution.shows_owed'), desc: 'We notify you instantly if an exchange underpays you.' },
                  { title: t('solution.alerts'), desc: 'Weekly summaries of exactly how much free money you made.' },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-white">{feature.title}</h3>
                      <p className="text-zinc-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
              <div className="bg-black border border-emerald-500/30 rounded-2xl p-8 relative z-10 shadow-2xl">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Zap className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <div className="text-zinc-400 text-sm uppercase tracking-widest mb-2">
                    {t('solution.total_recovered')}
                  </div>
                  <div className="text-5xl font-mono font-bold text-white">
                    $<AnimatedNumber value={5432.91} />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">Binance Rebate</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-sm">+$124.50</span>
                    </div>
                  ))}
                </div>
                <Button3D full className="mt-8" onClick={handleStartTrial}>
                  {t('solution.activate_cta')}
                </Button3D>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('testimonials.title')}</h2>
            <div className="flex justify-center gap-1 text-yellow-400 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="text-zinc-400">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: t('testimonials.quote1'), author: t('testimonials.author1'), role: 'Day Trader' },
              { quote: t('testimonials.quote2'), author: t('testimonials.author2'), role: 'Crypto Investor' },
              { quote: t('testimonials.quote3'), author: t('testimonials.author3'), role: 'Algo Trader' },
            ].map((testimonial, i) => (
              <GlassmorphicCard key={i}>
                <p className="text-lg font-medium mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center font-bold text-zinc-400">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.author}</div>
                    <div className="text-emerald-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-emerald-900/10 to-transparent -z-10" />
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">{t('pricing.title')}</h2>
          <p className="text-xl text-zinc-300 mb-12">{t('pricing.no_card')}</p>
          <Button3D onClick={handleStartTrial} className="text-xl h-20 px-12 !bg-white !text-black hover:!bg-zinc-200">
            {t('pricing.cta')}
          </Button3D>
          <p className="mt-8 text-sm text-zinc-500">Includes 7-day money-back guarantee on paid plans.</p>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('faq.title')}</h2>
          <div className="space-y-6">
            {[
              { q: t('faq.q1'), a: t('faq.a1') },
              { q: t('faq.q2'), a: t('faq.a2') },
              { q: t('faq.q3'), a: t('faq.a3') },
              { q: t('faq.q4'), a: t('faq.a4') },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <h3 className="text-xl font-bold mb-3 text-white">{faq.q}</h3>
                <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
