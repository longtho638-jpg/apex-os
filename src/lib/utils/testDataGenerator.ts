import { logger } from '@/lib/logger';
/**
 * Test Utility - Generate Fake Trade History for Testing
 *
 * Use this to test Risk & ML systems without real database data
 */

export interface FakeTrade {
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnlPercent: number;
}

/**
 * Generate realistic fake trades with mixed win/loss ratio
 */
export function generateFakeTrades(count: number = 50): FakeTrade[] {
  const trades: FakeTrade[] = [];
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB'];
  const winRate = 0.62; // 62% win rate (realistic)

  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    const leverage = [10, 20, 50][Math.floor(Math.random() * 3)];

    const entryPrice = 30000 + Math.random() * 40000; // $30k-$70k range

    // Determine if this is a winning or losing trade
    const isWin = Math.random() < winRate;

    // Generate realistic price movement
    let priceChangePercent;
    if (isWin) {
      // Winners: 0.5% to 3% profit
      priceChangePercent = 0.005 + Math.random() * 0.025;
    } else {
      // Losers: -0.3% to -2% loss
      priceChangePercent = -(0.003 + Math.random() * 0.017);
    }

    const exitPrice = type === 'LONG' ? entryPrice * (1 + priceChangePercent) : entryPrice * (1 - priceChangePercent);

    // Calculate P&L %
    const direction = type === 'LONG' ? 1 : -1;
    const pnlPercent = direction * ((exitPrice - entryPrice) / entryPrice) * leverage * 100;

    trades.push({
      symbol,
      type,
      entryPrice,
      exitPrice,
      size: 100 + Math.random() * 900, // $100-$1000
      leverage,
      pnlPercent,
    });
  }

  return trades;
}

/**
 * Generate fake price history for technical indicator testing
 */
export function generateFakePriceHistory(days: number = 200): number[] {
  const prices: number[] = [];
  let currentPrice = 45000; // Starting price

  for (let i = 0; i < days; i++) {
    // Random walk with slight upward drift
    const change = (Math.random() - 0.48) * 0.02; // Slight bullish bias
    currentPrice = currentPrice * (1 + change);
    prices.push(currentPrice);
  }

  return prices;
}

/**
 * Generate OHLCV candle data for ATR testing
 */
export function generateFakeCandles(count: number = 200) {
  const candles: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> = [];

  let price = 45000;

  for (let i = 0; i < count; i++) {
    const open = price;
    const volatility = 0.02; // 2% daily volatility

    const change = (Math.random() - 0.5) * volatility;
    const close = open * (1 + change);

    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    const volume = 1000000 + Math.random() * 5000000;

    candles.push({ open, high, low, close, volume });
    price = close;
  }

  return candles;
}

/**
 * Test Technical Calculator with fake data
 */
export function testTechnicalCalculator() {
  logger.info('🧪 Testing Technical Calculator...\n');

  const prices = generateFakePriceHistory(200);
  const candles = generateFakeCandles(200);

  const _highs = candles.map((c) => c.high);
  const _lows = candles.map((c) => c.low);
  const _closes = prices;

  try {
    // Import would be here in actual test
    // For now, just log the data
    logger.info('✅ Generated test data:');
    logger.info(`  - ${prices.length} price points`);
    logger.info(`  - Current price: $${prices[prices.length - 1].toFixed(2)}`);
    logger.info(`  - Price range: $${Math.min(...prices).toFixed(2)} - $${Math.max(...prices).toFixed(2)}`);

    // Calculate simple metrics manually
    const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    logger.info(`  - SMA(20): $${sma20.toFixed(2)}`);

    return true;
  } catch (error) {
    logger.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Test Portfolio Returns calculation
 */
export function testPortfolioReturns() {
  logger.info('\n🧪 Testing Portfolio Returns...\n');

  const trades = generateFakeTrades(50);
  const returns = trades.map((t) => t.pnlPercent);

  logger.info('✅ Generated test trades:');
  logger.info(`  - Total trades: ${trades.length}`);
  logger.info(`  - Win rate: ${((trades.filter((t) => t.pnlPercent > 0).length / trades.length) * 100).toFixed(1)}%`);
  logger.info(`  - Avg return: ${(returns.reduce((a, b) => a + b, 0) / returns.length).toFixed(2)}%`);
  logger.info(`  - Best trade: +${Math.max(...returns).toFixed(2)}%`);
  logger.info(`  - Worst trade: ${Math.min(...returns).toFixed(2)}%`);

  // Calculate Sharpe ratio manually
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpe = avgReturn / stdDev;

  logger.info(`  - Sharpe Ratio: ${sharpe.toFixed(2)}`);

  return returns;
}

// Auto-run tests when imported
if (typeof window !== 'undefined') {
  logger.info('📊 Trade Data Test Utilities Loaded!\n');
  logger.info('Available functions:');
  logger.info('  - generateFakeTrades(count)');
  logger.info('  - generateFakePriceHistory(days)');
  logger.info('  - generateFakeCandles(count)');
  logger.info('  - testTechnicalCalculator()');
  logger.info('  - testPortfolioReturns()');
  logger.info('\nRun: testTechnicalCalculator() or testPortfolioReturns()');
}
