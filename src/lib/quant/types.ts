/**
 * Quantitative Trading Framework - Type Definitions
 *
 * Core interfaces for technical indicators, statistical features,
 * and machine learning models.
 */

// ============================================================================
// TECHNICAL INDICATOR TYPES
// ============================================================================

export interface MomentumIndicators {
  rsi: number; // Relative Strength Index (0-100)
  rsi14: number; // Standard 14-period RSI
  rsi7: number; // Short-term 7-period RSI
  macd: MACDResult; // MACD indicator
  stochRSI: StochasticResult; // Stochastic RSI
  williamsR: number; // Williams %R (-100 to 0)
  cci: number; // Commodity Channel Index
  mfi: number; // Money Flow Index
}

export interface MACDResult {
  value: number; // MACD line
  signal: number; // Signal line
  histogram: number; // MACD histogram
  bullish: boolean; // Bullish crossover
  bearish: boolean; // Bearish crossover
}

export interface StochasticResult {
  k: number; // %K line (0-100)
  d: number; // %D line (0-100)
  oversold: boolean; // K < 20
  overbought: boolean; // K > 80
}

export interface VolatilityIndicators {
  atr: number; // Average True Range
  atr14: number; // Standard 14-period ATR
  bollingerBands: BollingerBandsResult;
  keltnerChannels: KeltnerResult;
  historicalVolatility: number; // Annualized volatility
  normalizedATR: number; // ATR / Price ratio
}

export interface BollingerBandsResult {
  upper: number; // Upper band
  middle: number; // Middle band (SMA)
  lower: number; // Lower band
  bandwidth: number; // (upper - lower) / middle
  percentB: number; // (price - lower) / (upper - lower)
  squeeze: boolean; // Bandwidth < threshold
}

export interface KeltnerResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
}

export interface VolumeIndicators {
  mfi: number; // Money Flow Index
  obv: number; // On Balance Volume
  volumeDelta: number; // Buy volume - Sell volume
  vwap: number; // Volume Weighted Average Price
  volumeMA: number; // Volume moving average
  relativeVolume: number; // Current volume / Average volume
}

export interface TrendIndicators {
  ema9: number; // 9-period EMA
  ema20: number; // 20-period EMA
  ema50: number; // 50-period EMA
  ema200: number; // 200-period EMA
  sma20: number; // 20-period SMA
  sma50: number; // 50-period SMA
  vwap: number; // Volume Weighted Average Price
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // Trend strength (0-1)
}

// ============================================================================
// STATISTICAL FEATURES
// ============================================================================

export interface StatisticalFeatures {
  zScore: number; // Z-score of current price
  percentileRank: number; // Percentile rank (0-100)
  mean: number; // Mean price
  variance: number; // Variance
  stdDev: number; // Standard deviation
  skewness: number; // Skewness
  kurtosis: number; // Kurtosis
  entropy: number; // Shannon entropy
  isStationary: boolean; // ADF test result
  isNormal: boolean; // Normality test result
}

export interface MarketRegime {
  type: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'CALM';
  confidence: number; // 0-1
  volatilityPercentile: number;
  trendStrength: number;
}

// ============================================================================
// COMBINED FEATURES
// ============================================================================

export interface TechnicalFeatures {
  momentum: MomentumIndicators;
  volatility: VolatilityIndicators;
  volume: VolumeIndicators;
  trend: TrendIndicators;
  statistical: StatisticalFeatures;
  regime: MarketRegime;
  timestamp: number;
}

// ============================================================================
// OHLCV DATA
// ============================================================================

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Candle extends OHLCV {
  symbol: string;
  timeframe: Timeframe;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

// ============================================================================
// ML PREDICTION TYPES
// ============================================================================

export interface SignalPrediction {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  probability: number; // 0-1
  confidence: number; // 0-1
  expectedReturn: number; // Expected return %
  riskScore: number; // Risk score (0-1)
  featureImportance: Record<string, number>;
}

export interface ModelPrediction {
  modelName: string;
  prediction: 'BUY' | 'SELL' | 'HOLD';
  probability: number;
  confidence: number;
}

// ============================================================================
// RISK MANAGEMENT TYPES
// ============================================================================

export interface RiskMetrics {
  var95: number; // 95% Value at Risk
  var99: number; // 99% Value at Risk
  expectedShortfall: number; // CVaR
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
}

export interface PositionSizing {
  size: number; // Position size in base currency
  leverage: number; // Leverage multiplier
  stopLoss: number; // Stop loss price
  takeProfit: number; // Take profit price
  riskAmount: number; // Risk amount in USD
  riskPercent: number; // Risk as % of portfolio
}

// ============================================================================
// PORTFOLIO OPTIMIZATION
// ============================================================================

export interface PortfolioWeights {
  weights: Record<string, number>; // Asset -> weight
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  diversificationScore: number;
}

// ============================================================================
// EXECUTION TYPES
// ============================================================================

export interface ExecutionOrder {
  symbol: string;
  side: 'BUY' | 'SELL';
  size: number;
  orderType: 'MARKET' | 'LIMIT' | 'TWAP' | 'VWAP';
  limitPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  reduceOnly?: boolean;
}

export interface ExecutionReport {
  orderId: string;
  status: 'FILLED' | 'PARTIALLY_FILLED' | 'REJECTED';
  filledQty: number;
  avgPrice: number;
  commission: number;
  slippage: number;
  marketImpact: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface QuantConfig {
  features: {
    momentum: {
      rsiPeriods: number[];
      macdFast: number;
      macdSlow: number;
      macdSignal: number;
    };
    volatility: {
      atrPeriod: number;
      bbPeriod: number;
      bbStdDev: number;
    };
    volume: {
      mfiPeriod: number;
      volumeMAPeriod: number;
    };
  };
  risk: {
    maxPositionSize: number;
    maxLeverage: number;
    maxDrawdown: number;
    varConfidence: number;
  };
}
