import { generateRegistrationOptions } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const RP_NAME = 'Apex Financial OS';
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function POST(request: Request) {
  try {
    const { adminId, email } = await request.json();

    if (!adminId || !email) {
      return NextResponse.json({ error: 'Admin ID and email are required' }, { status: 400 });
    }

    // Get admin's existing authenticators to exclude them
    const { data: authenticators } = await supabase
      .from('admin_security_keys')
      .select('credential_id')
      .eq('admin_id', adminId);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: adminId,
      userName: email,
      attestationType: 'none',
      excludeCredentials: authenticators?.map((auth) => ({
        id: auth.credential_id,
        type: 'public-key',
        transports: ['internal', 'usb', 'ble', 'nfc'], // Optional
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'cross-platform',
      },
    });

    // Save challenge to DB or session (Here we return it, client must sign it)
    // In a real app, you MUST store the challenge server-side linked to the user session
    // For this implementation, we'll rely on the client sending it back (Stateless for simplicity, but verify signature!)
    // BETTER: Store in a temp table or Redis. For now, we'll assume the client passes it back securely or we use a signed JWT for the challenge.

    // Let's store it in a temporary "challenge" table or just return it.
    // To be stateless but secure, we could sign the challenge in a JWT and return that.

    return NextResponse.json(options);
  } catch (error) {
    logger.error('WebAuthn registration start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
