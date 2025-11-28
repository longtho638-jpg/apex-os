'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { GlassmorphicCard } from '@/components/marketing/GlassmorphicCard';
import { AnimatedNumber } from '@/components/marketing/AnimatedNumber';
import { Button3D } from '@/components/marketing/Button3D';

type DemoState = 'idle' | 'selecting' | 'analyzing' | 'results';

export default function SmartSwitchWizard() {
  const [state, setState] = useState<DemoState>('idle');
  const [exchange, setExchange] = useState('Binance');
  const [pair, setPair] = useState('BTC/USDT');
  const [volume, setVolume] = useState(10000);
  const [progress, setProgress] = useState(0);

  const exchanges = [
    'Binance', 'Bybit', 'OKX', 'Bitget', 
    'KuCoin', 'MEXC', 'Gate.io', 'HTX', 
    'BingX', 'Phemex', 'CoinEx', 'BitMart'
  ];
  const pairs = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 
    'XRP/USDT', 'DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 
    'LINK/USDT', 'DOT/USDT'
  ];

  const handleAnalyze = () => {
    setState('analyzing');
    // Simulate AI analysis
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => setState('results'), 500);
      }
    }, 200);
  };

  const calculateSavings = () => {
    // Fake calculation for demo
    const baseRebate = volume * 0.0005; // 0.05% base
    const optimizedRebate = volume * 0.00127; // 0.127% optimized
    const monthly = (optimizedRebate - baseRebate) * 30;
    const percentage = ((optimizedRebate - baseRebate) / baseRebate * 100);
    return { monthly: Math.round(monthly), percentage: Math.round(percentage) };
  };

  return (
    <div className="relative py-20">
      {/* Title Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-sm font-bold text-emerald-400">LIVE DEMO</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          See ApexOS AI in <span className="text-emerald-400">Action</span>
        </h2>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Interactive demo: Select your trading parameters and watch our AI find the best rebate opportunity
        </p>
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
                className="space-y-8"
              >
                {/* Input Form */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Exchange Selector */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Your Exchange
                    </label>
                    <select
                      value={exchange}
                      onChange={(e) => setExchange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      {exchanges.map(ex => (
                        <option key={ex} value={ex} className="bg-zinc-900">{ex}</option>
                      ))}
                    </select>
                  </div>
  
                  {/* Pair Selector */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Trading Pair
                    </label>
                    <select
                      value={pair}
                      onChange={(e) => setPair(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      {pairs.map(p => (
                        <option key={p} value={p} className="bg-zinc-900">{p}</option>
                      ))}
                    </select>
                  </div>
  
                  {/* Volume Input */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Daily Volume
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                      <input
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
  
                {/* Volume Slider */}
                <div>
                  <div className="flex justify-between text-sm text-zinc-500 mb-2">
                    <span>$1K</span>
                    <span className="text-white font-bold">${(volume / 1000).toFixed(0)}K Daily Volume</span>
                    <span>$100K</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.1)] outline-none appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
  
                {/* CTA */}
                <div className="text-center pt-4">
                  <Button3D 
                    onClick={handleAnalyze}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Analyze My Rebates
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
                  </Button3D>
                  <p className="text-xs text-zinc-500 mt-3">
                    🔒 No signup required • Instant results
                  </p>
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
                className="py-16 text-center"
              >
                <div className="mb-8">
                  <div className="inline-flex p-6 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-12 h-12 text-emerald-400" />
                    </motion.div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                  </div>
                </div>
  
                <h3 className="text-2xl font-bold mb-3">AI Analysis Running...</h3>
                <p className="text-zinc-400 mb-8">
                  Comparing {exchanges.length} exchanges • Analyzing {pair} rates • Calculating optimal path
                </p>
  
                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="h-3 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-sm font-mono text-emerald-400 mt-2">
                    {progress}% Complete
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
                className="space-y-6"
              >
                {/* Success Header */}
                <div className="text-center pb-6 border-b border-[rgba(255,255,255,0.1)]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex p-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-2">Optimization Found! 🎉</h3>
                  <p className="text-zinc-400">Here's how to maximize your rebates</p>
                </div>
  
                {/* Results Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                    <div className="text-emerald-400 text-sm font-bold mb-1">RECOMMENDED</div>
                    <div className="text-2xl font-bold">OKX</div>
                    <div className="text-xs text-zinc-500 mt-1">Best for {pair}</div>
                  </div>
  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                    <div className="text-cyan-400 text-sm font-bold mb-1">MONTHLY SAVINGS</div>
                    <div className="text-2xl font-bold">
                      $<AnimatedNumber value={calculateSavings().monthly} duration={1500} />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">vs {exchange}</div>
                  </div>
  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="text-purple-400 text-sm font-bold mb-1">IMPROVEMENT</div>
                    <div className="text-2xl font-bold">
                      +<AnimatedNumber value={calculateSavings().percentage} duration={1500} />%
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Better rebate rate</div>
                  </div>
                </div>
  
                {/* Detailed Breakdown */}
                <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    Why OKX is Better
                  </h4>
                  <ul className="space-y-3">
                    {[
                      { label: 'Higher rebate tier', value: '0.127% vs 0.050%' },
                      { label: 'Lower maker fees', value: '0.02% vs 0.10%' },
                      { label: 'VIP qualification', value: 'Within reach' },
                      { label: 'Monthly bonus program', value: 'Extra $50' }
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{item.value}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
  
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => {
                      setState('idle');
                      setProgress(0);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] transition-colors text-sm font-medium text-white"
                  >
                    Try Another Scenario
                  </button>
                  <Button3D className="flex-1" onClick={() => window.location.href = '/signup'}>
                    Start Free Trial →
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
        className="text-center mt-16"
      >
        <p className="text-xl text-zinc-400 mb-6">
          Want this level of optimization for <span className="text-white font-bold">YOUR</span> actual trades?
        </p>
        <Button3D className="text-lg px-10 py-5" onClick={() => window.location.href = '/signup'}>
          Start Free Trial - Setup in 2 Minutes
        </Button3D>
        <p className="text-sm text-zinc-500 mt-4">
          ✓ No credit card required • ✓ 7-day free trial • ✓ Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}