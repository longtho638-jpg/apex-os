import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { createSmartRouter } from '@/lib/ai/smart-router';
import { RateLimiter } from '@/lib/ai/rate-limiter';
// import { trackEvent } from '@/lib/analytics';

// Simple mock for trackEvent until analytics module is fully integrated or imported correctly
async function trackEvent(params: any) {
    // This would normally call the analytics service
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics Track]', params);
    }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json();

    if (!userId || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get user tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      // For development/testing without full user seeding, assume free tier if user not found
      // return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userTier = (user?.subscription_tier || 'free') as 'free' | 'pro' | 'trader' | 'elite';

    // Check rate limit
    const limitCheck = await RateLimiter.checkLimit(userId, userTier);

    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: limitCheck.limit,
        remaining: 0,
        upgradeRequired: true,
      }, { status: 429 });
    }

    // Create smart router
    const router = createSmartRouter({ userTier });

    // Get AI response
    const response = await router.complete(messages);

    // Increment usage
    await RateLimiter.incrementUsage(
        userId, 
        response.tokens, 
        response.cost,
        response.model,
        response.provider
    );

    // Track analytics
    await trackEvent({
      event_name: 'ai_request_completed',
      user_id: userId,
      metadata: {
        model: response.model,
        provider: response.provider,
        tokens: response.tokens,
        cost: response.cost,
        tier: userTier,
      },
    });

    // Return response with usage info
    const stats = await RateLimiter.getUsageStats(userId);

    return NextResponse.json({
      content: response.content,
      model: response.model,
      provider: response.provider,
      usage: {
        requests_today: stats.requests,
        limit: limitCheck.limit,
        remaining: limitCheck.remaining - 1,
      },
    });

  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json({
      error: 'AI request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
