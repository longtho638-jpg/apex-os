import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyWithExchangeAPI, generateReferralLink } from '@/lib/services/exchange-verification';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    // 0. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success, remaining, reset } = await checkRateLimit(ip);

    if (!success) {
        return NextResponse.json(
            { success: false, message: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString()
                }
            }
        );
    }

    try {
        // 1. Extract and verify JWT
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let userId: string;

        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            userId = verified.payload.sub as string;
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Parse request body
        const body = await request.json();
        const { exchange, user_uid } = body;

        if (!exchange || !user_uid) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields: exchange, user_uid'
            }, { status: 400 });
        }

        // 3. Initialize Supabase clients
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 5. Query provider configuration (for API credentials + partner info)
        const forceMockMode = process.env.NODE_ENV !== 'production';

        let partnerUuid: string;
        let encryptedApiKey: string | null = null;
        let encryptedApiSecret: string | null = null;

        if (forceMockMode) {
            // DEVELOPMENT: Skip database, use mock partner UUID
            console.log(`[VERIFY] Mock mode - skipping provider config lookup`);
            partnerUuid = `APEX_${exchange.toUpperCase()}_PARTNER`;
        } else {
            // PRODUCTION: Query real provider config
            const { data, error: configError } = await supabaseAdmin
                .from('providers')
                .select('partner_uuid, encrypted_api_key, encrypted_api_secret')
                .eq('provider_code', exchange.toLowerCase())
                .eq('asset_class', 'crypto')
                .eq('is_active', true)
                .single();

            if (configError || !data) {
                return NextResponse.json({
                    success: false,
                    message: `Exchange ${exchange} is not configured. Please contact support.`
                }, { status: 404 });
            }

            partnerUuid = data.partner_uuid;
            encryptedApiKey = data.encrypted_api_key;
            encryptedApiSecret = data.encrypted_api_secret;
        }

        // 6. Check if Partner UUID exists (needed for verification)
        if (!partnerUuid) {
            return NextResponse.json({
                success: false,
                message: `Partner UUID not configured for ${exchange}. Cannot verify account.`
            }, { status: 500 });
        }

        // 7. Check if user already has account linked
        const { data: existingAccount } = await supabaseAdmin
            .from('user_exchange_accounts')
            .select('*')
            .eq('user_id', userId)
            .eq('exchange', exchange.toLowerCase())
            .single();

        // 7. Verify account with exchange (using Service)
        const verificationResult = await verifyWithExchangeAPI(
            exchange,
            user_uid,
            partnerUuid,
            encryptedApiKey,
            encryptedApiSecret
        );

        // 8. Store or update verification result
        const accountData = {
            user_id: userId,
            exchange: exchange.toLowerCase(),
            user_uid: user_uid,
            verification_status: verificationResult.status,
            linked_at: verificationResult.verified ? new Date().toISOString() : null,
            last_verified_at: new Date().toISOString(),
            verification_attempts: (existingAccount?.verification_attempts || 0) + 1,
            metadata: {
                ...verificationResult.metadata,
                partner_uuid: partnerUuid
            }
        };

        if (existingAccount) {
            // Update existing
            const { error: updateError } = await supabaseAdmin
                .from('user_exchange_accounts')
                .update(accountData)
                .eq('id', existingAccount.id);

            if (updateError) throw updateError;
        } else {
            // Insert new
            const { error: insertError } = await supabaseAdmin
                .from('user_exchange_accounts')
                .insert(accountData);

            if (insertError) throw insertError;
        }

        // 9. Generate dynamic referral link if needed (using Service)
        const referralLink = verificationResult.verified ? null : await generateReferralLink(supabaseAdmin, exchange, 'en');

        // 10. Return result
        return NextResponse.json({
            success: true,
            verified: verificationResult.verified,
            status: verificationResult.status,
            message: verificationResult.message,
            needs_relink: verificationResult.status === 'needs_relink',
            referral_link: referralLink
        });

    } catch (error) {
        console.error('Verify account error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error during verification'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get user's linked accounts
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let userId: string;

        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            userId = verified.payload.sub as string;
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: accounts, error } = await supabaseAdmin
            .from('user_exchange_accounts')
            .select('exchange, user_uid, verification_status, linked_at, last_verified_at')
            .eq('user_id', userId);

        if (error) {
            console.error('Fetch error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch accounts'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            accounts: accounts || []
        });

    } catch (error) {
        console.error('Get accounts error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
