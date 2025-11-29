import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
    try {
        const { email, type } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Strict Rate Limiting (Cost DoS Prevention)

        // Check 60s Cooldown
        const COOLDOWN_KEY = `resend_cooldown:${email}`;
        const inCooldown = await redis.get(COOLDOWN_KEY);
        if (inCooldown) {
            return NextResponse.json({
                error: 'Please wait 60 seconds before requesting another email.'
            }, { status: 429 });
        }

        // Check Hourly Limit (Max 5)
        const HOURLY_LIMIT_KEY = `resend_limit:${email}`;
        const attempts = await redis.incr(HOURLY_LIMIT_KEY);

        // Set expiry on first attempt
        if (attempts === 1) {
            await redis.expire(HOURLY_LIMIT_KEY, 3600); // 1 hour
        }

        if (attempts > 5) {
            return NextResponse.json({
                error: 'Too many requests. Please try again later.'
            }, { status: 429 });
        }

        // Set Cooldown
        await redis.set(COOLDOWN_KEY, '1', 'EX', 60);

        // 2. Call Supabase Resend
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.resend({
            type: type || 'signup',
            email: email,
        });

        if (error) {
            console.error('Supabase Resend Error:', error);
            // Don't reveal exact error to prevent user enumeration if possible, 
            // but Supabase usually handles this.
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Email sent' });

    } catch (error) {
        console.error('Resend API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
