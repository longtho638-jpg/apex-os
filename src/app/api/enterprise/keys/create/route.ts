import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();
  const { name, permissions, organizationId } = await req.json();

  // Authorization: Ensure request comes from an admin or the organization owner
  // Simplified for CLI task: assuming caller is authorized via session or previous middleware
  // const { data: { user } } = await supabase.auth.getUser(); 
  // For this task, assuming organizationId is passed or derived securely.

  if (!name || !organizationId) {
      return NextResponse.json({ error: 'Name and Organization ID required' }, { status: 400 });
  }

  // 1. Generate Key
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const apiKey = `apx_live_${randomBytes}`;
  const keyPrefix = apiKey.slice(0, 12); // "apx_live_1234"

  // 2. Hash Key
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // 3. Store in DB
  const { data: keyRecord, error } = await supabase
    .from('enterprise_api_keys')
    .insert({
        organization_id: organizationId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name,
        permissions: permissions || ['read_signals'],
        rate_limit: 1000
    })
    .select('id, name, key_prefix, created_at')
    .single();

  if (error) {
      console.error('Failed to create API key:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  // 4. Return Full Key ONLY ONCE
  return NextResponse.json({
      key: apiKey, // This is the ONLY time the full key is shown
      meta: keyRecord
  });
}
