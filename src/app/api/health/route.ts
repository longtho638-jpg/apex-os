import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redis } from '@/lib/redis';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    const services = {
        database: 'unknown',
        redis: 'unknown',
    };
    
    let isHealthy = true;

    try {
        // 1. Check Database
        // We check 'user_tiers' instead of 'users' as 'users' might be in auth schema not publicly accessible directly depending on setup
        // But 'user_tiers' is a public table we defined.
        const { error: dbError } = await supabase.from('user_tiers').select('id').limit(1);
        services.database = dbError ? 'down' : 'healthy';
        if (dbError) isHealthy = false;

        // 2. Check Redis
        try {
            await redis.ping();
            services.redis = 'healthy';
        } catch (e) {
            services.redis = 'down';
            // Redis down doesn't necessarily mean 503 if we fail open, 
            // but for a health check it is an issue.
            // We'll mark it as unhealthy but maybe keep status 200 with 'degraded' if you want
            // For now, let's strict check.
            isHealthy = false;
        }

        const statusCode = isHealthy ? 200 : 503;

        return NextResponse.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services,
            metrics: {
                uptime: process.uptime(),
                memory_mb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            },
            version: process.env.npm_package_version || '1.0.0'
        }, { status: statusCode });

    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error.message,
            },
            { status: 503 }
        );
    }
}