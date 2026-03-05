import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { decryptMFASecret, verifyMFAToken, verifyRecoveryCode } from '@/lib/mfa';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, isRecoveryCode } = body;

    if (!email || !token) {
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase.from('admin_users').select('*').eq('email', email).single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.mfa_enabled || !user.mfa_secret) {
      return NextResponse.json({ error: 'MFA not enabled for this user' }, { status: 400 });
    }

    let isValid = false;

    if (isRecoveryCode) {
      // Validate recovery code
      const recoveryCodes = user.mfa_recovery_codes || [];
      const result = await verifyRecoveryCode(token, recoveryCodes);

      if (result.valid && result.remainingCodes) {
        isValid = true;

        // Remove used recovery code
        await supabase.from('admin_users').update({ mfa_recovery_codes: result.remainingCodes }).eq('id', user.id);
      }
    } else {
      // Validate TOTP token
      const decryptedSecret = decryptMFASecret(user.mfa_secret);
      isValid = verifyMFAToken(token, decryptedSecret);
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token or recovery code' }, { status: 401 });
    }

    // MFA verification successful
    // In a real app, you'd create a session here
    return NextResponse.json({
      success: true,
      message: 'MFA verified successfully',
      userId: user.id,
    });
  } catch (error: any) {
    logger.error('MFA verification error:', error);
    return NextResponse.json({ error: error.message || 'MFA verification failed' }, { status: 500 });
  }
}
