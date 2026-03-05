'use client';

import { BarChart2, Play } from 'lucide-react';
import { useState } from 'react';

interface BacktestResult {
  roi: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
}

export function BacktestRunner({ agentId }: { agentId: string }) {
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    const res = await fetch('/api/ai/backtest', {
      method: 'POST',
      body: JSON.stringify({ agentId, timeframe: '30d' }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={runBacktest}
        disabled={loading}
        className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          'Simulating...'
        ) : (
          <>
            <Play className="w-4 h-4" /> Run Backtest
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10 animate-in fade-in">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" /> Simulation Results (30d)
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">ROI</p>
              <p className={`font-bold ${result.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.roi.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Win Rate</p>
              <p className="font-bold text-white">{result.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-zinc-500">Max Drawdown</p>
              <p className="font-bold text-red-400">{result.maxDrawdown.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-zinc-500">Sharpe Ratio</p>
              <p className="font-bold text-blue-400">{result.sharpeRatio.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
