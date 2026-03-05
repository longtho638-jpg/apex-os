'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Signal {
  id: string;
  symbol: string;
  prediction: 'BUY' | 'SELL';
  confidence: number;
  timestamp: string;
}

export function LiveSignalTicker() {
  const [signals, setSignals] = useState<Signal[]>([]);

  // Mock data generator
  useEffect(() => {
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT'];

    const generateMockSignal = () => ({
      id: Math.random().toString(36).substr(2, 9),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      prediction: Math.random() > 0.5 ? 'BUY' : ('SELL' as 'BUY' | 'SELL'),
      confidence: 75 + Math.floor(Math.random() * 24),
      timestamp: new Date().toISOString(),
    });

    // Initial fill
    setSignals(Array.from({ length: 10 }, generateMockSignal));

    // Interval updates
    const interval = setInterval(() => {
      setSignals((prev) => [generateMockSignal(), ...prev.slice(0, 19)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-[#0A0A0A] border-y border-white/5 py-2 relative z-20">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 40,
        }}
      >
        {[...signals, ...signals].map((signal, i) => (
          <div key={`${signal.id}-${i}`} className="inline-flex items-center gap-3 px-6 border-r border-white/5">
            <span className="font-bold text-sm text-white">{signal.symbol}/USDT</span>
            <span
              className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                signal.prediction === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              {signal.prediction === 'BUY' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {signal.prediction}
            </span>
            <span className="text-xs text-zinc-500 font-mono">{signal.confidence}% Conf.</span>
          </div>
        ))}
      </motion.div>

      {/* Vignettes */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030303] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none" />
    </div>
  );
}
