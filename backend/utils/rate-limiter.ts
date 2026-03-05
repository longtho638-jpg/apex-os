import Redis from 'ioredis';
import { Logger } from './logger';
import { CONFIG } from '../config';

const logger = new Logger('RateLimiter');
const redis = new Redis(CONFIG.REDIS_URL);
// Prevent "Unhandled error event" in build/CI environments
redis.on('error', (err) => {
    // Only log strict error in production, otherwise just warn to keep build logs clean
    if (process.env.NODE_ENV === 'production') {
        logger.error('[RateLimiter] Redis connection error:', err);
    } else {
        // Suppress noisy logs during local dev/build if Redis is missing
        // console.warn('[RateLimiter] Redis connection error (handled):', err.message);
    }
});

// Define custom rate limit command to avoid using eval directly and ensure atomicity
redis.defineCommand('rateLimit', {
    numberOfKeys: 1,
    lua: `
        local current = redis.call("INCR", KEYS[1])
        if current == 1 then
            redis.call("EXPIRE", KEYS[1], ARGV[1])
        end
        return current
    `
});

// Add type definition for the custom command
declare module 'ioredis' {
    interface Redis {
        rateLimit(key: string, duration: number): Promise<number>;
    }
}

interface RateLimitConfig {
    points: number; // Number of actions
    duration: number; // Per seconds
}

export class RateLimiter {
    private prefix: string;

    constructor(prefix: string = 'rl') {
        this.prefix = prefix;
    }

    async consume(key: string, config: RateLimitConfig): Promise<boolean> {
        const redisKey = `${this.prefix}:${key}`;

        try {
            // Use custom defined command
            const result = await redis.rateLimit(redisKey, config.duration);
            const current = Number(result);

            if (current > config.points) {
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Rate limiter error', error);
            // Fail open to avoid blocking legit users on redis error
            return true;
        }
    }
}
