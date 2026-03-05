'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BarChart3, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { Button3D } from '@/components/marketing/Button3D';
import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { logger } from '@/lib/logger';

type DemoState = 'idle' | 'selecting' | 'analyzing' | 'results';

export default function SmartSwitchWizard() {
  const t = useTranslations('DashboardComponents.SmartSwitch');
  const [state, setState] = useState<DemoState>('idle');
  const [exchange, setExchange] = useState('Binance');
  const [pair, setPair] = useState('BTC/USDT');
  const [volume, setVolume] = useState(10000);
  const [progress, setProgress] = useState(0);
  const [recommendation, setRecommendation] = useState({
    name: 'OKX',
    reason: 'Highest Rebate',
    savings: 0,
    percent: 0,
  });

  const exchanges = [
    'Binance',
    'Bybit',
    'OKX',
    'Bitget',
    'KuCoin',
    'MEXC',
    'Gate.io',
    'HTX',
    'BingX',
    'Phemex',
    'CoinEx',
    'BitMart',
  ];
  const pairs = [
    'BTC/USDT',
    'ETH/USDT',
    'SOL/USDT',
    'BNB/USDT',
    'XRP/USDT',
    'DOGE/USDT',
    'ADA/USDT',
    'AVAX/USDT',
    'LINK/USDT',
    'DOT/USDT',
  ];

  const handleAnalyze = async () => {
    setState('analyzing');
    setProgress(0);

    // Start Progress Animation (Visual feedback while fetching)
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      if (prog < 90) setProgress(prog);
    }, 100);

    try {
      // Call Real-time Analysis API
      const res = await fetch('/api/v1/market/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange, pair, volume }),
      });

      const data = await res.json();

      clearInterval(interval);
      setProgress(100);

      if (data.success) {
        setRecommendation({
          name: data.analysis.name,
          reason: 'Apex Optimized', // Simplified for now, can be dynamic from API
          savings: data.analysis.savings,
          percent: data.analysis.percent,
        });
        setTimeout(() => setState('results'), 500);
      } else {
        // Fallback if API fails
        setState('idle');
        alert('Analysis failed. Please try again.');
      }
    } catch (error) {
      clearInterval(interval);
      setState('idle');
      logger.error('Operation failed', error);
    }
  };

  return (
    <div className="relative py-6">
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">{t('live_demo')}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {t('title_prefix')} <span className="text-emerald-400">{t('title_suffix')}</span>
        </h2>

        <p className="text-base text-zinc-400 max-w-2xl mx-auto">{t('description')}</p>
      </motion.div>

      {/* Interactive Demo Area */}
      <div className="max-w-4xl mx-auto">
        <GlassmorphicCard className="overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STATE: IDLE / SELECTING */}
            {(state === 'idle' || state === 'selecting') && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Input Form */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Exchange Selector */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">{t('your_exchange')}</label>
                    <select
                      value={exchange}
                      onChange={(e) => setExchange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      {exchanges.map((ex) => (
                        <option key={ex} value={ex} className="bg-zinc-900">
                          {ex}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pair Selector */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">{t('trading_pair')}</label>
                    <select
                      value={pair}
                      onChange={(e) => setPair(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      {pairs.map((p) => (
                        <option key={p} value={p} className="bg-zinc-900">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Volume Input */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">{t('daily_volume')}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                      <input
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full pl-6 pr-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Volume Slider */}
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>$1K</span>
                    <span className="text-white font-bold">
                      ${(volume / 1000).toFixed(0)}K {t('daily_volume')}
                    </span>
                    <span>$100K</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] outline-none appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* CTA */}
                <div className="text-center pt-2">
                  <Button3D onClick={handleAnalyze} className="group relative overflow-hidden px-6 py-2.5">
                    <span className="relative z-10 flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4" />
                      {t('analyze_button')}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
                  </Button3D>
                  <p className="text-[10px] text-zinc-500 mt-2">🔒 {t('no_signup')}</p>
                </div>
              </motion.div>
            )}

            {/* STATE: ANALYZING */}
            {state === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8 text-center"
              >
                <div className="mb-6">
                  <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{t('analyzing_title')}</h3>
                <p className="text-sm text-zinc-400 mb-6">
                  {t('analyzing_desc', { exchanges: exchanges.length, pair: pair })}
                </p>

                {/* Progress Bar */}
                <div className="max-w-sm mx-auto">
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-2">
                    {progress}% {t('complete')}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STATE: RESULTS */}
            {state === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Success Header */}
                <div className="text-center pb-4 border-b border-[rgba(255,255,255,0.1)]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-flex p-3 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 mb-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-1">{t('optimization_found')}</h3>
                  <p className="text-sm text-zinc-400">{t('optimization_desc')}</p>
                </div>

                {/* Results Grid */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                    <div className="text-emerald-400 text-xs font-bold mb-1">{t('recommended')}</div>
                    <div className="text-xl font-bold">{recommendation.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{t('best_for', { pair })}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                    <div className="text-cyan-400 text-xs font-bold mb-1">{t('monthly_savings')}</div>
                    <div className="text-xl font-bold">
                      $<AnimatedNumber value={recommendation.savings} duration={1500} />
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">{t('vs_exchange', { exchange })}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="text-purple-400 text-xs font-bold mb-1">{t('improvement')}</div>
                    <div className="text-xl font-bold">
                      +<AnimatedNumber value={recommendation.percent} duration={1500} />%
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">{t('better_rate')}</div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Why {recommendation.name} is Better
                  </h4>
                  <ul className="space-y-2">
                    {[
                      {
                        label: t('breakdown.tier'),
                        value: `${recommendation.name === 'OKX' ? '0.127%' : '0.055%'} vs 0.050%`,
                      },
                      { label: t('breakdown.maker_fees'), value: '0.02% vs 0.10%' },
                      { label: t('breakdown.vip'), value: 'Within reach' },
                      { label: t('breakdown.bonus'), value: 'Extra $50' },
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{item.value}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setState('idle');
                      setProgress(0);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] transition-colors text-xs font-medium text-white"
                  >
                    {t('try_another')}
                  </button>
                  <Button3D className="flex-1 px-4 py-2.5 text-xs" onClick={() => (window.location.href = '/signup')}>
                    {t('start_trial_arrow')}
                  </Button3D>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassmorphicCard>
      </div>

      {/* Final Conversion CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <p className="text-base text-zinc-400 mb-4">
          {t.rich('conversion_text', {
            b: (chunks) => <span className="text-white font-bold">{chunks}</span>,
          })}
        </p>
        <Button3D className="text-sm px-8 py-3" onClick={() => (window.location.href = '/signup')}>
          {t('start_trial_setup')}
        </Button3D>
        <p className="text-[10px] text-zinc-500 mt-3">{t('trial_benefits')}</p>
      </motion.div>
    </div>
  );
}
