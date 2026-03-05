import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get admin user
    const { data: admin } = await supabase.from('admin_users').select('id').eq('email', email).single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Get registered authenticators
    const { data: authenticators } = await supabase
      .from('admin_security_keys')
      .select('credential_id, transports')
      .eq('admin_id', admin.id);

    if (!authenticators || authenticators.length === 0) {
      return NextResponse.json({ error: 'No security keys registered for this account' }, { status: 400 });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: authenticators.map((auth) => ({
        id: auth.credential_id,
        type: 'public-key',
        transports: auth.transports,
      })),
      userVerification: 'preferred',
    });

    // Again, in a stateless setup, we return the challenge.
    // Secure implementation requires storing this challenge server-side (Redis/DB) linked to a session ID.

    return NextResponse.json({
      options,
      adminId: admin.id, // Return adminId to help with verification step
    });
  } catch (error) {
    logger.error('WebAuthn login start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
