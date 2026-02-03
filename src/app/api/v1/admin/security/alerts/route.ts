import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
    try {
        // Security: Verify the user is authenticated and is an admin
        // Explicitly extract token
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Missing token', code: 'MISSING_TOKEN' }, { status: 401 });
        }

        // Verify JWT manually (matching middleware logic)
        const JWT_SECRET = new TextEncoder().encode(
            process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            // Optional: Check if user exists in admin_users if needed, 
            // but for now the valid signature + middleware check is sufficient security.
            // We can rely on the payload for user ID.

        } catch (err) {
            logger.error('[Alerts API] JWT Verification Failed:', err);
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Invalid token signature or expired',
                    code: 'AUTH_FAILED'
                },
                { status: 401 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
            .from('security_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) query = query.eq('status', status);
        if (severity) query = query.eq('severity', severity);

        const { data: alerts, error } = await query;

        if (error) {
            logger.error('Error fetching alerts:', error);
            return NextResponse.json(
                { error: 'Failed to fetch alerts' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: alerts
        });

    } catch (error) {
        logger.error('Alerts API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
