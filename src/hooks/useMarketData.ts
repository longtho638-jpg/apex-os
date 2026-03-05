import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

export interface MarketTicker {
  symbol: string;
  price: number; // Real-time price
  change24h: number;
  volume: number;
  history: number[];
  volumes: number[];

  // Indicators (Real-time)
  rsi: number;
  upperBand: number;
  lowerBand: number;
  sma20: number;

  // Macro Trend (From K-line API)
  macroTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  macroRsi: number;

  netVolumeDelta: number;
  whaleActivity: 'ACCUMULATING' | 'DUMPING' | 'NEUTRAL';

  // Gemini 3.0 Pro Data
  aiSentiment: 'EXTREME_GREED' | 'GREED' | 'NEUTRAL' | 'FEAR' | 'EXTREME_FEAR';
  confidenceScore: number;
}

const SYMBOLS = [
  'btcusdt',
  'ethusdt',
  'solusdt',
  'bnbusdt',
  'xrpusdt',
  'dogeusdt',
  'pepeusdt',
  'wifusdt',
  'suiusdt',
  'nearusdt',
  'aptusdt',
  'fetusdt',
];

import { TechnicalCalculator } from '@/lib/quant/TechnicalCalculator';

// Helper to fetch K-lines
async function fetchKLines(symbol: string, interval: string) {
  try {
    // Binance Interval Map
    const binanceInterval = interval === '1m' ? '1m' : interval === '1h' ? '1h' : interval === '4h' ? '4h' : '15m';
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${binanceInterval}&limit=50`,
    ); // Increased limit for better accuracy
    const data = await res.json();
    const closes = data.map((d: any) => parseFloat(d[4]));

    // Use Real Technical Calculator
    const rsi = TechnicalCalculator.calculateRSI(closes);
    const sma20 = TechnicalCalculator.calculateEMA(closes, 20); // Use EMA for trend as it's more responsive
    const current = closes[closes.length - 1];

    return {
      trend: current > sma20 ? 'BULLISH' : 'BEARISH',
      rsi,
    };
  } catch (_e) {
    return { trend: 'NEUTRAL', rsi: 50 };
  }
}

export function useMarketData(selectedTimeframe: string = '1h') {
  const [marketData, setMarketData] = useState<Record<string, MarketTicker>>({});
  const dataRef = useRef<Record<string, MarketTicker>>({});
  const binanceWsRef = useRef<WebSocket | null>(null);
  const _okxWsRef = useRef<WebSocket | null>(null);
  const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

  // 1. Fetch Macro Data when Timeframe changes
  useEffect(() => {
    const fetchMacro = async () => {
      for (const sym of SYMBOLS) {
        const macro = await fetchKLines(sym, selectedTimeframe);
        // Update ref directly to avoid re-renders
        const current = dataRef.current[sym] || {};
        dataRef.current[sym] = {
          ...current,
          // @ts-expect-error
          macroTrend: macro.trend,
          macroRsi: macro.rsi,
        };
      }
    };
    fetchMacro();
  }, [selectedTimeframe]);

  useEffect(() => {
    // WebSocket logic remains the same (Real-time layer)
    if (debugMode) logger.info('[Gemini Agent] Connecting to Binance Stream...');
    const binanceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${SYMBOLS.join('@aggTrade/')}`);
    binanceWsRef.current = binanceWs;

    binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s.toLowerCase();
      const price = parseFloat(data.p);
      const quantity = parseFloat(data.q);
      const isBuyerMaker = data.m;
      const volumeUSD = price * quantity;

      const current = dataRef.current[symbol] || {
        symbol,
        price,
        change24h: 0,
        volume: 0,
        history: Array(20).fill(price),
        volumes: Array(20).fill(quantity),
        rsi: 50,
        upperBand: price * 1.02,
        lowerBand: price * 0.98,
        sma20: price,
        netVolumeDelta: 0,
        whaleActivity: 'NEUTRAL',
        macroTrend: 'NEUTRAL',
        macroRsi: 50,
        aiSentiment: 'NEUTRAL',
        confidenceScore: 50,
      };

      // Real-time Logic
      const deltaChange = isBuyerMaker ? -volumeUSD : volumeUSD;
      const newDelta = current.netVolumeDelta * 0.99 + deltaChange;
      const newHistory = [...(current.history || []), price].slice(-50);

      // Micro RSI
      let rsi = current.rsi;
      if (newHistory.length > 14) {
        const changes = newHistory
          .slice(-15)
          .map((p, i, arr) => (i === 0 ? 0 : p - arr[i - 1]))
          .slice(1);
        const gains = changes.filter((c) => c > 0).reduce((a, b) => a + b, 0);
        const losses = Math.abs(changes.filter((c) => c < 0).reduce((a, b) => a + b, 0));
        rsi = 100 - 100 / (1 + gains / (losses || 1));
      }

      // Gemini 3.0 Pro Agent Logic (Simulated AI Sentiment)
      let sentiment: any = 'NEUTRAL';
      if (rsi > 75) sentiment = 'EXTREME_GREED';
      else if (rsi > 60) sentiment = 'GREED';
      else if (rsi < 25) sentiment = 'EXTREME_FEAR';
      else if (rsi < 40) sentiment = 'FEAR';

      const confidence = Math.min(Math.abs(rsi - 50) * 2, 95);

      dataRef.current[symbol] = {
        ...current,
        price,
        history: newHistory,
        rsi, // Micro RSI
        netVolumeDelta: newDelta,
        // Preserve Macro Data
        macroTrend: current.macroTrend || 'NEUTRAL',
        macroRsi: current.macroRsi || 50,
        // New Agent Data
        aiSentiment: sentiment,
        confidenceScore: confidence,
      };
    };

    // Throttle
    const interval = setInterval(() => {
      if (Object.keys(dataRef.current).length > 0) {
        setMarketData({ ...dataRef.current });
      }
    }, 1000);

    return () => {
      if (binanceWs.readyState === 1) binanceWs.close();
      clearInterval(interval);
    };
  }, [debugMode]);

  return marketData;
}
