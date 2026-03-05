import type { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function enterpriseAuthMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer apx_live_')) {
    return { authorized: false, error: 'Missing or invalid API key' };
  }

  const apiKey = authHeader.split(' ')[1];

  // Use Web Crypto API for Edge compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const supabase = getSupabaseClient();

  // 1. Validate Key
  const { data: keyRecord, error } = await supabase
    .from('enterprise_api_keys')
    .select('id, organization_id, rate_limit, is_active')
    .eq('key_hash', keyHash)
    .single();

  if (error || !keyRecord || !keyRecord.is_active) {
    return { authorized: false, error: 'Invalid or inactive API key' };
  }

  // 2. Rate Limiting (Simplified for CLI - Redis is better in prod)
  // Using DB count for recent requests as a basic check
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from('enterprise_usage')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyRecord.id)
    .gte('created_at', oneMinuteAgo);

  if ((count || 0) > keyRecord.rate_limit) {
    return { authorized: false, error: 'Rate limit exceeded' };
  }

  // 3. Log Usage (Async fire-and-forget style ideally, but here sequential for simplicity in serverless function context)
  // In a real middleware, this might be offloaded or handled after response if platform allows.
  // We will return the keyRecord to be used by the route handler to log success/failure later.

  return { authorized: true, keyRecord };
}

export async function logEnterpriseUsage(apiKeyId: string, endpoint: string, statusCode: number, latencyMs: number) {
  const supabase = getSupabaseClient();
  await supabase.from('enterprise_usage').insert({
    api_key_id: apiKeyId,
    endpoint,
    status_code: statusCode,
    latency_ms: latencyMs,
  });
}
