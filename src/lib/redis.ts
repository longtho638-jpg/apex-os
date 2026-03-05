import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Key prefix for namespacing all cache entries
export const CACHE_PREFIX = 'apex:';

// TTL policies (seconds)
export const TTL = {
  NONCE: 300, // 5 min — web3 auth nonces
  RATE_LIMIT: 60, // 1 min — rate limit windows
  SESSION: 3600, // 1 hour — session tokens
  MARKET_DATA: 30, // 30 sec — price/ticker data
  USER_PROFILE: 300, // 5 min — user profile cache
} as const;

const createRedisClient = () =>
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    commandTimeout: 3000,
    keyPrefix: CACHE_PREFIX,
    retryStrategy: (times) => {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 100, 3000);
    },
    reconnectOnError: (err) => {
      // Reconnect on READONLY (replica failover) or LOADING (restart)
      return err.message.includes('READONLY') || err.message.includes('LOADING');
    },
  });

// Prevent multiple instances in development (Next.js hot reload)
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
