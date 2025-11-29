'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowRightLeft, TrendingUp } from 'lucide-react';

interface ArbOpportunity {
  pair: string;
  buyExchange: string;
  buyPrice: number;
  sellExchange: string;
  sellPrice: number;
  profit: number;
}

export function ArbitrageScannerWidget() {
  const [opportunities, setOpportunities] = useState<ArbOpportunity[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const opps = [
        { pair: 'BTC/USDT', buyExchange: 'Binance', buyPrice: 64200, sellExchange: 'OKX', sellPrice: 64250, profit: 0.08 },
        { pair: 'ETH/USDT', buyExchange: 'Bybit', buyPrice: 3450, sellExchange: 'Binance', sellPrice: 3458, profit: 0.23 },
        { pair: 'SOL/USDT', buyExchange: 'OKX', buyPrice: 145.20, sellExchange: 'Bybit', sellPrice: 145.80, profit: 0.41 },
      ];
      // Shuffle and randomize slightly
      setOpportunities(opps.map(o => ({ ...o, profit: o.profit + (Math.random() * 0.1 - 0.05) })));
    }, 5000);

    setOpportunities([
        { pair: 'BTC/USDT', buyExchange: 'Binance', buyPrice: 64200, sellExchange: 'OKX', sellPrice: 64250, profit: 0.08 },
        { pair: 'ETH/USDT', buyExchange: 'Bybit', buyPrice: 3450, sellExchange: 'Binance', sellPrice: 3458, profit: 0.23 },
        { pair: 'SOL/USDT', buyExchange: 'OKX', buyPrice: 145.20, sellExchange: 'Bybit', sellPrice: 145.80, profit: 0.41 },
    ]);

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-6 h-full">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <ArrowRightLeft className="w-5 h-5 text-purple-400" /> Arbitrage Scanner
      </h3>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-purple-500/30 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white">{opp.pair}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3" /> {opp.profit.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">{opp.buyExchange}</span>
                <span>${opp.buyPrice}</span>
              </div>
              <ArrowRightLeft className="w-3 h-3 text-zinc-600" />
              <div className="flex items-center gap-2">
                <span>${opp.sellPrice}</span>
                <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">{opp.sellExchange}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
