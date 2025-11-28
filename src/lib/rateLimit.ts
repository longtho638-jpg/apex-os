/**
 * In-Memory Rate Limiter for Apex-OS
 * 
 * TODO: For production with multiple replicas (Vercel/AWS), migrate to Redis/Upstash.
 * Current implementation uses process-memory, which works for single-instance or sticky sessions.
 */

type RateLimitRecord = {
    count: number;
    startTime: number;
};

// Store limits in memory
const rateLimitStore = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

// Default configurations
export const LIMITS = {
    AUTH_SENSITIVE: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 mins (Login)
    AUTH_GLOBAL: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100 auth requests per hour
    API_STANDARD: { limit: 60, windowMs: 60 * 1000 }, // 60 requests per minute
};

/**
 * Check if the request is within the rate limit
 * @param key - Unique identifier (e.g., "ip:login", "user:123")
 * @param config - Rate limit configuration (limit and windowMs)
 */
export function checkRateLimit(key: string, config: RateLimitConfig = LIMITS.API_STANDARD): { 
    success: boolean; 
    limit: number; 
    remaining: number; 
    reset: number 
} {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Cleanup: Periodically clear very old entries (simple random cleanup)
    if (Math.random() < 0.01) { 
        cleanupStore();
    }

    // If no record, create one
    if (!record) {
        rateLimitStore.set(key, { count: 1, startTime: now });
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            reset: now + config.windowMs
        };
    }

    // If window has passed, reset
    if (now - record.startTime > config.windowMs) {
        rateLimitStore.set(key, { count: 1, startTime: now });
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            reset: now + config.windowMs
        };
    }

    // Check limit
    if (record.count >= config.limit) {
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            reset: record.startTime + config.windowMs
        };
    }

    // Increment
    record.count++;
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - record.count,
        reset: record.startTime + config.windowMs
    };
}

function cleanupStore() {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        // If entry is older than 1 hour (safeguard), remove it
        if (now - value.startTime > 3600000) {
            rateLimitStore.delete(key);
        }
    }
}
