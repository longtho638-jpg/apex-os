import type { MarketTicker } from '@/hooks/useMarketData';
import type { Signal, TradePlan } from './alpha-dashboard-types';

export const FULL_ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'PEPE', 'WIF', 'SUI', 'NEAR', 'APT', 'FET'];

// Helper function to format prices correctly for both large and very small numbers
export const formatPrice = (price: number): string => {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(10).replace(/\.?0+$/, '')}`;
  }
};

export const calculateTradePlan = (ticker: MarketTicker, type: 'BUY' | 'SELL'): TradePlan | undefined => {
  if (!ticker || !ticker.price || ticker.price <= 0 || Number.isNaN(ticker.price)) {
    return undefined;
  }
  const upperBand = ticker.upperBand || ticker.price * 1.02;
  const lowerBand = ticker.lowerBand || ticker.price * 0.98;
  const atr = Math.max((upperBand - lowerBand) / 4, ticker.price * 0.01);
  const price = ticker.price;
  const slDist = atr * 1.5;

  if (type === 'BUY') {
    return {
      direction: 'LONG',
      entry: price,
      sl: price - slDist,
      tp1: price + atr * 1.5,
      tp2: price + atr * 3,
      tp3: price + atr * 5,
      leverage: ticker.rsi < 20 ? 20 : 10,
      rr: 2.0,
    };
  } else {
    return {
      direction: 'SHORT',
      entry: price,
      sl: price + slDist,
      tp1: price - atr * 1.5,
      tp2: price - atr * 3,
      tp3: price - atr * 5,
      leverage: ticker.rsi > 80 ? 20 : 10,
      rr: 2.0,
    };
  }
};

export const generateInsight = (ticker: MarketTicker | undefined, signal: Signal | null, timeframe: string) => {
  if (!ticker || !signal) return 'Initializing...';

  const rsi = ticker.rsi ?? 50;
  const macroRsi = ticker.macroRsi ?? 50;
  const netVolumeDelta = ticker.netVolumeDelta ?? 0;

  if (signal.type === 'WATCHING') {
    const trend = ticker.macroTrend || 'NEUTRAL';
    return `🔍 GENERAL'S WAIT (${timeframe}).
• Macro Trend: ${trend} (SMA20).
• Micro RSI: ${rsi.toFixed(1)} | Macro RSI: ${macroRsi.toFixed(1)}.
• Order Flow: ${(netVolumeDelta / 1000).toFixed(0)}k net delta.

STRATEGY: Patience. Wait for trend alignment.`;
  }

  const intensity = Math.abs(netVolumeDelta) > 500000 ? 'Massive' : 'Significant';
  const deltaString = `${(Math.abs(netVolumeDelta) / 1000).toFixed(0)}k`;
  const plan = signal.plan;

  if (!plan) {
    return '⏳ Loading price data...';
  }

  if (signal.type === 'BUY' && plan) {
    const setup = ticker.macroTrend === 'BULLISH' ? 'Trend Follow' : 'Counter-Trend';
    return `⚔️ AMBUSH SIGNAL (Long).
• Setup: ${setup}.
• Flow: ${intensity} Inflow ($${deltaString}).
• Execution: Strike at ${formatPrice(plan.entry)}.`;
  } else if (plan) {
    const setup = ticker.macroTrend === 'BEARISH' ? 'Trend Follow' : 'Counter-Trend';
    return `🏹 TACTICAL SHORT.
• Setup: ${setup} Rejection.
• Flow: ${intensity} Outflow (-$${deltaString}).
• Execution: Short at ${formatPrice(plan.entry)}.`;
  }
  return 'Analyzing...';
};
