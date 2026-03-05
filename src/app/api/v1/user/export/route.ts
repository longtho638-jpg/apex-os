/**
 * User Data Export API (GDPR Right to Access)
 *
 * Allows users to download all their personal data
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logDataExportRequest } from '@/lib/services/audit-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Log the data export request
    await logDataExportRequest(user.id, ipAddress, userAgent);

    // Aggregate user data from various tables
    const [{ data: profile }, { data: wallets }, { data: orders }, { data: positions }, { data: auditLogs }] =
      await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('wallets').select('*').eq('user_id', user.id),
        supabase.from('orders').select('*').eq('user_id', user.id).limit(1000),
        supabase.from('positions').select('*').eq('user_id', user.id),
        supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profile || null,
      wallets: wallets || [],
      orders: orders || [],
      positions: positions || [],
      recentActivity: auditLogs || [],
      metadata: {
        exportVersion: '1.0',
        note: 'This export contains your personal data stored in Apex OS. You have the right to request deletion of this data under GDPR.',
      },
    };

    // Return as JSON
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="apex-os-data-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
