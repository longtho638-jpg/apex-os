import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { privacyService } from '@/lib/privacy';

export async function DELETE(request: NextRequest) {
    try {
        // 1. Authentication
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: request.headers.get('Authorization') || '' } }
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Execute Anonymization
        await privacyService.anonymizeUser(user.id);

        // 3. Sign out user (invalidate session)
        await supabase.auth.signOut();

        return NextResponse.json({
            success: true,
            message: 'Account anonymized and scheduled for deletion.'
        });

    } catch (error: any) {
        logger.error('Account deletion error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Deletion failed' },
            { status: 500 }
        );
    }
}
