import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
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

        // 4. Check if we have Partner configuration for this exchange
        const { data: exchangeConfig, error: configError } = await supabaseAdmin
            .from('exchange_configs')
            .select('partner_uuid, encrypted_api_key, encrypted_api_secret')
            .eq('exchange', exchange.toLowerCase())
            .eq('is_active', true)
            .single();

        if (configError || !exchangeConfig) {
            return NextResponse.json({
                success: false,
                message: `No active configuration found for ${exchange}. Please contact admin.`
            }, { status: 404 });
        }

        // 5. Check if Partner UUID exists (needed for verification)
        if (!exchangeConfig.partner_uuid) {
            return NextResponse.json({
                success: false,
                message: `Partner UUID not configured for ${exchange}. Cannot verify account.`
            }, { status: 500 });
        }

        // 6. Check if user already has account linked
        const { data: existingAccount } = await supabaseAdmin
            .from('user_exchange_accounts')
            .select('*')
            .eq('user_id', userId)
            .eq('exchange', exchange.toLowerCase())
            .single();

        // 7. Verify account with exchange (MOCK for now - will implement real API later)
        const verificationResult = await verifyWithExchangeAPI(
            exchange,
            user_uid,
            exchangeConfig.partner_uuid,
            exchangeConfig.encrypted_api_key,
            exchangeConfig.encrypted_api_secret
        );

        // 8. Store or update verification result
        const accountData = {
            user_id: userId,
            exchange: exchange.toLowerCase(),
            user_uid: user_uid,
            verification_status: verificationResult.verified ? 'verified' : 'pending',
            linked_at: verificationResult.verified ? new Date().toISOString() : null,
            last_verified_at: new Date().toISOString(),
            verification_attempts: (existingAccount?.verification_attempts || 0) + 1,
            metadata: {
                last_check: new Date().toISOString(),
                partner_uuid: exchangeConfig.partner_uuid
            }
        };

        if (existingAccount) {
            // Update existing
            const { error: updateError } = await supabaseAdmin
                .from('user_exchange_accounts')
                .update(accountData)
                .eq('id', existingAccount.id);

            if (updateError) {
                console.error('Update error:', updateError);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to update account verification'
                }, { status: 500 });
            }
        } else {
            // Insert new
            const { error: insertError } = await supabaseAdmin
                .from('user_exchange_accounts')
                .insert(accountData);

            if (insertError) {
                console.error('Insert error:', insertError);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to save account verification'
                }, { status: 500 });
            }
        }

        // 9. Return result
        return NextResponse.json({
            success: true,
            verified: verificationResult.verified,
            message: verificationResult.message,
            needs_relink: !verificationResult.verified,
            referral_link: verificationResult.verified ? null : getReferralLink(exchange, exchangeConfig.partner_uuid)
        });

    } catch (error) {
        console.error('Verify account error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error during verification'
        }, { status: 500 });
    }
}

/**
 * Verify if user UID is linked to Partner account
 * TODO: Implement real Binance/Bybit API integration
 */
async function verifyWithExchangeAPI(
    exchange: string,
    userUid: string,
    partnerUuid: string,
    encryptedApiKey: string,
    encryptedApiSecret: string
): Promise<{ verified: boolean; message: string }> {
    // MOCK IMPLEMENTATION
    // In production, this will:
    // 1. Decrypt API keys
    // 2. Call Binance Broker API / Bybit Broker API
    // 3. Check if user_uid exists under partner_uuid

    console.log(`[MOCK] Verifying ${exchange} account ${userUid} against partner ${partnerUuid}`);

    // Simulate verification (for now, randomly verify 50% of accounts)
    const isVerified = Math.random() > 0.5;

    if (isVerified) {
        return {
            verified: true,
            message: `Account verified! Your ${exchange} account is linked to our partner program.`
        };
    } else {
        return {
            verified: false,
            message: `Account not linked. Please create a sub-account under our referral link.`
        };
    }
}

/**
 * Generate referral link for exchange
 */
function getReferralLink(exchange: string, partnerUuid: string): string {
    const links: Record<string, string> = {
        binance: `https://accounts.binance.com/register?ref=${partnerUuid}`,
        bybit: `https://www.bybit.com/register?promo_code=${partnerUuid}`,
        okx: `https://www.okx.com/join/${partnerUuid}`,
        // Add more as needed
    };

    return links[exchange.toLowerCase()] || '#';
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
