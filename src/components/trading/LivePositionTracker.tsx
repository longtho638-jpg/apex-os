'use client';

import { Activity, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { WowEmptyState } from '@/components/ui/WowEmptyState';

interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entry_price: number;
  size: number;
  leverage: number;
  pnl?: number;
}

export function LivePositionTracker({ userId }: { userId: string }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({
    'BTC/USDT': 64250.0,
    'ETH/USDT': 3450.0,
  });

  const fetchPortfolio = useCallback(async () => {
    const res = await fetch('/api/v1/trading/paper/portfolio', {
      headers: { 'x-user-id': userId },
    });
    const data = await res.json();
    if (data.positions) setPositions(data.positions);
  }, [userId]);

  useEffect(() => {
    fetchPortfolio();

    const interval = setInterval(() => {
      setPrices((prev) => ({
        'BTC/USDT': prev['BTC/USDT'] * (1 + (Math.random() * 0.002 - 0.001)),
        'ETH/USDT': prev['ETH/USDT'] * (1 + (Math.random() * 0.002 - 0.001)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const closePosition = async (posId: string) => {
    await fetch('/api/v1/trading/paper/execute', {
      method: 'POST',
      body: JSON.stringify({ action: 'CLOSE', userId, positionId: posId }),
    });
    fetchPortfolio(); // Refresh
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" /> Live Positions
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Real-time</span>
        </div>
      </div>

      <div className="space-y-3">
        {positions.length === 0 && (
          <WowEmptyState
            title="No Active Positions"
            description="The market is waiting. Deploy your capital to start tracking real-time PnL."
            icon={Activity}
            action={{
              label: 'Open New Trade',
              onClick: () => (window.location.href = '/en/trade'),
            }}
            className="py-8"
          />
        )}

        {positions.map((pos) => {
          const currentPrice = prices[pos.symbol] || pos.entry_price;
          const priceDiff = pos.side === 'LONG' ? currentPrice - pos.entry_price : pos.entry_price - currentPrice;
          const pnlPercent = (priceDiff / pos.entry_price) * pos.leverage * 100;
          const pnlValue = (priceDiff / pos.entry_price) * pos.size * pos.leverage;

          return (
            <div
              key={pos.id}
              className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${pos.side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {pos.side} {pos.leverage}x
                  </span>
                  <span className="font-bold">{pos.symbol}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Entry: ${pos.entry_price.toFixed(2)} → Mark: ${currentPrice.toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p className={`font-mono font-bold ${pnlValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnlValue >= 0 ? '+' : ''}
                  {pnlValue.toFixed(2)} USDT
                </p>
                <p className={`text-xs ${pnlPercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {pnlPercent >= 0 ? '+' : ''}
                  {pnlPercent.toFixed(2)}%
                </p>
              </div>

              <button
                onClick={() => closePosition(pos.id)}
                className="ml-4 p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
