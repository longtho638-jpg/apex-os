/**
 * Quantitative Indicators Panel - WOW Component
 *
 * Beautiful real-time visualization of all quantitative indicators
 */

'use client';

import { motion } from 'framer-motion';
import { Activity, BarChart3, Brain, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import type { MarketTicker } from '@/hooks/useMarketData';

interface QuantPanelProps {
  ticker: MarketTicker | undefined;
  symbol: string;
}

export function QuantIndicatorsPanel({ ticker, symbol }: QuantPanelProps) {
  if (!ticker) {
    return (
      <div className="p-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg border border-white/5">
        <div className="text-sm text-zinc-500 text-center">Loading indicators...</div>
      </div>
    );
  }

  const { rsi, macroRsi, macroTrend, netVolumeDelta, upperBand, lowerBand, price, sma20 } = ticker;

  // Calculate derived metrics
  const effectiveRsi = (rsi + (macroRsi || 50)) / 2;
  const bbPercentage = upperBand && lowerBand ? ((price - lowerBand) / (upperBand - lowerBand)) * 100 : 50;

  // Market regime
  const isOversold = effectiveRsi < 30;
  const isOverbought = effectiveRsi > 70;
  const hasVolume = Math.abs(netVolumeDelta) > 100000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-lg border border-white/10 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div
          className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl ${
            isOversold ? 'bg-green-500/30' : isOverbought ? 'bg-red-500/30' : 'bg-purple-500/20'
          }`}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white">Quant Analysis</h3>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            macroTrend === 'BULLISH'
              ? 'bg-green-500/20 text-green-400'
              : macroTrend === 'BEARISH'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {macroTrend}
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="space-y-2 relative z-10">
        {/* RSI Composite */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              RSI Composite
            </span>
            <span
              className={`font-mono font-bold ${
                isOversold ? 'text-green-400' : isOverbought ? 'text-red-400' : 'text-white'
              }`}
            >
              {effectiveRsi.toFixed(1)}
            </span>
          </div>
          <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="w-[30%] bg-green-500/20" />
              <div className="flex-1 bg-transparent" />
              <div className="w-[30%] bg-red-500/20" />
            </div>
            <motion.div
              className={`absolute top-0 left-0 h-full rounded-full ${
                isOversold ? 'bg-green-500' : isOverbought ? 'bg-red-500' : 'bg-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${effectiveRsi}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
            {/* Marker lines */}
            <div className="absolute top-0 left-[30%] w-px h-full bg-white/20" />
            <div className="absolute top-0 left-[50%] w-px h-full bg-white/40" />
            <div className="absolute top-0 left-[70%] w-px h-full bg-white/20" />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-600">
            <span>Oversold</span>
            <span>Neutral</span>
            <span>Overbought</span>
          </div>
        </div>

        {/* Bollinger Band Position */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              BB Position
            </span>
            <span className="text-white font-mono font-bold">{bbPercentage.toFixed(0)}%</span>
          </div>
          <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className={`absolute top-0 left-0 h-full rounded-full ${
                bbPercentage < 20 ? 'bg-green-500' : bbPercentage > 80 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(bbPercentage, 100)}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
            <div className="absolute top-0 left-[20%] w-px h-full bg-white/20" />
            <div className="absolute top-0 left-[50%] w-px h-full bg-white/40" />
            <div className="absolute top-0 left-[80%] w-px h-full bg-white/20" />
          </div>
        </div>

        {/* Volume Flow */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Volume Flow
            </span>
            <div className="flex items-center gap-1">
              {netVolumeDelta > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`font-mono font-bold ${netVolumeDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(Math.abs(netVolumeDelta) / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 h-6">
            {/* Buy Pressure */}
            <div className="flex-1 flex justify-end">
              <motion.div
                className="bg-green-500/30 h-full rounded-l"
                initial={{ width: 0 }}
                animate={{
                  width: netVolumeDelta > 0 ? `${Math.min((netVolumeDelta / 1000000) * 100, 100)}%` : '0%',
                }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            </div>
            {/* Center Divider */}
            <div className="w-px h-full bg-white/40" />
            {/* Sell Pressure */}
            <div className="flex-1">
              <motion.div
                className="bg-red-500/30 h-full rounded-r"
                initial={{ width: 0 }}
                animate={{
                  width: netVolumeDelta < 0 ? `${Math.min((Math.abs(netVolumeDelta) / 1000000) * 100, 100)}%` : '0%',
                }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-zinc-600">
            <span className="text-green-500/60">Buy Pressure</span>
            <span className="text-red-500/60">Sell Pressure</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <div className="bg-black/20 rounded p-2">
            <div className="text-[9px] text-zinc-500 mb-0.5">Micro RSI</div>
            <div
              className={`text-sm font-bold font-mono ${
                (rsi || 50) < 30 ? 'text-green-400' : (rsi || 50) > 70 ? 'text-red-400' : 'text-white'
              }`}
            >
              {(rsi || 50).toFixed(1)}
            </div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="text-[9px] text-zinc-500 mb-0.5">Macro RSI</div>
            <div
              className={`text-sm font-bold font-mono ${
                (macroRsi || 50) < 30 ? 'text-green-400' : (macroRsi || 50) > 70 ? 'text-red-400' : 'text-white'
              }`}
            >
              {(macroRsi || 50).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {isOversold && (
            <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold rounded">OVERSOLD</div>
          )}
          {isOverbought && (
            <div className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded">OVERBOUGHT</div>
          )}
          {hasVolume && (
            <div className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-bold rounded">HIGH VOLUME</div>
          )}
          {bbPercentage < 20 && (
            <div className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-bold rounded">LOWER BAND</div>
          )}
          {bbPercentage > 80 && (
            <div className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded">UPPER BAND</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
