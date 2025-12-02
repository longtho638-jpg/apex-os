import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { CONFIG } from '../config';
import { UNIFIED_TIERS, getAILimit, TierId } from '../../src/config/unified-tiers';

export class AIService {
    private supabase: SupabaseClient;
    private redis: Redis;

    constructor() {
        this.supabase = createClient(CONFIG.SUPABASE.URL!, CONFIG.SUPABASE.KEY!);
        this.redis = new Redis(CONFIG.REDIS_URL!);
    }

    /**
     * Checks if a user can make an AI request based on their Tier.
     */
    async checkLimit(userId: string): Promise<{ allowed: boolean; limit: number; used: number; remaining: number }> {
        // 1. Get User Tier
        const { data: user } = await this.supabase
            .from('users')
            .select('tier')
            .eq('id', userId)
            .single();

        const tierId = (user?.tier || 'FREE') as TierId;
        const limit = getAILimit(tierId);

        if (limit === Infinity) {
            return { allowed: true, limit, used: 0, remaining: Infinity };
        }

        // 2. Get Usage from Redis (Expire daily)
        const key = `ai_usage:${userId}:${new Date().toISOString().split('T')[0]}`;
        const usedStr = await this.redis.get(key);
        const used = usedStr ? parseInt(usedStr) : 0;

        return {
            allowed: used < limit,
            limit,
            used,
            remaining: limit - used
        };
    }

    /**
     * Increments AI usage count. Call this AFTER a successful AI generation.
     */
    async incrementUsage(userId: string) {
        const key = `ai_usage:${userId}:${new Date().toISOString().split('T')[0]}`;
        await this.redis.incr(key);
        await this.redis.expire(key, 86400); // 24h TTL
    }

    /**
     * Mock AI Generation (DeepSeek / GPT-4)
     */
    async generateSignal(userId: string, symbol: string) {
        const check = await this.checkLimit(userId);
        if (!check.allowed) {
            throw new Error(`AI Limit Reached. Upgrade your tier to get more requests. (${check.used}/${check.limit})`);
        }

        // ... AI Logic would go here ...
        const signal = {
            symbol,
            action: Math.random() > 0.5 ? 'BUY' : 'SELL',
            confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
            reasoning: "DeepSeek analysis detects strong liquidity sweep at current levels."
        };

        await this.incrementUsage(userId);
        return signal;
    }
}
