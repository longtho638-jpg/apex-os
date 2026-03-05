// Technical Indicators Calculation Utilities

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA = SMA
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(...Array(period - 1).fill(NaN));
  result.push(ema);

  // Subsequent EMAs
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  result.push(NaN); // First value is NaN

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
) {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // MACD Line = Fast EMA - Slow EMA
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);

  // Signal Line = EMA of MACD Line
  const signalLine = calculateEMA(
    macdLine.filter((v) => !Number.isNaN(v)),
    signalPeriod,
  );

  // Histogram = MACD - Signal
  const histogram = macdLine.map((macd, i) => macd - (signalLine[i] || 0));

  return { macdLine, signalLine, histogram };
}

export function calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance = slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);

    upper.push(mean + std * stdDev);
    lower.push(mean - std * stdDev);
  }

  return { middle: sma, upper, lower };
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
  const result: number[] = [];
  const trueRanges: number[] = [];

  // Calculate True Range
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
    trueRanges.push(tr);
  }

  result.push(NaN); // First value is NaN

  // Calculate ATR
  for (let i = 0; i < trueRanges.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    const atr = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    result.push(atr);
  }

  return result;
}
