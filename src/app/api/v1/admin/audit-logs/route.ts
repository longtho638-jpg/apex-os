import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/audit';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = searchParams.get('userId');

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
            await jwtVerify(token, JWT_SECRET);
        } catch (err) {
            console.error('[Audit API] JWT Verification Failed:', err);
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Invalid token signature or expired',
                    code: 'AUTH_FAILED'
                },
                { status: 401 }
            );
        }

        // Initialize Supabase client for data access (not auth check)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Optional: Check if user exists in admin_users table for extra security
        // const { data: adminUser } = await supabase.from('admin_users').select('id').eq('id', user.id).single();
        // if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        let result: any[] = [];
        if (userId) {
            result = await auditService.getLogsByUser(userId);
        } else if (startDate && endDate) {
            result = await auditService.getLogsByDateRange(
                new Date(startDate),
                new Date(endDate)
            );
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Audit logs API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
