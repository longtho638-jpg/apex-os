import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/audit';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
    try {
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
            console.error('[Audit Export API] JWT Verification Failed:', err);
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

        const body = await request.json();
        const { format = 'csv', startDate, endDate } = body;

        let logs;
        if (startDate && endDate) {
            logs = await auditService.getLogsByDateRange(new Date(startDate), new Date(endDate), 10000);
        } else {
            // Default to last 90 days
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 90);
            logs = await auditService.getLogsByDateRange(start, end, 10000);
        }

        if (format === 'json') {
            return NextResponse.json({
                success: true,
                data: logs
            });
        }

        if (format === 'csv') {
            // Convert to CSV
            const headers = ['Date', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address'];
            const csvRows = [headers.join(',')];

            for (const log of logs) {
                const row = [
                    new Date(log.created_at).toISOString(),
                    log.userId || 'N/A',
                    log.action,
                    log.resourceType || 'N/A',
                    log.resourceId || 'N/A',
                    log.ipAddress || 'N/A'
                ];
                csvRows.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
            }

            const csvContent = csvRows.join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString()}.csv"`
                }
            });
        }

        return NextResponse.json(
            { error: 'Invalid format' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Audit logs export error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
