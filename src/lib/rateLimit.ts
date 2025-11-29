/**
 * Database-Backed Rate Limiter for Apex-OS
 * 
 * Uses Supabase (PostgreSQL) to store rate limit counters.
 * This ensures rate limits work across multiple serverless function instances (Stateless).
 */

import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS and ensure we can write to rate_limits table
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

// Default configurations
export const LIMITS = {
    AUTH_SENSITIVE: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 mins
    AUTH_GLOBAL: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
    API_STANDARD: { limit: 60, windowMs: 60 * 1000 }, // 60 requests per minute
};

/**
 * Check if the request is within the rate limit (Async)
 */
export async function checkRateLimit(key: string, config: RateLimitConfig = LIMITS.API_STANDARD): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number
}> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
        // 1. Clean up old records for this key (Lazy cleanup)
        // In a real prod env, use a separate cron job or pg_cron for cleanup

        // 2. Upsert Logic
        // We try to fetch the record first
        const { data: record, error } = await supabase
            .from('rate_limits')
            .select('*')
            .eq('key', key)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Rate Limit Fetch Error:', error);
            // Fail open (allow request) if DB is down, to prevent blocking legit users during outage
            return { success: true, limit: config.limit, remaining: 1, reset: now };
        }

        if (!record) {
            // New record
            await supabase.from('rate_limits').insert({
                key,
                count: 1,
                window_start: now
            });
            return {
                success: true,
                limit: config.limit,
                remaining: config.limit - 1,
                reset: now + config.windowMs
            };
        }

        // Check if window expired
        if (record.window_start < windowStart) {
            // Reset window
            await supabase
                .from('rate_limits')
                .update({ count: 1, window_start: now })
                .eq('key', key);

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
                reset: record.window_start + config.windowMs
            };
        }

        // Use atomic Postgres function - NO race condition
        const { data, error: rpcError } = await supabase.rpc('increment_rate_limit', {
            p_identifier: key,
            p_window_start: new Date(windowStart).toISOString(),
            p_window_seconds: Math.floor(config.windowMs / 1000)
        });

        if (rpcError) {
            console.error('[Rate Limit] Atomic increment failed:', rpcError);
            // Fail open (allow request) rather than fail closed on error
            return {
                success: true,
                limit: config.limit,
                remaining: config.limit - 1,
                reset: now + config.windowMs
            };
        }

        const result = Array.isArray(data) ? data[0] : data;

        if (result.is_blocked) {
            return {
                success: false,
                limit: config.limit,
                remaining: 0,
                reset: windowStart + config.windowMs
            };
        }

        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - (record.count + 1),
            reset: record.window_start + config.windowMs
        };

    } catch (err) {
        console.error('Rate Limit System Error:', err);
        return { success: true, limit: config.limit, remaining: 1, reset: now };
    }
}

