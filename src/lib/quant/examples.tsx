/**
 * Example: Quantitative Feature Integration with AlphaDashboard
 *
 * This demonstrates how to integrate quantitative features into existing signal logic.
 */

import { useQuantFeatures } from '@/hooks/useQuantFeatures';
import type { TechnicalFeatures } from '@/lib/quant/types';

// ============================================================================
// EXAMPLE 1: Enhanced Signal Generation
// ============================================================================

function generateEnhancedSignal(
  _symbol: string,
  baseRSI: number,
  quantFeatures: TechnicalFeatures | null,
): 'BUY' | 'SELL' | 'WATCHING' {
  if (!quantFeatures) {
    // Fallback to simple logic if quant features not available
    if (baseRSI < 30) return 'BUY';
    if (baseRSI > 70) return 'SELL';
    return 'WATCHING';
  }

  // QUANTITATIVE APPROACH: Multi-indicator confirmation
  const { momentum, volatility, volume, trend, statistical, regime } = quantFeatures;

  // 1. RSI Confirmation (multiple timeframes)
  const rsi14 = momentum.rsi14;
  const stochRSI = momentum.stochRSI;

  // 2. Trend Confirmation
  const isBullishTrend = trend.trend === 'BULLISH';
  const isBearishTrend = trend.trend === 'BEARISH';

  //3. Volatility Check (avoid trading in extreme volatility)
  const isVolatilityNormal =
    regime.type !== 'VOLATILE' && volatility.bollingerBands.percentB > 0.1 && volatility.bollingerBands.percentB < 0.9;

  // 4. Volume Confirmation
  const hasVolumeSupport = volume.relativeVolume > 1.2; // Volume 20% above average

  // 5. MACD Confirmation
  const macdBullish = momentum.macd.bullish;
  const macdBearish = momentum.macd.bearish;

  // 6. Statistical Checks
  const zScore = statistical.zScore;

  // === BUY CONDITIONS ===
  if (
    rsi14 < 35 && // RSI oversold
    stochRSI.oversold && // Stochastic RSI confirms
    (isBullishTrend || trend.trend === 'NEUTRAL') && // Not in strong downtrend
    isVolatilityNormal && // Normal volatility
    hasVolumeSupport && // Volume confirmation
    zScore < -1.5 && // Price below 1.5 std dev
    (macdBullish || momentum.macd.histogram > 0) // MACD turning bullish
  ) {
    return 'BUY';
  }

  // === SELL CONDITIONS ===
  if (
    rsi14 > 65 && // RSI overbought
    stochRSI.overbought && // Stochastic RSI confirms
    (isBearishTrend || trend.trend === 'NEUTRAL') && // Not in strong uptrend
    isVolatilityNormal && // Normal volatility
    hasVolumeSupport && // Volume confirmation
    zScore > 1.5 && // Price above 1.5 std dev
    (macdBearish || momentum.macd.histogram < 0) // MACD turning bearish
  ) {
    return 'SELL';
  }

  return 'WATCHING';
}

// ============================================================================
// EXAMPLE 2: Signal Confidence Scoring
// ============================================================================

