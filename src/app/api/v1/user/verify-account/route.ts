import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWithExchangeAPI } from '@/lib/services/exchange-verification';
import { decodeJwt } from 'jose';

// BYPASS AUTH MODE (FOR DEMO ONLY)
export async function POST(request: NextRequest) {
    console.log('[Verify API] BYPASS AUTH MODE');
    try {
        // 1. Try to get User ID from Token (Unverified Decode)
        const authHeader = request.headers.get('authorization');
        let userId = '00000000-0000-0000-0000-000000000000'; // Fallback ID

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = decodeJwt(token);
                if (payload.sub) userId = payload.sub;
                console.log('[Verify API] Decoded User ID:', userId);
            } catch (e) {
                console.warn('[Verify API] Failed to decode token, using fallback ID');
            }
        }

        // 2. Init Service Role Client (Full Access)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Parse Body
        const body = await request.json();
        const { exchange, user_uid } = body;

        if (!exchange || !user_uid) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // 4. Get Provider Config
        let partnerUuid = `MOCK_${exchange.toUpperCase()}_PARTNER`;
        let usingMock = true;

        try {
            const { data: config } = await supabaseAdmin
                .from('exchange_configs')
                .select('partner_uuid')
                .ilike('exchange_name', exchange)
                .eq('is_active', true)
                .single();

            if (config) {
                partnerUuid = config.partner_uuid || partnerUuid;
                usingMock = false;
            }
        } catch (err) {}

        // 5. Verify Logic
        const verificationResult = await verifyWithExchangeAPI(
            exchange,
            user_uid,
            partnerUuid,
            null, null
        );

        // 6. Save DB
        await supabaseAdmin
            .from('user_exchange_accounts')
            .upsert({
                user_id: userId,
                exchange: exchange.toLowerCase(),
                user_uid: user_uid,
                verification_status: verificationResult.status,
                linked_at: verificationResult.verified ? new Date().toISOString() : null,
                last_verified_at: new Date().toISOString(),
                metadata: {
                    ...verificationResult.metadata,
                    partner_uuid: partnerUuid,
                    mode: usingMock ? 'simulation' : 'live'
                }
            }, { onConflict: 'user_id, exchange' });

        const referralLink = verificationResult.verified 
            ? null 
            : `https://www.${exchange.toLowerCase()}.com/join/${partnerUuid}`;

        return NextResponse.json({
            success: true,
            verified: verificationResult.verified,
            status: verificationResult.status,
            message: verificationResult.message,
            needs_relink: verificationResult.status === 'needs_relink',
            referral_link: referralLink
        });

    } catch (error: any) {
        console.error('[Verify API] Critical Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
