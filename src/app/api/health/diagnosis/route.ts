import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

export async function GET() {
  const results: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // 1. Check Database (Supabase)
  const supabase = getSupabaseClient();
  const startDb = Date.now();
  const { error: dbError } = await supabase.from('users').select('count', { count: 'exact', head: true });
  results.checks.database = {
    status: dbError ? 'degraded' : 'operational',
    latency: Date.now() - startDb,
    error: dbError?.message
  };

  // 2. Check Email Service (Resend)
  const startEmail = Date.now();
  try {
    // Ping Resend by getting account info (or dummy check)
    // Assuming RESEND_API_KEY is valid
    const resend = new Resend(process.env.RESEND_API_KEY || 're_123'); // Mock key prevents crash in dev
    // No direct "ping" method, but instantiation is cheap. 
    // Real check would involve sending a test email or checking quota if API supported it.
    // We'll assume operational if key exists.
    if (!process.env.RESEND_API_KEY) throw new Error('Missing API Key');
    results.checks.email = { status: 'operational', latency: 0 };
  } catch (e: any) {
    results.checks.email = { status: 'degraded', error: e.message };
  }

  // 3. Check AI Service (OpenRouter)
  const startAi = Date.now();
  try {
    const aiRes = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    results.checks.ai = {
        status: aiRes.ok ? 'operational' : 'degraded',
        latency: Date.now() - startAi,
        statusCode: aiRes.status
    };
  } catch (e: any) {
    results.checks.ai = { status: 'down', error: e.message };
  }

  // Overall Status
  const isHealthy = Object.values(results.checks).every((c: any) => c.status === 'operational');
  results.status = isHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(results, { status: isHealthy ? 200 : 503 });
}
