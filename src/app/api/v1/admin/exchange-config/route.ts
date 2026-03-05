import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production');

// Encryption setup (Fernet-compatible AES-256-CBC)
const VAULT_KEY = process.env.VAULT_KEY_MASTER!;

function encrypt(secret: string): string {
  if (!VAULT_KEY) throw new Error('VAULT_KEY not configured');
  if (!secret) return '';

  // Fernet uses base64-encoded keys (32 bytes for AES-256)
  const key = Buffer.from(VAULT_KEY, 'base64');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key.slice(0, 32), iv);

  let encrypted = cipher.update(secret, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Return IV + encrypted data (Fernet format simplified)
  return `${iv.toString('base64')}:${encrypted}`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (_err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { exchange, partner_uuid, api_key, api_secret } = body;

    if (!exchange || !api_key || !api_secret) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: exchange, api_key, api_secret',
        },
        { status: 400 },
      );
    }

    // 3. Encrypt API credentials IMMEDIATELY (never store plaintext)
    const encrypted_api_key = encrypt(api_key);
    const encrypted_api_secret = encrypt(api_secret);

    // 4. Save to database using Service Role Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('exchange_configs').upsert(
      {
        exchange: exchange.toLowerCase(),
        partner_uuid: partner_uuid || null,
        encrypted_api_key,
        encrypted_api_secret,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'exchange',
      },
    );

    if (error) {
      logger.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to save configuration',
        },
        { status: 500 },
      );
    }

    // 5. Return success (NEVER return keys back to client)
    return NextResponse.json({
      success: true,
      message: 'Exchange configuration saved securely',
    });
  } catch (error) {
    logger.error('Exchange config save error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Admin Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (_err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // 2. Fetch configs (WITHOUT decrypting keys)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('exchange_configs')
      .select('exchange, partner_uuid, is_active, updated_at')
      .eq('is_active', true);

    if (error) {
      logger.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch configurations',
        },
        { status: 500 },
      );
    }

    // 3. Return only non-sensitive data
    const configs = data.map((config) => ({
      exchange: config.exchange,
      partner_uuid: config.partner_uuid,
      is_configured: config.is_active,
      updated_at: config.updated_at,
    }));

    return NextResponse.json({
      success: true,
      configs,
    });
  } catch (error) {
    logger.error('Exchange config fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
      },
      { status: 500 },
    );
  }
}
