import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { CONFIG } from '../config';

export class RiskService {
    private supabase: SupabaseClient;
    private redis: Redis;

    constructor() {
        this.supabase = createClient(CONFIG.SUPABASE.URL!, CONFIG.SUPABASE.KEY!);
        this.redis = new Redis(CONFIG.REDIS_URL!);
    }

    /**
     * Checks if the user is allowed to trade based on risk settings.
     */
    async checkCircuitBreaker(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const today = new Date().toISOString().split('T')[0];
        const pnlKey = `daily_pnl:${userId}:${today}`;

        // 1. Get Daily PnL
        const pnlStr = await this.redis.get(pnlKey);
        const dailyPnL = pnlStr ? parseFloat(pnlStr) : 0;

        // 2. Get User Risk Settings (Mocked or from DB)
        // In real app, fetch from 'user_settings' table
        const maxDrawdown = 1000; // Mock: $1000 daily loss limit

        if (dailyPnL < -maxDrawdown) {
            return {
                allowed: false,
                reason: `Circuit Breaker Triggered: Daily Loss ($${Math.abs(dailyPnL)}) exceeds limit ($${maxDrawdown}).`
            };
        }

        return { allowed: true };
    }

    /**
     * Updates the daily PnL for a user.
     */
    async updateDailyPnL(userId: string, pnl: number) {
        const today = new Date().toISOString().split('T')[0];
        const key = `daily_pnl:${userId}:${today}`;

        // Atomic increment (float support needed, so we use Lua or get/set)
        // Redis INCRBYFLOAT is supported
        await this.redis.incrbyfloat(key, pnl);
        await this.redis.expire(key, 86400); // 24h TTL
    }
}
