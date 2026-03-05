// Simple Backtest Engine & Data
// In production, this would fetch from an API like Binance

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  equityCurve: number[]; // Array of equity values over time
  trades: { type: 'BUY' | 'SELL'; price: number; time: number; pnl?: number }[];
}

// Generate 100 candles (simulating ~4 days of hourly data)
export const generateMarketData = (): Candle[] => {
  let price = 95000;
  const candles: Candle[] = [];
  const now = Date.now();

  for (let i = 100; i > 0; i--) {
    const time = now - i * 3600 * 1000;
    const volatility = price * 0.005; // 0.5% volatility
    const change = (Math.random() - 0.5) * volatility;

    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 100;

    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  return candles;
};

// RSI Calculation
function calculateRSI(candles: Candle[], period: number): number[] {
  const rsiValues: number[] = [];
  let gains = 0;
  let losses = 0;

  // Initial average
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }

  // Pad the beginning
  return new Array(period + 1).fill(50).concat(rsiValues);
}

export function runBacktest(nodes: any[], _edges: any[], candles: Candle[]): BacktestResult {
  // 1. Parse Strategy (Simplified: Assume RSI strategy if RSI node exists)
  // In a real engine, we would traverse the graph.
  // Here we look for "RSI" node and "Logic" node to determine params.

  const rsiNode = nodes.find((n) => n.data.label === 'RSI');
  const logicNode = nodes.find((n) => n.data.label === 'Less Than'); // e.g. "< 30"

  // Default params
  const rsiPeriod = rsiNode?.data.params?.period || 14;
  const rsiThreshold = logicNode ? parseInt(logicNode.data.condition.replace(/[^0-9]/g, ''), 10) : 30;

  const rsiData = calculateRSI(candles, rsiPeriod);

  let position: 'NONE' | 'LONG' = 'NONE';
  let entryPrice = 0;
  let capital = 10000; // Start with $10k
  const equityCurve: number[] = [];
  const trades: any[] = [];
  let wins = 0;

  // 2. Simulation Loop
  for (let i = rsiPeriod; i < candles.length; i++) {
    const currentRSI = rsiData[i];
    const price = candles[i].close;

    // Entry Condition: RSI < Threshold (Oversold) -> BUY
    if (position === 'NONE' && currentRSI < rsiThreshold) {
      position = 'LONG';
      entryPrice = price;
      trades.push({ type: 'BUY', price, time: candles[i].time });
    }

    // Exit Condition: RSI > 70 (Overbought) or Stop Loss/Take Profit (Simplified: Exit at RSI > 60)
    else if (position === 'LONG' && currentRSI > 60) {
      position = 'NONE';
      const pnl = ((price - entryPrice) / entryPrice) * capital; // Simple PnL without fees
      capital += pnl;
      trades.push({ type: 'SELL', price, time: candles[i].time, pnl });
      if (pnl > 0) wins++;
    }

    equityCurve.push(capital);
  }

  const totalTrades = trades.filter((t) => t.type === 'SELL').length;

  return {
    totalTrades,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    totalPnL: capital - 10000,
    equityCurve,
    trades,
  };
}

export interface OptimizationResult {
  bestPeriod: number;
  bestThreshold: number;
  bestPnL: number;
  iterations: number;
}

// Brute-force Optimization (Genetic Algorithm Lite)
export function optimizeStrategy(candles: Candle[]): OptimizationResult {
  let bestPnL = -Infinity;
  let bestPeriod = 14;
  let bestThreshold = 30;
  let iterations = 0;

  // Grid Search: Period [10..20], Threshold [20..45]
  for (let p = 10; p <= 25; p++) {
    for (let t = 20; t <= 45; t += 5) {
      iterations++;
      // Mock nodes for this iteration
      const mockNodes = [
        { data: { label: 'RSI', params: { period: p } } },
        { data: { label: 'Less Than', condition: `< ${t}` } },
      ];

      const result = runBacktest(mockNodes, [], candles);

      if (result.totalPnL > bestPnL) {
        bestPnL = result.totalPnL;
        bestPeriod = p;
        bestThreshold = t;
      }
    }
  }

  return { bestPeriod, bestThreshold, bestPnL, iterations };
}
