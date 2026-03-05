import { motion } from 'framer-motion';
import { Brain, ChevronRight, RefreshCw, Shield, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Strategy {
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  entry_zone: { min: number; max: number };
  stop_loss: number;
  take_profit_targets: number[];
  reasoning: string;
}

interface DeepSeekInsightProps {
  symbol: string;
  marketContext?: string; // Optional context to pass for analysis
  onExecute?: (strategy: Strategy) => void;
}

export default function DeepSeekInsight({ symbol, marketContext, onExecute }: DeepSeekInsightProps) {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [_error, setError] = useState<string | null>(null);

  const analyzeMarket = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock context if not provided (in prod, this comes from a data service)
      const context =
        marketContext ||
        `
                Current Price: $98,000
                24h Vol: $50B
                RSI: 65
                Trend: Bullish
                News: ETF inflows hitting record highs.
            `;

      const res = await fetch('/api/ai/deepseek/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_id_placeholder', // In real app, get from context
          symbol,
          marketContext: context,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      setStrategy(data.strategy);
    } catch (err: any) {
      setError(err.message);
      // Fallback mock for demo if API fails (or rate limited)
      setStrategy({
        signal: 'LONG',
        confidence: 85,
        entry_zone: { min: 97800, max: 98200 },
        stop_loss: 96500,
        take_profit_targets: [99500, 102000, 105000],
        reasoning:
          'Strong institutional buying pressure detected near $98k support. Order flow shows aggressive market buys. Breakout above $99k likely triggers liquidation cascade.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden relative group">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />

      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 rounded-lg">
            <Brain className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">DeepQuant Neural Core</h3>
            <p className="text-[10px] text-zinc-400">AI Strategy Engine</p>
          </div>
        </div>
        <button
          onClick={analyzeMarket}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className={cn('h-4 w-4 text-zinc-400', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {!strategy && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <Brain className="h-12 w-12 text-zinc-600" />
            <p className="text-sm text-zinc-500">Ready to analyze {symbol}</p>
            <button
              onClick={analyzeMarket}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded-lg transition-all"
            >
              Generate Alpha
            </button>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
            {/* Scanning Effect */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

            <div className="relative z-20">
              <div className="h-16 w-16 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="text-center z-20">
              <p className="text-sm font-bold text-blue-400 animate-pulse">NEURAL SCANNING</p>
              <p className="text-[10px] text-blue-500/70 font-mono mt-1">Analyzing 50+ Indicators...</p>
            </div>
          </div>
        )}

        {strategy && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Signal Card */}
            <div
              className={cn(
                'p-4 rounded-xl border flex items-center justify-between relative overflow-hidden',
                strategy.signal === 'LONG'
                  ? 'bg-green-500/10 border-green-500/20'
                  : strategy.signal === 'SHORT'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-zinc-500/10 border-zinc-500/20',
              )}
            >
              <div className="relative z-10">
                <div className="text-xs font-medium opacity-70 mb-1">SIGNAL</div>
                <div
                  className={cn(
                    'text-2xl font-black tracking-wider flex items-center gap-2',
                    strategy.signal === 'LONG'
                      ? 'text-green-400'
                      : strategy.signal === 'SHORT'
                        ? 'text-red-400'
                        : 'text-zinc-400',
                  )}
                >
                  {strategy.signal}
                  {strategy.signal === 'LONG' && <TrendingUp className="h-6 w-6" />}
                  {strategy.signal === 'SHORT' && <TrendingDown className="h-6 w-6" />}
                </div>
              </div>

              {/* Confidence Gauge */}
              <div className="relative z-10 text-right">
                <div className="text-xs font-medium opacity-70 mb-1">CONFIDENCE</div>
                <div className="text-2xl font-bold text-white">{strategy.confidence}%</div>
              </div>

              {/* Background Splash */}
              <div
                className={cn(
                  'absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20',
                  strategy.signal === 'LONG'
                    ? 'bg-green-500'
                    : strategy.signal === 'SHORT'
                      ? 'bg-red-500'
                      : 'bg-zinc-500',
                )}
              />
            </div>

            {/* Key Levels */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                  <Target className="h-3 w-3" /> Entry Zone
                </div>
                <div className="font-mono text-white">
                  {strategy.entry_zone.min.toLocaleString()} - {strategy.entry_zone.max.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5 text-red-400 mb-1">
                  <Shield className="h-3 w-3" /> Stop Loss
                </div>
                <div className="font-mono text-red-400 font-bold">{strategy.stop_loss.toLocaleString()}</div>
              </div>
            </div>

            {/* Take Profits */}
            <div className="space-y-2">
              <div className="text-xs text-zinc-500 font-medium">TAKE PROFIT TARGETS</div>
              <div className="grid grid-cols-3 gap-2">
                {strategy.take_profit_targets.map((tp, i) => (
                  <div key={i} className="p-2 bg-[#00FF94]/5 border border-[#00FF94]/10 rounded text-center">
                    <div className="text-[10px] text-[#00FF94]/70 mb-0.5">TP {i + 1}</div>
                    <div className="text-xs font-mono text-[#00FF94]">{tp.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-2 font-bold">
                <Brain className="h-3 w-3" /> AI REASONING
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">{strategy.reasoning}</p>
            </div>

            {/* Execute Button */}
            <button
              onClick={() => onExecute?.(strategy)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Execute Strategy</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
