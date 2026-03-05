import { type NextRequest, NextResponse } from 'next/server';
import { Secret, TOTP } from 'otpauth';
import { logSecurityEvent } from '@/lib/security/audit-logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId, token } = await req.json();
  const supabase = getSupabaseClient();

  // 1. Get Secret
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(userId);

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const secret = user.user_metadata.two_factor_secret_temp;

  if (!secret) {
    return NextResponse.json({ error: '2FA setup not initiated' }, { status: 400 });
  }

  // 2. Verify Token
  const totp = new TOTP({ secret: Secret.fromBase32(secret), period: 30 });
  const verified = totp.validate({ token, window: 1 }) !== null;

  if (verified) {
    // 3. Enable 2FA
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        two_factor_enabled: true,
        two_factor_secret: secret,
        two_factor_secret_temp: null, // Clear temp
      },
    });

    // Log Event
    await logSecurityEvent(userId, '2fa_enable', req);

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}
