'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { BacktestResult } from '@/lib/algo/backtest-engine';

export function BottomPanel({ results }: { results?: BacktestResult | null }) {
  const [isOpen, setIsOpen] = useState(true);

  // Default / Empty state
  const totalPnL = results?.totalPnL || 0;
  const winRate = results?.winRate || 0;
  const trades = results?.totalTrades || 0;
  const equityCurve = results?.equityCurve || Array(40).fill(10000);

  // Normalize curve for drawing (simple scaling)
  const minEq = Math.min(...equityCurve);
  const maxEq = Math.max(...equityCurve);
  const range = maxEq - minEq || 1;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#080808] border-t border-white/10 z-20 flex flex-col font-sans">
      {/* Header Toggle */}
      <div 
        className="h-8 bg-zinc-900 flex items-center justify-between px-4 cursor-pointer hover:bg-zinc-800 transition border-b border-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <Activity className="w-3 h-3 text-emerald-500" />
          Live Backtest Console {results ? '(Ready)' : '(Idle)'}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            exit={{ height: 0 }}
            className="flex overflow-hidden"
          >
            {/* Stats Column */}
            <div className="w-64 border-r border-white/10 p-4 flex flex-col justify-center gap-4 bg-zinc-900/30">
                <div>
                    <p className="text-[10px] text-zinc-500 uppercase mb-1">Total Net Profit</p>
                    <p className={`text-2xl font-mono font-bold flex items-center gap-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} <TrendingUp className="w-4 h-4" />
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-zinc-500 uppercase mb-1">Win Rate ({trades} trades)</p>
                    <p className="text-lg font-mono font-bold text-white">{winRate.toFixed(1)}%</p>
                </div>
                <div>
                    <p className="text-[10px] text-zinc-500 uppercase mb-1">Status</p>
                    <p className="text-xs font-mono text-zinc-400">{results ? 'Simulation Complete' : 'Waiting for run...'}</p>
                </div>
            </div>

            {/* Chart Area (Visualizing Equity Curve) */}
            <div className="flex-1 p-4 relative">
                <div className="absolute inset-4 border border-white/5 rounded-lg bg-black/50 flex items-end justify-between px-2 pb-2 overflow-hidden">
                    {/* SVG Line Chart would be better, but using divs for quick responsiveness */}
                    {equityCurve.map((val, i) => {
                        const heightPct = ((val - minEq) / range) * 80 + 10; // 10% min height
                        return (
                            <div 
                                key={i} 
                                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/50 transition-all mx-[1px] rounded-t-sm relative group"
                                style={{ height: `${heightPct}%` }}
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-white/10 z-10">
                                    ${val.toFixed(0)}
                                </div>
                            </div>
                        );
                    })}
                    <div className="absolute top-4 left-4 text-xs text-zinc-600 font-mono">Equity Curve (Simulated)</div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
