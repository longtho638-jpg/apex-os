/**
 * Mini Indicator Charts - RSI & MACD
 *
 * Lightweight charts below main chart for WOW factor
 */

'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { MarketTicker } from '@/hooks/useMarketData';

interface MiniIndicatorChartsProps {
  ticker: MarketTicker | undefined;
}

export function MiniIndicatorCharts({ ticker }: MiniIndicatorChartsProps) {
  if (!ticker) return null;

  const { rsi, macroRsi } = ticker;

  // Ensure valid numbers to prevent NaN
  const validRsi = typeof rsi === 'number' && !Number.isNaN(rsi) ? rsi : 50;
  const validMacroRsi = typeof macroRsi === 'number' && !Number.isNaN(macroRsi) ? macroRsi : 50;
  const effectiveRsi = (validRsi + validMacroRsi) / 2;

  // Mock MACD values (in production, calculate from historical data)
  const macdValue = effectiveRsi > 50 ? 15 : -15;
  const macdSignal = effectiveRsi > 50 ? 10 : -10;
  const macdHistogram = macdValue - macdSignal;

  return (
    <div className="grid grid-cols-2 gap-2 p-2 bg-black/20 border-t border-white/10">
      {/* RSI Mini Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg border border-white/10 p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RSI (14)</span>
          <span
            className={`text-sm font-mono font-bold ${
              effectiveRsi < 30 ? 'text-green-400' : effectiveRsi > 70 ? 'text-red-400' : 'text-white'
            }`}
          >
            {effectiveRsi.toFixed(1)}
          </span>
        </div>

        {/* Mini RSI Bar */}
        <div className="relative h-12 bg-black/30 rounded overflow-hidden">
          {/* Zones */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-red-500/10 border-b border-white/5" />
            <div className="flex-1 bg-transparent border-b border-white/5" />
            <div className="flex-1 bg-green-500/10" />
          </div>

          {/* RSI Level Indicator */}
          <motion.div
            className={`absolute left-0 right-0 h-1 ${
              effectiveRsi < 30 ? 'bg-green-500' : effectiveRsi > 70 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ bottom: `${effectiveRsi}%` }}
            animate={{ bottom: `${effectiveRsi}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />

          {/* Level Labels */}
          <div className="absolute left-1 top-0 text-[8px] text-red-400/60">70</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-white/40">50</div>
          <div className="absolute left-1 bottom-0 text-[8px] text-green-400/60">30</div>
        </div>

        {/* Status */}
        <div className="mt-1 text-center">
          {effectiveRsi < 30 && <span className="text-[8px] text-green-400 font-bold">OVERSOLD</span>}
          {effectiveRsi > 70 && <span className="text-[8px] text-red-400 font-bold">OVERBOUGHT</span>}
          {effectiveRsi >= 30 && effectiveRsi <= 70 && (
            <span className="text-[8px] text-zinc-500 font-bold">NEUTRAL</span>
          )}
        </div>
      </motion.div>

      {/* MACD Mini Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-lg border border-white/10 p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">MACD</span>
          <div className="flex items-center gap-1">
            {macdHistogram > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span className={`text-xs font-mono font-bold ${macdHistogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {macdHistogram.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Mini MACD Histogram */}
        <div className="relative h-12 flex items-center gap-0.5">
          {/* Center line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />

          {/* Histogram bars (last 10 periods mock) */}
          {Array.from({ length: 10 }).map((_, i) => {
            const value = Math.sin(i * 0.5) * (effectiveRsi - 50) * 0.3;
            const isPositive = value > 0;
            const height = Math.abs(value);

            return (
              <motion.div
                key={i}
                className="flex-1 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={`w-full rounded-sm ${isPositive ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                  style={{
                    height: `${Math.max(2, height * 2)}px`,
                    alignSelf: isPositive ? 'flex-end' : 'flex-start',
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Signal */}
        <div className="mt-1 flex items-center justify-between text-[8px]">
          <span className="text-zinc-500">Signal: {macdSignal.toFixed(1)}</span>
          <span className={macdHistogram > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {macdHistogram > 0 ? 'BULLISH' : 'BEARISH'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
