/**
 * Quantitative Feature Engine
 * 
 * Core engine for calculating technical indicators and statistical features.
 * Optimized for real-time calculation on streaming market data.
 */

import type {
    OHLCV,
    TechnicalFeatures,
    MomentumIndicators,
    VolatilityIndicators,
    VolumeIndicators,
    TrendIndicators,
    StatisticalFeatures,
    MarketRegime,
    MACDResult,
    StochasticResult,
    BollingerBandsResult,
    KeltnerResult
} from './types';

export class QuantFeatureEngine {
    /**
     * Calculate all technical features for a given price history
     */
    calculateFeatures(candles: OHLCV[]): TechnicalFeatures {
        if (candles.length < 200) {
            throw new Error('Insufficient data: require minimum 200 candles for feature calculation');
        }

        const closes = candles.map(c => c.close);
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        const volumes = candles.map(c => c.volume);

        return {
            momentum: this.calculateMomentumIndicators(closes, highs, lows, volumes),
            volatility: this.calculateVolatilityIndicators(candles),
            volume: this.calculateVolumeIndicators(candles),
            trend: this.calculateTrendIndicators(closes, volumes),
            statistical: this.calculateStatisticalFeatures(closes),
            regime: this.detectMarketRegime(closes, volumes),
            timestamp: Date.now()
        };
    }

    // ========================================================================
    // MOMENTUM INDICATORS
    // ========================================================================

    private calculateMomentumIndicators(
        closes: number[],
        highs: number[],
        lows: number[],
        volumes: number[]
    ): MomentumIndicators {
        return {
            rsi: this.calculateRSI(closes, 14),
            rsi14: this.calculateRSI(closes, 14),
            rsi7: this.calculateRSI(closes, 7),
            macd: this.calculateMACD(closes),
            stochRSI: this.calculateStochasticRSI(closes, 14),
            williamsR: this.calculateWilliamsR(highs, lows, closes, 14),
            cci: this.calculateCCI(highs, lows, closes, 20),
            mfi: this.calculateMFI(highs, lows, closes, volumes, 14)
        };
    }

    /**
     * Calculate RSI (Relative Strength Index)
     */
    calculateRSI(prices: number[], period: number = 14): number {
        if (prices.length < period + 1) return 50;

        const gains: number[] = [];
        const losses: number[] = [];

        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        // Calculate average gain and loss
        const avgGain = this.sma(gains.slice(-period), period);
        const avgLoss = this.sma(losses.slice(-period), period);

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     */
    calculateMACD(prices: number[], fast = 12, slow = 26, signal = 9): MACDResult {
        const emaFast = this.ema(prices, fast);
        const emaSlow = this.ema(prices, slow);
        const macdLine = emaFast[emaFast.length - 1] - emaSlow[emaSlow.length - 1];

        // Calculate signal line (EMA of MACD)
        const macdHistory = emaFast.map((f, i) => f - emaSlow[i]);
        const signalLine = this.ema(macdHistory, signal);
        const signalValue = signalLine[signalLine.length - 1];

        const histogram = macdLine - signalValue;

        // Detect crossovers
        const prevMACD = emaFast[emaFast.length - 2] - emaSlow[emaSlow.length - 2];
        const prevSignal = signalLine[signalLine.length - 2];

        return {
            value: macdLine,
            signal: signalValue,
            histogram,
            bullish: prevMACD <= prevSignal && macdLine > signalValue,
            bearish: prevMACD >= prevSignal && macdLine < signalValue
        };
    }

    /**
     * Calculate Stochastic RSI
     */
    calculateStochasticRSI(prices: number[], period: number = 14): StochasticResult {
        // Calculate RSI series
        const rsiSeries: number[] = [];
        for (let i = period; i < prices.length; i++) {
            rsiSeries.push(this.calculateRSI(prices.slice(0, i + 1), period));
        }

        if (rsiSeries.length < 14) {
            return { k: 50, d: 50, oversold: false, overbought: false };
        }

        // Calculate Stochastic of RSI
        const recentRSI = rsiSeries.slice(-14);
        const maxRSI = Math.max(...recentRSI);
        const minRSI = Math.min(...recentRSI);
        const currentRSI = rsiSeries[rsiSeries.length - 1];

        const k = maxRSI === minRSI ? 50 : ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100;

        // %D is 3-period SMA of %K
        const kSeries = [];
        for (let i = Math.max(0, rsiSeries.length - 10); i < rsiSeries.length; i++) {
            const slice = rsiSeries.slice(Math.max(0, i - 13), i + 1);
            const maxRSI = Math.max(...slice);
            const minRSI = Math.min(...slice);
            kSeries.push(maxRSI === minRSI ? 50 : ((rsiSeries[i] - minRSI) / (maxRSI - minRSI)) * 100);
        }
        const d = this.sma(kSeries, Math.min(3, kSeries.length));

        return {
            k,
            d,
            oversold: k < 20,
            overbought: k > 80
        };
    }

    /**
     * Calculate Williams %R
     */
    calculateWilliamsR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
        if (highs.length < period) return -50;

        const recentHighs = highs.slice(-period);
        const recentLows = lows.slice(-period);
        const currentClose = closes[closes.length - 1];

        const highestHigh = Math.max(...recentHighs);
        const lowestLow = Math.min(...recentLows);

        if (highestHigh === lowestLow) return -50;

        return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
    }

