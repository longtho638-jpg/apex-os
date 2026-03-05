import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * ADMIN ONLY: Reset MFA for a user
 * POST /api/v1/admin/mfa/reset
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Reset MFA settings in database
    const { error } = await supabase
      .from('admin_users')
      .update({
        mfa_enabled: false,
        mfa_secret: null,
        mfa_recovery_codes: null,
      })
      .eq('email', email);

    if (error) {
      logger.error('Error resetting MFA:', error);
      return NextResponse.json({ error: 'Failed to reset MFA' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `MFA reset successfully for ${email}`,
    });
  } catch (error) {
    logger.error('MFA reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
