import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // getUser() automatically uses the cookies/token from the request context
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ success: true, user: null });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata
            }
        });

    } catch (error) {
        logger.error('Auth Me API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
