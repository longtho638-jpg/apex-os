import { logger } from '@/lib/logger';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    try {
        if (action === 'leaders') {
            // Fetch all leaders
            const { data: leaders, error } = await supabase
                .from('copy_leaders')
                .select('*')
                .order('total_pnl', { ascending: false })
                .limit(12);

            if (error) throw error;

            if (error) throw error;

            return NextResponse.json({ success: true, leaders: leaders || [] });
        }

        if (action === 'following' && userId) {
            const { data: following, error } = await supabase
                .from('copy_settings')
                .select('leader_id, status')
                .eq('follower_id', userId)
                .eq('status', 'ACTIVE');

            if (error) throw error;

            return NextResponse.json({ success: true, following: following || [] });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        logger.error('[CopyTrading API] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Validate env variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        logger.error('[CopyTrading] Missing env variables:', {
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        });
        return NextResponse.json({
            success: false,
            error: 'Server configuration error'
        }, { status: 500 });
    }

    // Use service role key to bypass RLS since this app uses custom authentication (apex_session).
    // Middleware has already validated the user's session before this handler is called.
    // This is safe because userId is validated by the frontend AuthContext.
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        const body = await request.json();
        const { action, userId, leaderId, copyAmount, stopLoss } = body;

        if (action === 'follow') {
            // 1. Create Copy Setting
            const { error: insertError } = await supabase
                .from('copy_settings')
                .upsert({
                    follower_id: userId,
                    leader_id: leaderId,
                    copy_amount: copyAmount || 1000,
                    stop_loss_percent: stopLoss || 20,
                    status: 'ACTIVE'
                });

            if (insertError) throw insertError;

            // 2. Increment Follower Count (Optimistic)
            // In real app, use a trigger or RPC

            return NextResponse.json({ success: true, message: 'Now copying leader' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        logger.error('[CopyTrading API] POST Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error',
            details: error.details || null
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // Use service role key (same reason as POST handler)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        const body = await request.json();
        const { userId, leaderId } = body;

        const { error } = await supabase
            .from('copy_settings')
            .update({ status: 'STOPPED' })
            .eq('follower_id', userId)
            .eq('leader_id', leaderId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Unfollowed leader' });

    } catch (error) {
        logger.error('[CopyTrading API] DELETE Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
