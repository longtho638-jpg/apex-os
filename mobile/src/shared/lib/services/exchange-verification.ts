import { decryptApiCredentials } from '@/lib/crypto/vault';

export interface VerificationResult {
    verified: boolean;
    status: 'verified' | 'failed' | 'needs_relink';
    message: string;
    metadata?: any;
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
export async function verifyWithExchangeAPI(
    exchange: string,
    userUid: string,
    partnerUuid: string,
    encryptedApiKey: string | null,
    encryptedApiSecret: string | null
): Promise<VerificationResult> {

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
export async function generateReferralLink(
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
