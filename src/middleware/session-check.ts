import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

export async function checkSession(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseClient();

  // Check if session is active
  const { data: session } = await supabase
    .from('active_sessions')
    .select('id')
    .eq('token_hash', tokenHash)
    .single();

  if (!session) {
      // Session invalid or revoked
      return false;
  }

  // Update last active (async, don't await to block response)
  supabase
    .from('active_sessions')
    .update({ last_active: new Date().toISOString() })
    .eq('id', session.id);

  return true;
}
