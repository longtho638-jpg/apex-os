import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const supabase = getSupabaseClient();

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  // 1. Generate Secret
  const secret = speakeasy.generateSecret({
    name: 'ApexOS',
    issuer: 'ApexOS Trading'
  });

  if (!secret.base32) {
      return NextResponse.json({ error: 'Failed to generate secret' }, { status: 500 });
  }

  // 2. Generate QR Code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // 3. Store Temporary Secret (Not enabled yet)
  // Ideally store in a temp table or session, but for simplicity we store in user record
  // with enabled=false. 
  // SECURITY NOTE: In prod, encrypt this secret before storing.
  
  const { error } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { two_factor_secret_temp: secret.base32 } }
  );

  if (error) {
      logger.error('2FA Setup Error:', error);
      return NextResponse.json({ error: 'Failed to save secret' }, { status: 500 });
  }

  return NextResponse.json({ 
      secret: secret.base32, 
      qrCode: qrCodeUrl 
  });
}
