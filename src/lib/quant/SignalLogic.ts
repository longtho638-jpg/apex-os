/**
 * Quantitative Signal Logic
 * 
 * Enhanced signal generation using multi-indicator confirmation.
 * Replaces simple RSI-based logic with 30+ technical indicators.
 */

import type { TechnicalFeatures, OHLCV } from '@/lib/quant/types';
import type { MarketTicker } from '@/hooks/useMarketData';
import type { SignalType, TradePlan } from '@/components/dashboard/AlphaDashboard';

interface QuantSignalResult {
    type: SignalType;
    confidence: number;
    reasoning: string[];
}

/**
 * Generate enhanced signal using quantitative features
 * 
 * @param symbol - Trading pair symbol
 * @param ticker - Current market ticker data
 * @param quantFeatures - Calculated quantitative features (optional)
 * @param timeframe - Current timeframe
 * @param currentType - Current signal state for state persistence
 * @returns Enhanced signal with confidence score
 */
export function generateQuantSignal(
    symbol: string,
    ticker: MarketTicker | undefined,
    quantFeatures: TechnicalFeatures | null,
    timeframe: string,
    currentType: SignalType
): QuantSignalResult {
    // Fallback: Use simple logic if quant features not available
    if (!ticker || !quantFeatures) {
        return generateFallbackSignal(ticker, timeframe, currentType);
    }

    const {
        momentum,
        volatility,
        volume,
        trend,
        statistical,
        regime
    } = quantFeatures;

    // Evidence tracking for confidence scoring
    const bullishEvidence: string[] = [];
    const bearishEvidence: string[] = [];

    // ========================================================================
    // 1. MOMENTUM ANALYSIS (Weight: 30%)
    // ========================================================================

    // RSI (14-period)
    if (momentum.rsi14 < 30) {
        bullishEvidence.push('RSI oversold (<30)');
    } else if (momentum.rsi14 > 70) {
        bearishEvidence.push('RSI overbought (>70)');
    }

    // Stochastic RSI
    if (momentum.stochRSI.oversold && momentum.stochRSI.k < 20) {
        bullishEvidence.push('Stochastic RSI oversold');
    } else if (momentum.stochRSI.overbought && momentum.stochRSI.k > 80) {
        bearishEvidence.push('Stochastic RSI overbought');
    }

    // MACD
    if (momentum.macd.bullish || (momentum.macd.histogram > 0 && momentum.macd.value > momentum.macd.signal)) {
        bullishEvidence.push('MACD bullish crossover');
    } else if (momentum.macd.bearish || (momentum.macd.histogram < 0 && momentum.macd.value < momentum.macd.signal)) {
        bearishEvidence.push('MACD bearish crossover');
    }

    // MFI (Money Flow Index)
    if (momentum.mfi < 20) {
        bullishEvidence.push('MFI oversold (<20)');
    } else if (momentum.mfi > 80) {
        bearishEvidence.push('MFI overbought (>80)');
    }

    // ========================================================================
    // 2. TREND ANALYSIS (Weight: 25%)
    // ========================================================================

    if (trend.trend === 'BULLISH') {
        bullishEvidence.push('Strong bullish trend');
    } else if (trend.trend === 'BEARISH') {
        bearishEvidence.push('Strong bearish trend');
    }

    // EMA alignment
    const price = ticker.price;
    if (price > trend.ema20 && trend.ema20 > trend.ema50) {
        bullishEvidence.push('EMA alignment bullish');
    } else if (price < trend.ema20 && trend.ema20 < trend.ema50) {
        bearishEvidence.push('EMA alignment bearish');
    }

    // ========================================================================
    // 3. VOLATILITY ANALYSIS (Weight: 15%)
    // ========================================================================

    // Bollinger Bands
    if (volatility.bollingerBands.percentB < 0.2) {
        bullishEvidence.push('Price at lower BB (<20%)');
    } else if (volatility.bollingerBands.percentB > 0.8) {
        bearishEvidence.push('Price at upper BB (>80%)');
    }

    // Avoid trading in extreme volatility
    const isExtremeVolatility = regime.type === 'VOLATILE' || volatility.bollingerBands.bandwidth > 0.08;

    // ========================================================================
    // 4. VOLUME ANALYSIS (Weight: 15%)
    // ========================================================================

    const hasVolumeSupport = volume.relativeVolume > 1.2; // 20% above average
    if (hasVolumeSupport) {
        bullishEvidence.push('Volume 20%+ above average');
        bearishEvidence.push('Volume 20%+ above average'); // Volume confirms both directions
    }

    // Volume Delta
    if (volume.volumeDelta > 0) {
        bullishEvidence.push('Positive volume delta');
    } else if (volume.volumeDelta < 0) {
        bearishEvidence.push('Negative volume delta');
    }

    // ========================================================================
    // 5. STATISTICAL ANALYSIS (Weight: 15%)
    // ========================================================================

    // Z-Score detection
    if (statistical.zScore < -1.5) {
        bullishEvidence.push(`Price -${Math.abs(statistical.zScore).toFixed(1)}σ below mean`);
    } else if (statistical.zScore > 1.5) {
        bearishEvidence.push(`Price +${statistical.zScore.toFixed(1)}σ above mean`);
    }

    // Percentile rank
    if (statistical.percentileRank < 10) {
        bullishEvidence.push('Price in bottom 10% of range');
    } else if (statistical.percentileRank > 90) {
        bearishEvidence.push('Price in top 10% of range');
    }

    // ========================================================================
    // 6. GEMINI 3.0 PRO AGENT LAYER (Weight: 20%)
    // ========================================================================
    if (ticker.aiSentiment) {
        if (ticker.aiSentiment === 'EXTREME_FEAR' || ticker.aiSentiment === 'FEAR') {
            bullishEvidence.push(`Agent Sentiment: ${ticker.aiSentiment}`);
        } else if (ticker.aiSentiment === 'EXTREME_GREED' || ticker.aiSentiment === 'GREED') {
            bearishEvidence.push(`Agent Sentiment: ${ticker.aiSentiment}`);
        }
    }

    // ========================================================================
    // DECISION LOGIC
    // ========================================================================

    const bullishScore = bullishEvidence.length;
    const bearishScore = bearishEvidence.length;
    const totalEvidence = bullishScore + bearishScore;

    // Minimum evidence threshold
    const minEvidence = 4;

    // Timeframe-aware thresholds
    const isShortTimeframe = ['1m', '5m', '15m'].includes(timeframe);
    const requiredEdge = isShortTimeframe ? 2 : 3; // Lower threshold for short timeframes

    let newType: SignalType = currentType;

    if (isExtremeVolatility && currentType === 'WATCHING') {
        // Don't enter new positions in extreme volatility
        newType = 'WATCHING';
    } else if (bullishScore >= minEvidence && bullishScore >= bearishScore + requiredEdge) {
        newType = 'BUY';
    } else if (bearishScore >= minEvidence && bearishScore >= bullishScore + requiredEdge) {
        newType = 'SELL';
    } else if (currentType === 'BUY' && bearishScore > bullishScore + 2) {
        // Exit long position
        newType = 'WATCHING';
    } else if (currentType === 'SELL' && bullishScore > bearishScore + 2) {
        // Exit short position
        newType = 'WATCHING';
    } else if (totalEvidence < minEvidence) {
        newType = 'WATCHING';
    }

    // Calculate confidence (0-99)
    let confidence = 0;
    if (newType === 'BUY') {
        confidence = Math.min((bullishScore / 10) * 100, 99);
    } else if (newType === 'SELL') {
        confidence = Math.min((bearishScore / 10) * 100, 99);
    }

    return {
        type: newType,
        confidence,
        reasoning: newType === 'BUY' ? bullishEvidence : bearishEvidence
    };
}

