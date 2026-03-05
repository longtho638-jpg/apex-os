'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, Search, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button3D } from './Button3D';

interface AnalysisResult {
  symbol: string;
  prediction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  sentiment: number;
  whales: number;
}

export function InteractiveDemoWidget() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!symbol) return;
    setLoading(true);

    // Simulate API call time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock result (replace with real API later)
    setResult({
      symbol: symbol.toUpperCase(),
      prediction: Math.random() > 0.4 ? 'BUY' : 'SELL',
      confidence: 70 + Math.floor(Math.random() * 28),
      sentiment: Math.random() * 2 - 1, // -1 to 1
      whales: Math.floor(Math.random() * 5),
    });
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
      {/* Scanning Grid Effect */}
      {loading && <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-20 animate-pulse" />}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">Live AI Analysis</h3>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">v2.4.0 Active</div>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter symbol (e.g. BTC)"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors uppercase font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          <Button3D onClick={handleAnalyze} disabled={loading || !symbol} className="min-w-[100px] !py-0">
            {loading ? '...' : 'Scan'}
          </Button3D>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[200px] flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-sm text-emerald-400 font-mono animate-pulse">Scanning Order Flow...</div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border ${
                    result.prediction === 'BUY'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="text-xs text-zinc-400 mb-1">Prediction</div>
                  <div
                    className={`text-2xl font-bold ${
                      result.prediction === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {result.prediction}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs text-zinc-400 mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-white">{result.confidence}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Sentiment
                  </span>
                  <span className={result.sentiment > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {result.sentiment > 0 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Whale Activity
                  </span>
                  <span className="text-white font-mono">{result.whales} Large Txns</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  This is a demo analysis. Upgrade to Pro for real-time execution and verified signals.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-white/5 rounded-xl">
              <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Enter a symbol to analyze</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