    /**
     * Calculate CCI (Commodity Channel Index)
     */
    calculateCCI(highs: number[], lows: number[], closes: number[], period: number = 20): number {
        if (closes.length < period) return 0;

        // Typical Price = (High + Low + Close) / 3
        const typicalPrices = closes.map((c, i) => (highs[i] + lows[i] + c) / 3);

        const recentTP = typicalPrices.slice(-period);
        const smaTP = this.sma(recentTP, period);
        const currentTP = typicalPrices[typicalPrices.length - 1];

        // Mean Deviation
        const meanDeviation = recentTP.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / period;

        if (meanDeviation === 0) return 0;

        return (currentTP - smaTP) / (0.015 * meanDeviation);
    }

    /**
     * Calculate MFI (Money Flow Index)
     */
    calculateMFI(
        highs: number[],
        lows: number[],
        closes: number[],
        volumes: number[],
        period: number = 14
    ): number {
        if (closes.length < period + 1) return 50;

        // Typical Price
        const typicalPrices = closes.map((c, i) => (highs[i] + lows[i] + c) / 3);

        // Money Flow
        const moneyFlow = typicalPrices.map((tp, i) => tp * volumes[i]);

        // Positive and Negative Money Flow
        let positiveFlow = 0;
        let negativeFlow = 0;

        for (let i = Math.max(1, closes.length - period); i < closes.length; i++) {
            if (typicalPrices[i] > typicalPrices[i - 1]) {
                positiveFlow += moneyFlow[i];
            } else if (typicalPrices[i] < typicalPrices[i - 1]) {
                negativeFlow += moneyFlow[i];
            }
        }

        if (negativeFlow === 0) return 100;

        const moneyFlowRatio = positiveFlow / negativeFlow;
        return 100 - (100 / (1 + moneyFlowRatio));
    }

    // ========================================================================
    // VOLATILITY INDICATORS
    // ========================================================================

    private calculateVolatilityIndicators(candles: OHLCV[]): VolatilityIndicators {
        const closes = candles.map(c => c.close);
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);

        const atr14 = this.calculateATR(candles, 14);
        const currentPrice = closes[closes.length - 1];

