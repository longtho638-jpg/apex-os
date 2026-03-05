import { createClient } from '@supabase/supabase-js';

import { type NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // 1. Verify Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // 2. Check Super Admin Role
    const { data: user } = await supabaseAdmin.from('users').select('role').eq('id', payload.sub).single();

    if (user?.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Super admin access required' }, { status: 403 });
    }

    const providerId = params.id;

    // 3. Fetch Audit Logs
    const { data: logs, error } = await supabaseAdmin
      .from('provider_audit')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Fetch audit error:', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch audit logs' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logs: logs,
    });
  } catch (error: any) {
    logger.error('Audit API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
