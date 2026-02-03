import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC API - Tier 1: Public Check
 * 
 * Allows UNAUTHENTICATED users to check if their exchange UID
 * is already linked to Apex's referral program.
 * 
 * This is the first step in the 3-tier money flow:
 * 1. Public Check (this API) - No login required
 * 2. Claim Rebates - Requires login
 * 3. API Keys - Requires login + advanced permissions
 */

export async function POST(request: NextRequest) {
    try {
        // 1. Parse request body
        const body = await request.json();
        const { exchange, user_uid } = body;

        // 2. Validate inputs
        if (!exchange || !user_uid) {
            return NextResponse.json({
                success: false,
                message: 'Exchange and user_uid are required'
            }, { status: 400 });
        }

        // Sanitize UID (basic validation)
        const sanitizedUid = user_uid.trim();
        if (!/^[a-zA-Z0-9]+$/.test(sanitizedUid)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid UID format. Only alphanumeric characters allowed.'
            }, { status: 400 });
        }

        // 3. Initialize Supabase (no user auth needed for public check)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 4. DEVELOPMENT MODE: Always use mock verification
        const forceMockMode = process.env.NODE_ENV !== 'production';

        if (forceMockMode) {
            // MOCK LOGIC - For testing without real exchange API
            logger.info(`[PUBLIC CHECK] Mock mode - checking ${exchange} UID: ${sanitizedUid}`);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generate dynamic referral link using helper function
            const referralLink = await generateReferralLink(supabaseAdmin, exchange, 'en');

            // Mock verification logic (same cheat codes as Tier 2)
            if (sanitizedUid.toUpperCase().startsWith('RELINK') || sanitizedUid.toUpperCase().startsWith('FAIL')) {
                // Not linked - needs to use referral link
                return NextResponse.json({
                    success: true,
                    is_linked: false,
                    message: `Your ${exchange} account is not yet linked to Apex's referral program.`,
                    referral_link: referralLink
                });
            }

            // Default: Already linked
            return NextResponse.json({
                success: true,
                is_linked: true,
                message: `✅ Your ${exchange} account is already linked! Login to claim rebates.`,
                referral_link: null
            });
        }

        // 5. PRODUCTION MODE: Query provider configs and call real API
        const { data: providerConfig, error: configError } = await supabaseAdmin
            .from('providers')
            .select('partner_uuid, encrypted_api_key, encrypted_api_secret, asset_class')
            .eq('provider_code', exchange.toLowerCase())
            .eq('asset_class', 'crypto') // For now, crypto only
            .eq('is_active', true)
            .single();

        if (configError || !providerConfig) {
            return NextResponse.json({
                success: false,
                message: `Exchange ${exchange} is not supported yet. Please contact support.`
            }, { status: 404 });
        }

        // 6. Generate dynamic referral link
        const referralLink = await generateReferralLink(supabaseAdmin, exchange, 'en');

        // 7. Call exchange API to verify (production logic - to be implemented)
        // TODO: Implement real exchange API calls when ready
        // For now, return mock response
        return NextResponse.json({
            success: true,
            is_linked: false,
            message: `Check your ${exchange} account status.`,
            referral_link: referralLink
        });

    } catch (error) {
        logger.error('[PUBLIC CHECK] Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error. Please try again later.'
        }, { status: 500 });
    }
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
            .eq('asset_class', 'crypto') // Filter by asset class
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
        logger.error('[generateReferralLink] Error:', error);
        // Fallback
        return `https://${exchange}.com/register?ref=APEX_${exchange.toUpperCase()}`;
    }
}

