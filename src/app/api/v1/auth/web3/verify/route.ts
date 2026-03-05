import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { auditService } from '@/lib/audit';
import { generateSessionToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature } = body;

    if (!address || !signature) {
      return NextResponse.json({ error: 'Address and signature required' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();

    // 1. Get Nonce
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: nonceData, error: nonceError } = await supabaseAdmin
      .from('auth_nonces')
      .select('nonce, expires_at')
      .eq('address', normalizedAddress)
      .single();

    if (nonceError || !nonceData) {
      return NextResponse.json({ error: 'Nonce not found. Please request a new one.' }, { status: 400 });
    }

    if (new Date(nonceData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Nonce expired' }, { status: 400 });
    }

    // 2. Verify Signature
    const valid = await verifyMessage({
      address: normalizedAddress as `0x${string}`,
      message: nonceData.nonce,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Prevent Replay: Delete Nonce immediately
    await supabaseAdmin.from('auth_nonces').delete().eq('address', normalizedAddress);

    // 4. Find or Create User
    // Check if user exists with this wallet address
    // Assuming 'users' table has 'wallet_address' column or we look up by metadata
    // For this implementation, we'll assume we look up by wallet_address in a profile or metadata.
    // Or we might have a 'wallets' table linked to users.

    // Let's check if there is a user with this wallet address in 'users' (if column exists)
    // or in 'wallets' table.

    let userId: string | null = null;
    let userEmail: string | null = null;
    let userRole: string = 'user';

    // Check 'wallets' table first (from previous context)
    const { data: walletData } = await supabaseAdmin
      .from('wallets')
      .select('user_id')
      .eq('address', normalizedAddress) // Assuming wallets table has address
      .single();

    if (walletData) {
      userId = walletData.user_id;
    } else {
      // Check if user exists in auth.users (maybe stored in metadata)
      // This part depends on how users are linked to wallets.
      // If new user, we might need to create a shadow user or ask them to link.
      // For now, if no user found, we return 404 or create a new one?
      // Let's assume we create a new anonymous user or return error saying "Register first".
      // But usually Web3 login creates a user.

      // Simplified: Create a new user if not exists is complex without email.
      // We'll return error if not linked, OR we create a placeholder.
      // Let's return error for now to be safe, or check if the user wants auto-signup.

      // For this task, the goal is SECURITY (Nonce).
      // So I will assume the user MUST exist or we fail.
      // OR I can create a user with a dummy email like `wallet_ADDRESS@apex.os`.

      // Let's try to find user by metadata
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users.users.find((u) => u.user_metadata?.wallet_address === normalizedAddress);

      if (user) {
        userId = user.id;
        userEmail = user.email || null;
        userRole = user.user_metadata?.role || 'user';
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: `${normalizedAddress}@apex.os`,
          email_confirm: true,
          user_metadata: {
            wallet_address: normalizedAddress,
            role: 'user',
          },
        });

        if (createError || !newUser.user) {
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }
        userId = newUser.user.id;
        userEmail = newUser.user.email || null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 5. Generate Session
    const token = generateSessionToken(userEmail || 'web3-user', userRole as any, userId);

    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('apex_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Audit Log
    await auditService.log({
      userId: userId,
      action: 'LOGIN_WEB3_SUCCESS',
      resourceType: 'AUTH',
      resourceId: userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    logger.error('Web3 Verify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
