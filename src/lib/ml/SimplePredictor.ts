/**
 * Simple ML Predictor (Lightweight)
 *
 * Browser-optimized ML prediction without heavy TensorFlow.js dependency.
 * Uses weighted voting based on quantitative features for fast inference.
 */

import type { TechnicalFeatures } from '@/lib/quant/types';
import type { FeatureImportance, MLPrediction, PredictionClass } from './types';

export class SimpleMLPredictor {
  private featureWeights: Record<string, number>;

  constructor() {
    // Pre-trained feature weights (can be updated)
    this.featureWeights = {
      // Momentum indicators (40% weight)
      rsi14: 0.15,
      macd_histogram: 0.12,
      stoch_rsi_k: 0.08,
      mfi: 0.05,

      // Trend indicators (30% weight)
      trend_strength: 0.12,
      ema_alignment: 0.1,
      price_vs_ema20: 0.08,

      // Volume indicators (20% weight)
      volume_delta: 0.1,
      relative_volume: 0.06,
      obv_trend: 0.04,

      // Volatility indicators (10% weight)
      bb_percent_b: 0.05,
      atr_normalized: 0.03,
      volatility_regime: 0.02,
    };
  }

  /**
   * Predict signal from quantitative features
   */
  async predict(features: TechnicalFeatures, _currentPrice: number): Promise<MLPrediction> {
    const startTime = Date.now();

    // Extract and score features
    const scores = this.scoreFeatures(features);

    // Calculate class probabilities
    const buyScore = scores.bullish;
    const sellScore = scores.bearish;
    const holdScore = 1 - Math.abs(buyScore - sellScore); // Neutral zone

    // Normalize to probabilities (sum = 1)
    const total = buyScore + sellScore + holdScore;
    const buyProb = buyScore / total;
    const sellProb = sellScore / total;
    const holdProb = holdScore / total;

    // Determine prediction
    const maxProb = Math.max(buyProb, sellProb, holdProb);
    let predictedClass: PredictionClass;

    if (maxProb === buyProb) predictedClass = 'BUY';
    else if (maxProb === sellProb) predictedClass = 'SELL';
    else predictedClass = 'HOLD';

    const _inferenceTime = Date.now() - startTime;

    return {
      buyProbability: buyProb,
      sellProbability: sellProb,
      holdProbability: holdProb,
      predictedClass,
      confidence: maxProb,
      modelId: 'simple_ml_v1',
      timestamp: Date.now(),
      features: this.extractFeatureVector(features),
      featureNames: Object.keys(this.featureWeights),
    };
  }