        return {
            atr: atr14,
            atr14,
            bollingerBands: this.calculateBollingerBands(closes, 20, 2),
            keltnerChannels: this.calculateKeltnerChannels(candles, 20, 1.5),
            historicalVolatility: this.calculateHistoricalVolatility(closes, 20),
            normalizedATR: atr14 / currentPrice
        };
    }

    /**
     * Calculate ATR (Average True Range)
     */
    calculateATR(candles: OHLCV[], period: number = 14): number {
        if (candles.length < period + 1) return 0;

        const trueRanges: number[] = [];

        for (let i = 1; i < candles.length; i++) {
            const high = candles[i].high;
            const low = candles[i].low;
            const prevClose = candles[i - 1].close;

            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRanges.push(tr);
        }

        return this.sma(trueRanges.slice(-period), period);
    }

    /**
     * Calculate Bollinger Bands
     */
    calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): BollingerBandsResult {
        if (prices.length < period) {
            const price = prices[prices.length - 1];
            return {
                upper: price * 1.02,
                middle: price,
                lower: price * 0.98,
                bandwidth: 0.04,
                percentB: 0.5,
                squeeze: false
            };
        }

        const recentPrices = prices.slice(-period);
        const middle = this.sma(recentPrices, period);
        const std = this.standardDeviation(recentPrices);

        const upper = middle + (stdDev * std);
        const lower = middle - (stdDev * std);
        const currentPrice = prices[prices.length - 1];

        const bandwidth = (upper - lower) / middle;
        const percentB = upper === lower ? 0.5 : (currentPrice - lower) / (upper - lower);

        return {
            upper,
            middle,
            lower,
            bandwidth,
            percentB,
            squeeze: bandwidth < 0.02
        };
    }

    /**
     * Calculate Keltner Channels
     */
    calculateKeltnerChannels(candles: OHLCV[], period: number = 20, multiplier: number = 1.5): KeltnerResult {
        if (candles.length < period) {
            const price = candles[candles.length - 1].close;
            return {
                upper: price * 1.015,
                middle: price,
                lower: price * 0.985,
                bandwidth: 0.03
            };
        }

        const closes = candles.map(c => c.close);
        const middle = this.ema(closes, period)[closes.length - 1];
        const atr = this.calculateATR(candles, period);

        const upper = middle + (multiplier * atr);
        const lower = middle - (multiplier * atr);

        return {
            upper,
            middle,
            lower,
            bandwidth: (upper - lower) / middle
        };
    }

    /**
     * Calculate Historical Volatility (annualized)
     */
    calculateHistoricalVolatility(prices: number[], period: number = 20): number {
        if (prices.length < period + 1) return 0;

        // Calculate log returns
        const returns: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push(Math.log(prices[i] / prices[i - 1]));
        }

        const recentReturns = returns.slice(-period);
        const std = this.standardDeviation(recentReturns);

        // Annualize (assuming 365 days * 24 hours = 8760 periods for hourly data)
        // Adjust based on your timeframe
        return std * Math.sqrt(252); // For daily data
    }

    // ========================================================================
    // VOLUME INDICATORS
    // ========================================================================

    private calculateVolumeIndicators(candles: OHLCV[]): VolumeIndicators {
        const closes = candles.map(c => c.close);
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        const volumes = candles.map(c => c.volume);

        return {
            mfi: this.calculateMFI(highs, lows, closes, volumes, 14),
            obv: this.calculateOBV(closes, volumes),
            volumeDelta: this.calculateVolumeDelta(candles.slice(-20)),
            vwap: this.calculateVWAP(candles.slice(-20)),
            volumeMA: this.sma(volumes.slice(-20), 20),
            relativeVolume: volumes[volumes.length - 1] / this.sma(volumes.slice(-20), 20)
        };
    }

    /**
     * Calculate OBV (On Balance Volume)
     */
    calculateOBV(closes: number[], volumes: number[]): number {
        let obv = 0;

        for (let i = 1; i < closes.length; i++) {
            if (closes[i] > closes[i - 1]) {
                obv += volumes[i];
            } else if (closes[i] < closes[i - 1]) {
                obv -= volumes[i];
            }
        }

        return obv;
    }

    /**
     * Calculate Volume Delta (simplified)
     */
    calculateVolumeDelta(candles: OHLCV[]): number {
        let buyVolume = 0;
        let sellVolume = 0;

        for (const candle of candles) {
            if (candle.close > candle.open) {
                buyVolume += candle.volume;
            } else {
                sellVolume += candle.volume;
            }
        }

        return buyVolume - sellVolume;
    }

    /**
     * Calculate VWAP (Volume Weighted Average Price)
     */
    calculateVWAP(candles: OHLCV[]): number {
        let totalPV = 0;
        let totalVolume = 0;

        for (const candle of candles) {
            const typicalPrice = (candle.high + candle.low + candle.close) / 3;
            totalPV += typicalPrice * candle.volume;
            totalVolume += candle.volume;
        }

        return totalVolume === 0 ? candles[candles.length - 1].close : totalPV / totalVolume;
    }

    // ========================================================================
    // TREND INDICATORS
    // ========================================================================

    private calculateTrendIndicators(closes: number[], volumes: number[]): TrendIndicators {
        const ema9Arr = this.ema(closes, 9);
        const ema20Arr = this.ema(closes, 20);
        const ema50Arr = this.ema(closes, 50);
        const ema200Arr = this.ema(closes, 200);

        const ema9 = ema9Arr[ema9Arr.length - 1];
        const ema20 = ema20Arr[ema20Arr.length - 1];
        const ema50 = ema50Arr[ema50Arr.length - 1];
        const ema200 = ema200Arr[ema200Arr.length - 1];

        // Determine trend
        let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (ema9 > ema20 && ema20 > ema50) {
            trend = 'BULLISH';
        } else if (ema9 < ema20 && ema20 < ema50) {
            trend = 'BEARISH';
        }

        // Trend strength
        const currentPrice = closes[closes.length - 1];
        const strength = Math.abs(currentPrice - ema20) / ema20;

        return {
            ema9,
            ema20,
            ema50,
            ema200,
            sma20: this.sma(closes.slice(-20), 20),
            sma50: this.sma(closes.slice(-50), 50),
            vwap: this.calculateVWAP(closes.map((c, i) => ({
                timestamp: i,
                open: c,
                high: c,
                low: c,
                close: c,
                volume: volumes[i] || 0
            }))),
            trend,
            strength: Math.min(strength * 10, 1)
        };
    }

    // ========================================================================
    // STATISTICAL FEATURES
    // ========================================================================

    private calculateStatisticalFeatures(prices: number[]): StatisticalFeatures {
        const recentPrices = prices.slice(-100);
        const currentPrice = prices[prices.length - 1];

        const mean = this.mean(recentPrices);
        const variance = this.variance(recentPrices);
        const stdDev = Math.sqrt(variance);

        return {
            zScore: stdDev === 0 ? 0 : (currentPrice - mean) / stdDev,
            percentileRank: this.percentileRank(recentPrices, currentPrice),
            mean,
            variance,
            stdDev,
            skewness: this.skewness(recentPrices),
            kurtosis: this.kurtosis(recentPrices),
            entropy: this.entropy(recentPrices),
            isStationary: Math.abs(this.mean(recentPrices.slice(0, 50)) - this.mean(recentPrices.slice(-50))) < stdDev,
            isNormal: true // Simplified
        };
    }

    private detectMarketRegime(closes: number[], volumes: number[]): MarketRegime {
        const volatility = this.calculateHistoricalVolatility(closes, 20);
        const recentVolatilities = [];

        for (let i = Math.max(20, closes.length - 100); i < closes.length - 20; i++) {
            recentVolatilities.push(this.calculateHistoricalVolatility(closes.slice(0, i + 1), 20));
        }

        const volPercentile = this.percentileRank(recentVolatilities, volatility);

        // Trend strength
        const ema20 = this.ema(closes, 20);
        const sma20 = this.sma(closes.slice(-20), 20);
        const trendStrength = Math.abs(ema20[ema20.length - 1] - sma20) / sma20;

        let type: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'CALM' = 'RANGING';

        if (volPercentile > 80) {
            type = 'VOLATILE';
        } else if (volPercentile < 20) {
            type = 'CALM';
        } else if (trendStrength > 0.02) {
            type = 'TRENDING';
        }

        return {
            type,
            confidence: 0.7,
            volatilityPercentile: volPercentile,
            trendStrength
        };
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    private sma(values: number[], period: number): number {
        if (values.length < period) period = values.length;
        const slice = values.slice(-period);
        return slice.reduce((sum, val) => sum + val, 0) / period;
    }

    private ema(values: number[], period: number): number[] {
        const k = 2 / (period + 1);
        const emaArray: number[] = [values[0]];

        for (let i = 1; i < values.length; i++) {
            emaArray.push(values[i] * k + emaArray[i - 1] * (1 - k));
        }

        return emaArray;
    }

    private mean(values: number[]): number {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    private variance(values: number[]): number {
        const mean = this.mean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    private standardDeviation(values: number[]): number {
        return Math.sqrt(this.variance(values));
    }

    private skewness(values: number[]): number {
        const mean = this.mean(values);
        const std = this.standardDeviation(values);
        if (std === 0) return 0;

        const n = values.length;
        const m3 = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;

        return m3;
    }

    private kurtosis(values: number[]): number {
        const mean = this.mean(values);
        const std = this.standardDeviation(values);
        if (std === 0) return 0;

        const n = values.length;
        const m4 = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n;

        return m4 - 3; // Excess kurtosis
    }

    private entropy(values: number[]): number {
        // Simplified Shannon entropy
        const bins = 10;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binSize = (max - min) / bins;

        const counts = new Array(bins).fill(0);
        values.forEach(val => {
            const binIndex = Math.min(Math.floor((val - min) / binSize), bins - 1);
            counts[binIndex]++;
        });

        const probabilities = counts.map(count => count / values.length);

        return -probabilities.reduce((sum, p) => {
            if (p === 0) return sum;
            return sum + p * Math.log2(p);
        }, 0);
    }

    private percentileRank(values: number[], target: number): number {
        const sorted = [...values].sort((a, b) => a - b);
        const index = sorted.findIndex(val => val >= target);

        if (index === -1) return 100;
        if (index === 0) return 0;

        return (index / sorted.length) * 100;
    }
}

// Export singleton instance
export const quantEngine = new QuantFeatureEngine();
