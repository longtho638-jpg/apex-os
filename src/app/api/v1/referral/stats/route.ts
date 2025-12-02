import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        let userId: string | undefined;

        // 1. Try Authorization Header (Bearer Token)
        let token = request.headers.get('authorization')?.replace('Bearer ', '');

        // 2. Try Cookies
        if (!token) {
            token = request.cookies.get('apex_session')?.value;
        }

        // 3. Verify Custom JWT (apex_session)
        if (token) {
            const payload = verifySessionToken(token);
            if (payload && payload.sub) {
                userId = payload.sub;
            }
        }

        // 4. Fallback: Try Supabase Auth Cookie (sb-access-token)
        if (!userId) {
            const sbTokenName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`;
            const supabaseToken = request.cookies.get('sb-access-token')?.value ||
                request.cookies.get(sbTokenName)?.value;

            if (supabaseToken) {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    { global: { headers: { Authorization: `Bearer ${supabaseToken}` } } }
                );
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    userId = user.id;
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Initialize Admin Client to bypass RLS for stats aggregation
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Execute independent queries in parallel
        const [userInfoRes, commissionsRes, referralsRes] = await Promise.all([
            // 1. Get User Info (Referral Code)
            supabase
                .from('users')
                .select('referral_code')
                .eq('id', userId)
                .single(),

            // 2. Get Total Commission
            supabase
                .from('commissions')
                .select('amount, created_at')
                .eq('referrer_id', userId),

            // 3. Get Referrals List
            supabase
                .from('users')
                .select('id, created_at, email')
                .eq('referred_by', userId)
        ]);

        const userInfo = userInfoRes.data;
        const commissions = commissionsRes.data;
        const referrals = referralsRes.data;

        const totalCommission = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

        // Calculate this month's commission
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const thisMonthCommission = commissions
            ?.filter(c => c.created_at >= startOfMonth)
            .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

        const formattedReferrals = referrals?.map(ref => ({
            referee_id: ref.id,
            signup_date: ref.created_at,
            volume: 0, // TODO: Aggregate volume from orders
            commission: 0, // TODO: Aggregate commission per user
            status: 'active'
        })) || [];

        return NextResponse.json({
            referral_link: `https://apexrebate.com/ref/${userInfo?.referral_code || userId.substring(0, 8)}`,
            referral_code: userInfo?.referral_code || userId.substring(0, 8),
            total_referrals: referrals?.length || 0,
            total_commission: totalCommission,
            this_month_commission: thisMonthCommission,
            referrals: formattedReferrals
        });

    } catch (error: any) {
        console.error('Referral Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
