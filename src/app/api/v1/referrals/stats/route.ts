import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auditService } from '@/lib/audit';

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get Referral Code
        let { data: referralData, error } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!referralData && !error) {
            // Create new code if not exists
            const code = userId.substring(0, 8).toUpperCase();
            const { data: newCode, error: createError } = await supabase
                .from('referral_codes')
                .insert({
                    user_id: userId,
                    code: code,
                    total_referrals: 0,
                    total_earnings: 0
                })
                .select()
                .single();

            if (createError) {
                // Handle collision or other error
                logger.error('Error creating referral code:', createError);
                return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
            }
            referralData = newCode;
        } else if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            logger.error('Error fetching referral code:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        } else if (error && error.code === 'PGRST116') {
            // Create new code if not exists (Row not found)
            const code = userId.substring(0, 8).toUpperCase();
            const { data: newCode, error: createError } = await supabase
                .from('referral_codes')
                .insert({
                    user_id: userId,
                    code: code,
                    total_referrals: 0,
                    total_earnings: 0
                })
                .select()
                .single();

            if (createError) {
                // Try with random suffix if collision
                const randomSuffix = Math.floor(Math.random() * 1000).toString();
                const code2 = userId.substring(0, 5).toUpperCase() + randomSuffix;
                const { data: newCode2, error: createError2 } = await supabase
                    .from('referral_codes')
                    .insert({
                        user_id: userId,
                        code: code2,
                        total_referrals: 0,
                        total_earnings: 0
                    })
                    .select()
                    .single();

                if (createError2) {
                    return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
                }
                referralData = newCode2;
            } else {
                referralData = newCode;
            }
        }

        // 2. Get Referrals List
        const { data: referrals } = await supabase
            .from('referral_conversions')
            .select('*')
            .eq('referrer_id', userId)
            .order('converted_at', { ascending: false });

        return NextResponse.json({
            referral_code: referralData.code,
            referral_link: `https://apexrebate.com/signup?ref=${referralData.code}`,
            total_referrals: referralData.total_referrals,
            total_earnings: referralData.total_earnings,
            referrals: referrals || []
        });

    } catch (error) {
        logger.error('Referral stats error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
