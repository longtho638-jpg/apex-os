'use client';

import { useMemo } from 'react';
import { MLPredictionPanel } from '@/components/dashboard/MLPredictionPanel';
import type { MarketTicker } from '@/hooks/useMarketData';
import { useMLPrediction } from '@/hooks/useMLPrediction';

// ML Prediction Panel Wrapper - handles feature calculation from live ticker data
export function MLPredictionPanelWrapper({ ticker }: { ticker: MarketTicker }) {
  const mockFeatures = useMemo(() => {
    if (!ticker) return null;

    return {
      momentum: {
        rsi: ticker.rsi || 50,
        rsi14: ticker.rsi || 50,
        rsi7: ticker.rsi || 50,
        macd: { value: 0, signal: 0, histogram: 0, bullish: ticker.rsi < 50, bearish: ticker.rsi > 50 },
        stochRSI: { k: ticker.rsi || 50, d: ticker.rsi || 50, oversold: ticker.rsi < 30, overbought: ticker.rsi > 70 },
        williamsR: -50,
        cci: 0,
        mfi: ticker.rsi || 50,
      },
      volatility: {
        atr: ticker.price * 0.02,
        atr14: ticker.price * 0.02,
        bollingerBands: {
          upper: ticker.upperBand || ticker.price * 1.02,
          middle: ticker.sma20 || ticker.price,
          lower: ticker.lowerBand || ticker.price * 0.98,
          bandwidth: 0.04,
          percentB:
            (ticker.price - (ticker.lowerBand || ticker.price * 0.98)) /
            ((ticker.upperBand || ticker.price * 1.02) - (ticker.lowerBand || ticker.price * 0.98)),
          squeeze: false,
        },
        keltnerChannels: {
          upper: ticker.price * 1.02,
          middle: ticker.price,
          lower: ticker.price * 0.98,
          bandwidth: 0.04,
        },
        historicalVolatility: 0.25,
        normalizedATR: 0.02,
      },
      volume: {
        mfi: ticker.rsi || 50,
        obv: 1000000,
        volumeDelta: ticker.netVolumeDelta || 0,
        vwap: ticker.price,
        volumeMA: ticker.volume || 1000,
        relativeVolume: 1.0,
      },
      trend: {
        ema9: ticker.price,
        ema20: ticker.sma20 || ticker.price,
        ema50: ticker.price * 0.98,
        ema200: ticker.price * 0.95,
        sma20: ticker.sma20 || ticker.price,
        sma50: ticker.price * 0.98,
        vwap: ticker.price,
        trend: ticker.macroTrend || 'NEUTRAL',
        strength: 0.5,
      },
      statistical: {
        zScore: 0,
        percentileRank: 50,
        mean: ticker.price,
        variance: 100,
        stdDev: 10,
        skewness: 0,
        kurtosis: 0,
        entropy: 0.5,
        isStationary: true,
        isNormal: true,
      },
      regime: {
        type: 'RANGING' as const,
        confidence: 0.5,
        volatilityPercentile: 50,
        trendStrength: 0.5,
      },
      timestamp: Date.now(),
    };
  }, [ticker]);

  const { prediction, featureImportance, loading } = useMLPrediction({
    features: mockFeatures,
    currentPrice: ticker?.price || 0,
    enabled: !!mockFeatures,
  });

  return <MLPredictionPanel prediction={prediction} featureImportance={featureImportance} loading={loading} />;
}
