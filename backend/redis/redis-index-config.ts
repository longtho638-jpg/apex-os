/**
 * Redis index configuration: sorted sets, key patterns, TTL policies.
 */

// Key pattern constants
export const KEY_PATTERNS = {
  RATE_LIMIT: "rate_limit:*",
  PRICE: "price:*",
  SESSION: "session:*",
  ORDER_BOOK: "order_book:*",
  LEADERBOARD: "leaderboard:*",
  PRICE_HISTORY: "price_history:*",
} as const;

// TTL policies in seconds
export const TTL = {
  RATE_LIMIT: 60,
  SESSION: 3600,
  PRICE: 30,
  ORDER_BOOK: 10,
  LEADERBOARD: 300,
  PRICE_HISTORY: 86400, // 24h
} as const;

// Sorted set index definitions
export const SORTED_SET_INDEXES = [
  {
    name: "order_book:bids",
    description: "Buy orders sorted by price descending",
    scoreField: "price",
    pattern: KEY_PATTERNS.ORDER_BOOK,
  },
  {
    name: "order_book:asks",
    description: "Sell orders sorted by price ascending",
    scoreField: "price",
    pattern: KEY_PATTERNS.ORDER_BOOK,
  },
  {
    name: "leaderboard:pnl",
    description: "Traders ranked by realized PnL",
    scoreField: "pnl",
    pattern: KEY_PATTERNS.LEADERBOARD,
  },
  {
    name: "price_history:ohlcv",
    description: "OHLCV candles sorted by timestamp",
    scoreField: "timestamp",
    pattern: KEY_PATTERNS.PRICE_HISTORY,
  },
] as const;

/**
 * Ensures sorted set indexes exist (no-op for Redis — indexes are implicit).
 * Call at app startup to validate key conventions.
 */
export async function ensureIndexes(): Promise<void> {
  for (const idx of SORTED_SET_INDEXES) {
    // Redis sorted sets are created on first ZADD; log intent only
    console.info(`[redis] index ready: ${idx.name} (${idx.description})`);
  }
}

/**
 * Returns a concrete Redis key for a given pattern and id.
 * @example getRedisKeyPattern("order_book:*", "BTC-USDT") → "order_book:BTC-USDT"
 */
export function getRedisKeyPattern(pattern: string, id: string): string {
  return pattern.replace("*", id);
}