  /**
   * Score features for bullish/bearish signals
   */
  private scoreFeatures(features: TechnicalFeatures): { bullish: number; bearish: number } {
    let bullishScore = 0;
    let bearishScore = 0;

    const { momentum, trend, volume, volatility, statistical, regime } = features;

    // MOMENTUM SCORING
    // RSI
    if (momentum.rsi14 < 30) bullishScore += this.featureWeights.rsi14;
    else if (momentum.rsi14 > 70) bearishScore += this.featureWeights.rsi14;

    // MACD
    if (momentum.macd.bullish || momentum.macd.histogram > 0) {
      bullishScore += this.featureWeights.macd_histogram;
    } else if (momentum.macd.bearish || momentum.macd.histogram < 0) {
      bearishScore += this.featureWeights.macd_histogram;
    }

    // Stochastic RSI
    if (momentum.stochRSI.oversold && momentum.stochRSI.k < 20) {
      bullishScore += this.featureWeights.stoch_rsi_k;
    } else if (momentum.stochRSI.overbought && momentum.stochRSI.k > 80) {
      bearishScore += this.featureWeights.stoch_rsi_k;
    }

    // MFI
    if (momentum.mfi < 20) bullishScore += this.featureWeights.mfi;
    else if (momentum.mfi > 80) bearishScore += this.featureWeights.mfi;

    // TREND SCORING
    if (trend.trend === 'BULLISH') {
      bullishScore += this.featureWeights.trend_strength * trend.strength;
    } else if (trend.trend === 'BEARISH') {
      bearishScore += this.featureWeights.trend_strength * trend.strength;
    }

    // EMA alignment
    const emaAligned = this.checkEMAAlignment(trend);
    if (emaAligned === 'BULLISH') {
      bullishScore += this.featureWeights.ema_alignment;
    } else if (emaAligned === 'BEARISH') {
      bearishScore += this.featureWeights.ema_alignment;
    }

    // VOLUME SCORING
    if (volume.volumeDelta > 0) {
      bullishScore += this.featureWeights.volume_delta * Math.min(volume.volumeDelta / 1000000, 1);
    } else {
      bearishScore += this.featureWeights.volume_delta * Math.min(Math.abs(volume.volumeDelta) / 1000000, 1);
    }

    // Relative volume
    if (volume.relativeVolume > 1.5) {
      const boost = this.featureWeights.relative_volume;
      bullishScore += boost * 0.5;
      bearishScore += boost * 0.5; // Volume confirms both directions
    }

    // VOLATILITY SCORING
    if (volatility.bollingerBands.percentB < 0.2) {
      bullishScore += this.featureWeights.bb_percent_b;
    } else if (volatility.bollingerBands.percentB > 0.8) {
      bearishScore += this.featureWeights.bb_percent_b;
    }

    // STATISTICAL SCORING
    if (statistical.zScore < -1.5) {
      bullishScore += this.featureWeights.volatility_regime || 0.02;
    } else if (statistical.zScore > 1.5) {
      bearishScore += this.featureWeights.volatility_regime || 0.02;
    }

    // Normalize scores to 0-1 range
    const maxScore = Math.max(bullishScore, bearishScore, 0.5);
    bullishScore = bullishScore / maxScore;
    bearishScore = bearishScore / maxScore;

    return { bullish: bullishScore, bearish: bearishScore };
  }

  /**
   * Check EMA alignment
   */
  private checkEMAAlignment(trend: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const { ema9, ema20, ema50 } = trend;

    if (ema9 > ema20 && ema20 > ema50) return 'BULLISH';
    if (ema9 < ema20 && ema20 < ema50) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Extract feature vector for feature importance
   */
  private extractFeatureVector(features: TechnicalFeatures): number[] {
    const { momentum, trend, volume, volatility, statistical } = features;

    return [
      momentum.rsi14,
      momentum.macd.histogram,
      momentum.stochRSI.k,
      momentum.mfi,
      trend.strength,
      trend.ema9 > trend.ema20 ? 1 : 0,
      volume.volumeDelta / 1000000,
      volume.relativeVolume,
      volume.obv / 1000000,
      volatility.bollingerBands.percentB,
      volatility.atr / trend.ema20,
      statistical.zScore,
    ];
  }

  /**
   * Get feature importance for latest prediction
   */
  getFeatureImportance(_features: TechnicalFeatures): FeatureImportance[] {
    const importance: FeatureImportance[] = [];

    // Sort by weight
    const sorted = Object.entries(this.featureWeights).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([name, weight], index) => {
      importance.push({
        featureName: this.formatFeatureName(name),
        importance: weight,
        rank: index + 1,
      });
    });

    return importance;
  }

  /**
   * Get top N important features
   */
  getTopFeatures(n: number = 5, features: TechnicalFeatures): FeatureImportance[] {
    return this.getFeatureImportance(features).slice(0, n);
  }

  /**
   * Format feature name for display
   */
  private formatFeatureName(name: string): string {
    const names: Record<string, string> = {
      rsi14: 'RSI (14)',
      macd_histogram: 'MACD Histogram',
      stoch_rsi_k: 'Stochastic RSI',
      mfi: 'Money Flow Index',
      trend_strength: 'Trend Strength',
      ema_alignment: 'EMA Alignment',
      price_vs_ema20: 'Price vs EMA20',
      volume_delta: 'Volume Delta',
      relative_volume: 'Relative Volume',
      obv_trend: 'OBV Trend',
      bb_percent_b: 'Bollinger %B',
      atr_normalized: 'Normalized ATR',
      volatility_regime: 'Volatility Regime',
    };

    return names[name] || name;
  }
}

// Export singleton
export const mlPredictor = new SimpleMLPredictor();
