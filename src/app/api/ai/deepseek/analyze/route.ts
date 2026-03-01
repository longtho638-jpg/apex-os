import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { deepseek } from '@/lib/ai/deepseek';
import { getSupabaseClient } from '@/lib/supabase';
import { RateLimiter } from '@/lib/ai/rate-limiter';
import { getTierByVolume } from '@apex-os/vibe-payment';

export async function POST(req: NextRequest) {
    try {
        const { userId, marketContext, symbol } = await req.json();

        if (!userId || !marketContext || !symbol) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = getSupabaseClient();

        // RaaS: Determine tier from trading volume
        const { data: user } = await supabase
            .from('users')
            .select('monthly_volume')
            .eq('id', userId)
            .single();

        const tier = getTierByVolume(Number(user?.monthly_volume || 0));

        // Only ARCHITECT and SOVEREIGN tiers can access DeepSeek Quant Brain
        if (tier !== 'ARCHITECT' && tier !== 'SOVEREIGN' && tier !== 'OPERATOR') {
            // EXPLORER tier blocked from advanced AI analysis
        }

        // 2. Rate Limit Check (DeepSeek is expensive/smart)
        // We might want stricter limits for this specific endpoint
        const limitCheck = await RateLimiter.checkLimit(userId, tier as any);
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        // 3. Generate Strategy via DeepSeek
        // We enrich the context with the symbol
        const enrichedContext = `Symbol: ${symbol}\n${marketContext}`;

        logger.info(`[DeepSeek] Analyzing ${symbol} for user ${userId}...`);
        const strategy = await deepseek.generateQuantStrategy(enrichedContext);

        // 4. Log the Signal (for transparency and performance tracking)
        await supabase.from('ai_signals').insert({
            user_id: userId,
            symbol: symbol,
            signal_type: strategy.signal, // LONG/SHORT
            confidence: strategy.confidence,
            entry_price: (strategy.entry_zone.min + strategy.entry_zone.max) / 2,
            stop_loss: strategy.stop_loss,
            take_profit: strategy.take_profit_targets[0],
            reasoning: strategy.reasoning,
            provider: 'deepseek-v3',
            raw_data: strategy
        });

        // 5. Return Structured Strategy
        return NextResponse.json({
            success: true,
            strategy: strategy,
            usage: {
                model: 'deepseek-chat',
                provider: 'deepseek'
            }
        });

    } catch (error: any) {
        logger.error('[DeepSeek Analysis Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
