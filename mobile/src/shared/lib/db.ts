import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global pool manager
const poolInstance: SupabaseClient | null = null;

/**
 * Get a singleton Supabase client configured for connection pooling (Supavisor)
 * 
 * Supabase projects come with a built-in connection pooler (Supavisor) on port 6543.
 * Using the standard HTTP API URL (port 443) automatically handles pooling for API requests.
 * However, for direct DB connections (if used in scripts/backend), we should use the Pool URL.
 * 
 * For Next.js API Routes (Serverless), creating a new client per request is standard,
 * but we should ensure we don't exhaust connections if using direct postgres drivers.
 * The JS Client uses HTTP, so it's stateless and connection-safe by default.
 */
export function getDbPool(): SupabaseClient {
    throw new Error('getDbPool (Backend) is NOT available in Mobile App. Use API routes instead.');
}

/**
 * Monitor Query Performance
 * Helper to wrap critical queries and log execution time
 */
export async function monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<{ data: T; error: any }>
): Promise<{ data: T; error: any }> {
    const start = performance.now();

    try {
        const result = await queryFn();
        const duration = performance.now() - start;

        // Log slow queries (> 500ms)
        if (duration > 500) {
            console.warn(`[Slow Query] ${queryName} took ${duration.toFixed(2)}ms`);
            // Todo: Send to monitoring service (Sentry/Datadog)
        }

        return result;
    } catch (err) {
        const duration = performance.now() - start;
        console.error(`[Query Error] ${queryName} failed after ${duration.toFixed(2)}ms`, err);
        throw err;
    }
}
