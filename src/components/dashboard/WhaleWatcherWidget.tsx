'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair, Anchor } from 'lucide-react';

interface WhaleTrade {
  id: string;
  pair: string;
  amount: number;
  side: 'BUY' | 'SELL';
  exchange: string;
  timestamp: number;
}

export function WhaleWatcherWidget() {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);

  useEffect(() => {
    // Simulate live whale trades
    const interval = setInterval(() => {
      const newTrade: WhaleTrade = {
        id: Math.random().toString(36).substr(2, 9),
        pair: Math.random() > 0.5 ? 'BTC/USDT' : 'ETH/USDT',
        amount: Math.floor(Math.random() * 5000000) + 1000000, // $1M - $6M
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        exchange: Math.random() > 0.5 ? 'Binance' : 'OKX',
        timestamp: Date.now(),
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 5));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Anchor className="w-5 h-5 text-blue-400" /> Whale Radar
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-xs text-red-400 font-mono">LIVE &gt;$1M</span>
        </div>
      </div>

      {/* Radar Scan Effect */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(transparent_0deg,rgba(59,130,246,0.1)_60deg,transparent_60deg)] animate-spin-slow pointer-events-none opacity-30" />

      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {trades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${trade.side === 'BUY' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  <Crosshair className={`w-4 h-4 ${trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{trade.pair}</p>
                  <p className="text-xs text-zinc-500">{trade.exchange}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono font-bold ${trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trade.side === 'BUY' ? '+' : '-'}${(trade.amount / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {trades.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2" />
                <p className="text-xs">Scanning Deep Liquidity...</p>
            </div>
        )}
      </div>
    </GlassCard>
  );
}
