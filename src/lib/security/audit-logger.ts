import type { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function logSecurityEvent(userId: string, action: string, req: NextRequest, details: any = {}) {
  const supabase = getSupabaseClient();

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  await supabase.from('security_audit_logs').insert({
    user_id: userId,
    action,
    ip_address: ip,
    details,
    created_at: new Date().toISOString(),
  });
}
