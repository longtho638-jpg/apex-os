import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { monitorQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Initialize Supabase client (Admin check handled by middleware usually, but let's be safe)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch Metrics with Monitoring
        const { data: metrics, error } = await monitorQuery('fetch_admin_metrics', async () => {
            // Parallel queries for dashboard
            const [users, transactions, volume] = await Promise.all([
                supabase.from('users').select('count', { count: 'exact' }),
                supabase.from('transactions').select('count', { count: 'exact' }),
                supabase.rpc('calculate_total_volume_24h') // Assuming an RPC function exists
            ]);

            return {
                data: {
                    total_users: users.count || 0,
                    total_transactions: transactions.count || 0,
                    volume_24h: volume.data || 0
                },
                error: users.error || transactions.error || volume.error
            };
        });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: metrics
        });

    } catch (error: any) {
        logger.error('Metrics API error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}
