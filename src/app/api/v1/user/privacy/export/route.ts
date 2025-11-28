import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { privacyService } from '@/lib/privacy';
import { auditService } from '@/lib/audit';

export async function POST(request: NextRequest) {
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

        // 2. Fetch Data
        const userData = await privacyService.exportUserData(user.id);

        // 3. Audit Log
        await auditService.log({
            userId: user.id,
            action: 'DATA_EXPORT_REQUESTED',
            resourceType: 'PRIVACY',
            resourceId: user.id,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        });

        // 4. Return Data
        return NextResponse.json({
            success: true,
            data: userData
        });

    } catch (error: any) {
        console.error('Privacy export error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Export failed' },
            { status: 500 }
        );
    }
}
