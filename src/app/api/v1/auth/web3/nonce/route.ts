import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const nonce = `Sign this message to authenticate with ApexOS: ${randomUUID()}`;

    // Use Service Role to upsert nonce
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { error } = await supabaseAdmin.from('auth_nonces').upsert({
      address: normalizedAddress,
      nonce: nonce,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins
    });

    if (error) {
      logger.error('Error storing nonce:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ nonce });
  } catch (error) {
    logger.error('Nonce generation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
