import { NextResponse } from 'next/server';

export async function GET() {
    const checks = {
        timestamp: new Date().toISOString(),
        ready: true,
        checks: {
            environment: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            apiKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            paymentKey: !!process.env.NOWPAYMENTS_API_KEY
        }
    };

    const isReady = Object.values(checks.checks).every(v => v);

    return NextResponse.json({
        ...checks,
        ready: isReady
    }, {
        status: isReady ? 200 : 503
    });
}