function calculateSignalConfidence(quantFeatures: TechnicalFeatures, signalType: 'BUY' | 'SELL'): number {
  let confidence = 0;
  const { momentum, volatility, volume, trend, statistical } = quantFeatures;

  if (signalType === 'BUY') {
    // RSI component (0-20 points)
    if (momentum.rsi14 < 30) confidence += 20;
    else if (momentum.rsi14 < 40) confidence += 10;

    // Trend component (0-20 points)
    if (trend.trend === 'BULLISH') confidence += 20;
    else if (trend.trend === 'NEUTRAL') confidence += 10;

    // Volume component (0-15 points)
    if (volume.relativeVolume > 1.5) confidence += 15;
    else if (volume.relativeVolume > 1.2) confidence += 10;

    // MACD component (0-15 points)
    if (momentum.macd.bullish) confidence += 15;
    else if (momentum.macd.histogram > 0) confidence += 8;

    // Volatility component (0-15 points) - prefer lower volatility for entry
    if (volatility.bollingerBands.bandwidth < 0.04) confidence += 15;
    else if (volatility.bollingerBands.bandwidth < 0.06) confidence += 8;

    // Statistical component (0-15 points)
    if (statistical.zScore < -2) confidence += 15;
    else if (statistical.zScore < -1) confidence += 8;
  } else if (signalType === 'SELL') {
    // Similar logic for SELL
    if (momentum.rsi14 > 70) confidence += 20;
    else if (momentum.rsi14 > 60) confidence += 10;

    if (trend.trend === 'BEARISH') confidence += 20;
    else if (trend.trend === 'NEUTRAL') confidence += 10;

    if (volume.relativeVolume > 1.5) confidence += 15;
    else if (volume.relativeVolume > 1.2) confidence += 10;

    if (momentum.macd.bearish) confidence += 15;
    else if (momentum.macd.histogram < 0) confidence += 8;

    if (volatility.bollingerBands.bandwidth < 0.04) confidence += 15;
    else if (volatility.bollingerBands.bandwidth < 0.06) confidence += 8;

    if (statistical.zScore > 2) confidence += 15;
    else if (statistical.zScore > 1) confidence += 8;
  }

  return Math.min(confidence, 99); // Cap at 99%
}

// ============================================================================
// EXAMPLE 3: React Component Integration
// ============================================================================

export function ExampleQuantDashboard({ symbol }: { symbol: string }) {
  const { features, loading, error } = useQuantFeatures({ symbol, timeframe: '1h' });

  if (loading) return <div>Loading quantitative features...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!features) return <div>No data available</div>;

  const signal = generateEnhancedSignal(symbol, features.momentum.rsi14, features);
  const confidence = signal !== 'WATCHING' ? calculateSignalConfidence(features, signal) : 0;

  return (
    <div className="p-4 bg-black/50 rounded-lg border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">Quantitative Analysis - {symbol}</h3>

      {/* Signal Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`
                        px-2 py-1 rounded text-xs font-bold
                        ${signal === 'BUY' ? 'bg-green-500/20 text-green-400' : ''}
                        ${signal === 'SELL' ? 'bg-red-500/20 text-red-400' : ''}
                        ${signal === 'WATCHING' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    `}
          >
            {signal}
          </span>
          {signal !== 'WATCHING' && <span className="text-xs text-zinc-400">Confidence: {confidence.toFixed(0)}%</span>}
        </div>
      </div>

      {/* Momentum Indicators */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-zinc-400 mb-1">Momentum</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">RSI(14):</span>{' '}
            <span className="text-white font-mono">{features.momentum.rsi14.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Stoch:</span>{' '}
            <span className="text-white font-mono">{features.momentum.stochRSI.k.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-zinc-500">MACD:</span>{' '}
            <span className={`font-mono ${features.momentum.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {features.momentum.macd.histogram.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Volatility */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-zinc-400 mb-1">Volatility</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">BB Width:</span>{' '}
            <span className="text-white font-mono">
              {(features.volatility.bollingerBands.bandwidth * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-zinc-500">ATR:</span>{' '}
            <span className="text-white font-mono">{features.volatility.atr14.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trend & Regime */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-zinc-400 mb-1">Trend & Regime</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">Trend:</span>{' '}
            <span
              className={`font-bold ${
                features.trend.trend === 'BULLISH'
                  ? 'text-green-400'
                  : features.trend.trend === 'BEARISH'
                    ? 'text-red-400'
                    : 'text-yellow-400'
              }`}
            >
              {features.trend.trend}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Regime:</span> <span className="text-white">{features.regime.type}</span>
          </div>
        </div>
      </div>

      {/* Statistical */}
      <div>
        <h4 className="text-xs font-bold text-zinc-400 mb-1">Statistical</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">Z-Score:</span>{' '}
            <span className="text-white font-mono">{features.statistical.zScore.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Percentile:</span>{' '}
            <span className="text-white font-mono">{features.statistical.percentileRank.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-zinc-500">Skew:</span>{' '}
            <span className="text-white font-mono">{features.statistical.skewness.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Export for AlphaDashboard Integration
// ============================================================================

export const QuantHelpers = {
  generateSignal: generateEnhancedSignal,
  calculateConfidence: calculateSignalConfidence,
};
