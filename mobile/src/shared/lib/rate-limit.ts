import { redis } from './redis';
import { NextResponse } from 'next/server';

interface RateLimitConfig {
    limit: number;
    window: number; // in seconds
}

export async function rateLimit(
    identifier: string,
    config: RateLimitConfig = { limit: 10, window: 60 }
): Promise<{ success: boolean; remaining: number; reset: number }> {
    const key = `rate_limit:${identifier}`;

    try {
        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.expire(key, config.window);
        }

        const ttl = await redis.ttl(key);

        return {
            success: requests <= config.limit,
            remaining: Math.max(0, config.limit - requests),
            reset: Date.now() + (ttl * 1000),
        };
    } catch (error) {
        console.error('Rate limit error:', error);
        // Fail open if Redis is down
        return { success: true, remaining: 1, reset: Date.now() };
    }
}

export function rateLimitResponse(reset: number) {
    return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
    });
}