/**
 * Fallback signal generation using simple logic
 * Used when quantitative features are not available
 */
function generateFallbackSignal(
    ticker: MarketTicker | undefined,
    timeframe: string,
    currentType: SignalType
): QuantSignalResult {
    if (!ticker) {
        return {
            type: 'CONNECTING',
            confidence: 0,
            reasoning: ['No market data']
        };
    }

    const effectiveRsi = (ticker.rsi + (ticker.macroRsi || 50)) / 2;
    const isShortTimeframe = ['1m', '5m', '15m'].includes(timeframe);

    let newType = currentType === 'CONNECTING' ? 'WATCHING' : currentType;
    const reasoning: string[] = [];

    if (isShortTimeframe) {
        // AGGRESSIVE MODE
        if (effectiveRsi < 48) {
            newType = 'BUY';
            reasoning.push(`RSI ${effectiveRsi.toFixed(1)} < 48 (aggressive)`);
        } else if (effectiveRsi > 52) {
            newType = 'SELL';
            reasoning.push(`RSI ${effectiveRsi.toFixed(1)} > 52 (aggressive)`);
        } else if (currentType === 'BUY' && effectiveRsi > 52) {
            newType = 'WATCHING';
            reasoning.push('RSI exit');
        } else if (currentType === 'SELL' && effectiveRsi < 48) {
            newType = 'WATCHING';
            reasoning.push('RSI exit');
        }
    } else {
        // STRICT MODE
        const lowerBand = ticker.lowerBand || ticker.price * 0.98;
        const upperBand = ticker.upperBand || ticker.price * 1.02;

        if (effectiveRsi < 40 && ticker.price < lowerBand) {
            newType = 'BUY';
            reasoning.push(`RSI ${effectiveRsi.toFixed(1)} < 40`, 'Price < BB lower');
        } else if (effectiveRsi > 60 && ticker.price > upperBand) {
            newType = 'SELL';
            reasoning.push(`RSI ${effectiveRsi.toFixed(1)} > 60`, 'Price > BB upper');
        } else if (currentType === 'BUY' && effectiveRsi > 50) {
            newType = 'WATCHING';
            reasoning.push('RSI neutral');
        } else if (currentType === 'SELL' && effectiveRsi < 50) {
            newType = 'WATCHING';
            reasoning.push('RSI neutral');
        }
    }

    const confidence = Math.min(Math.abs(50 - effectiveRsi) * 2.5, 99);

    return {
        type: newType,
        confidence,
        reasoning
    };
}
