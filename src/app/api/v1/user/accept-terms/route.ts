/**
 * Terms Acceptance API
 *
 * Records user acceptance of ToS and Privacy Policy
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logTosAcceptance, logPrivacyAcceptance } from '@/lib/services/audit-service';
import { CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION } from '@/config/compliance';

export async function POST(request: NextRequest) {
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

    // Update user compliance status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        tos_accepted_version: CURRENT_TOS_VERSION,
        tos_accepted_at: new Date().toISOString(),
        privacy_accepted_version: CURRENT_PRIVACY_VERSION,
        privacy_accepted_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[TermsAcceptance] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update compliance status' },
        { status: 500 }
      );
    }

    // Log acceptance events
    await Promise.all([
      logTosAcceptance(user.id, CURRENT_TOS_VERSION, ipAddress, userAgent),
      logPrivacyAcceptance(user.id, CURRENT_PRIVACY_VERSION, ipAddress, userAgent),
    ]);

    return NextResponse.json({
      success: true,
      tosVersion: CURRENT_TOS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
    });
  } catch (error) {
    console.error('[TermsAcceptance] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record acceptance' },
      { status: 500 }
    );
  }
}
