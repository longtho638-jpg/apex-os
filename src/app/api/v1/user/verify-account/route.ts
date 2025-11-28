import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { decryptApiCredentials } from '@/lib/crypto/vault';
import { checkRateLimit } from '@/lib/rateLimit';

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
    // 0. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success, remaining, reset } = checkRateLimit(ip);

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

        let providerConfig = null;
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

            providerConfig = data;
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

        // 7. Verify account with exchange
        const verificationResult = await verifyWithExchangeAPI(
            exchange,
            user_uid,
            partnerUuid,
            encryptedApiKey || '', // Empty string for mock mode
            encryptedApiSecret || '' // Empty string for mock mode
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
                partner_uuid: partnerUuid // Use the variable, not exchangeConfig
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

        // 9. Generate dynamic referral link if needed
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

/**
 * Verify if user UID is linked to Partner account
 * 
 * For MOCK mode: Implements "Cheat Codes" for testing:
 * - FAIL... -> Returns failed status
 * - RELINK... -> Returns needs_relink status
 * - Others -> Returns verified
 * 
 * For PRODUCTION mode: Will call real exchange APIs after decrypting credentials
 */
async function verifyWithExchangeAPI(
    exchange: string,
    userUid: string,
    partnerUuid: string,
    encryptedApiKey: string,
    encryptedApiSecret: string
): Promise<{ verified: boolean; status: 'verified' | 'failed' | 'needs_relink'; message: string; metadata?: any }> {

    console.log(`[Verification] Starting verification for ${exchange} account ${userUid}`);

    // Decrypt API credentials (skip in mock mode)
    let apiKey: string = '';
    let apiSecret: string = '';

    // MOCK MODE: Skip decryption if credentials are empty (development/testing)
    if (encryptedApiKey && encryptedApiSecret) {
        try {
            const decrypted = decryptApiCredentials(encryptedApiKey, encryptedApiSecret);
            apiKey = decrypted.apiKey;
            apiSecret = decrypted.apiSecret;
            console.log(`[Verification] Successfully decrypted API credentials for ${exchange}`);
        } catch (error) {
            console.error(`[Verification] Failed to decrypt credentials:`, error);
            return {
                verified: false,
                status: 'failed',
                message: 'Internal error: Could not decrypt exchange credentials',
                metadata: {
                    error_reason: 'Decryption failed',
                    checked_at: new Date().toISOString()
                }
            };
        }
    } else {
        console.log(`[Verification] Mock mode - skipping credential decryption`);
    }

    // SIMULATION MODE - Network Latency (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // =====================================
    // MOCK LOGIC - For Development/Testing
    // =====================================
    // Remove this section when integrating real APIs

    // CHEAT CODE: FAIL prefix
    if (userUid.toUpperCase().startsWith('FAIL')) {
        return {
            verified: false,
            status: 'failed',
            message: 'UID does not exist on exchange',
            metadata: { error_reason: 'UID not found', checked_at: new Date().toISOString() }
        };
    }

    // CHEAT CODE: RELINK prefix
    if (userUid.toUpperCase().startsWith('RELINK')) {
        return {
            verified: false,
            status: 'needs_relink',
            message: 'API Key expired or permission denied',
            metadata: { error_reason: 'Permission denied', checked_at: new Date().toISOString() }
        };
    }

    // Default: Success
    return {
        verified: true,
        status: 'verified',
        message: `Account verified! Your ${exchange} account is linked.`,
        metadata: { tier: 'VIP 1', checked_at: new Date().toISOString() }
    };

    // =====================================
    // PRODUCTION LOGIC - Real Exchange APIs
    // =====================================
    // Uncomment and implement when ready for production
    /*
    try {
        let isVerified = false;
        let tierInfo = null;

        switch (exchange.toLowerCase()) {
            case 'binance':
                isVerified = await verifyBinanceAccount(userUid, partnerUuid, apiKey, apiSecret);
                if (isVerified) {
                    tierInfo = await getBinanceAccountTier(userUid, apiKey, apiSecret);
                }
                break;
            
            case 'bybit':
                isVerified = await verifyBybitAccount(userUid, partnerUuid, apiKey, apiSecret);
                if (isVerified) {
                    tierInfo = await getBybitAccountTier(userUid, apiKey, apiSecret);
                }
                break;
            
            case 'okx':
                isVerified = await verifyOKXAccount(userUid, partnerUuid, apiKey, apiSecret);
                if (isVerified) {
                    tierInfo = await getOKXAccountTier(userUid, apiKey, apiSecret);
                }
                break;
            
            default:
                throw new Error(`Exchange ${exchange} not yet implemented`);
        }

        if (isVerified) {
            return {
                verified: true,
                status: 'verified',
                message: `Account verified! Your ${exchange} account is linked.`,
                metadata: {
                    tier: tierInfo?.tier || 'Standard',
                    volume_30d: tierInfo?.volume_30d || 0,
                    checked_at: new Date().toISOString()
                }
            };
        } else {
            return {
                verified: false,
                status: 'failed',
                message: 'UID not found under our referral program',
                metadata: {
                    error_reason: 'UID not linked to partner account',
                    checked_at: new Date().toISOString()
                }
            };
        }

    } catch (error) {
        console.error(`[Verification] API call failed:`, error);
        return {
            verified: false,
            status: 'needs_relink',
            message: 'Verification failed. Please check your account status.',
            metadata: {
                error_reason: error instanceof Error ? error.message : 'Unknown error',
                checked_at: new Date().toISOString()
            }
        };
    }
    */
}

/**
 * Generate referral link dynamically from database
 * Supports locale and custom templates
 */
async function generateReferralLink(
    supabaseAdmin: any,
    exchange: string,
    locale: string = 'en'
): Promise<string> {
    try {
        // Get provider config
        const { data: config } = await supabaseAdmin
            .from('providers')
            .select('partner_uuid, referral_link_template')
            .eq('provider_code', exchange.toLowerCase())
            .eq('asset_class', 'crypto')
            .eq('status', 'active')
            .single();

        if (!config) {
            // Fallback to default pattern if config not found
            return `https://${exchange}.com/register?ref=APEX_${exchange.toUpperCase()}`;
        }

        // If custom template exists, use it
        if (config.referral_link_template) {
            return config.referral_link_template
                .replace('{partner_uuid}', config.partner_uuid)
                .replace('{locale}', locale);
        }

        // Default templates for 12 exchanges
        const defaultTemplates: Record<string, string> = {
            'binance': `https://accounts.binance.com/${locale}/register?ref=${config.partner_uuid}`,
            'bybit': `https://www.bybit.com/${locale}/register?affiliate_id=${config.partner_uuid}`,
            'okx': `https://www.okx.com/join/${config.partner_uuid}`,
            'bitget': `https://www.bitget.com/register?clacCode=${config.partner_uuid}`,
            'kucoin': `https://www.kucoin.com/r/${config.partner_uuid}`,
            'mexc': `https://www.mexc.com/register?inviteCode=${config.partner_uuid}`,
            'gate': `https://www.gate.io/signup/${config.partner_uuid}`,
            'htx': `https://www.htx.com/invite/en-us/1f?invite_code=${config.partner_uuid}`,
            'bingx': `https://bingx.com/invite/${config.partner_uuid}`,
            'phemex': `https://phemex.com/register?referralCode=${config.partner_uuid}`,
            'coinex': `https://www.coinex.com/register?refer_code=${config.partner_uuid}`,
            'bitmart': `https://www.bitmart.com/register?r=${config.partner_uuid}`
        };

        return defaultTemplates[exchange.toLowerCase()] || `https://${exchange}.com/register?ref=${config.partner_uuid}`;

    } catch (error) {
        console.error('[generateReferralLink] Error:', error);
        // Fallback
        return `https://${exchange}.com/register?ref=APEX_${exchange.toUpperCase()}`;
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
