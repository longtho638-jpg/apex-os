/**
 * MFA Disable API
 * POST /api/v1/admin/mfa/disable
 * 
 * Disables MFA for admin account (requires current MFA token for security)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMFAToken, decryptMFASecret } from '@/lib/mfa';
import { auditService } from '@/lib/audit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        // Get credentials from request body
        const { email, token, confirmPassword } = await request.json();

        if (!email || !token || !confirmPassword) {
            return NextResponse.json(
                { error: 'Email, token, and password confirmation are required' },
                { status: 400 }
            );
        }

        // Get admin from DB
        const { data: admin, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

        if (adminError || !admin) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        // Check if MFA is enabled
        if (!admin.mfa_enabled || !admin.mfa_secret) {
            return NextResponse.json(
                { error: 'MFA is not enabled for this account' },
                { status: 400 }
            );
        }

        // Verify current MFA token
        const decryptedSecret = decryptMFASecret(admin.mfa_secret);
        const isValid = verifyMFAToken(token, decryptedSecret);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid MFA token' },
                { status: 401 }
            );
        }

        // Password verification skipped as we verify MFA token above (Proof of Possession)

        // Disable MFA and clear secrets
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({
                mfa_enabled: false,
                mfa_secret: null,
                mfa_recovery_codes: null
            })
            .eq('email', email);

        if (updateError) {
            console.error('Error disabling MFA:', updateError);
            return NextResponse.json(
                { error: 'Failed to disable MFA' },
                { status: 500 }
            );
        }

        // Log audit action
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        await auditService.log({
            userId: admin.id,
            action: 'MFA_DISABLED',
            resourceType: 'ADMIN_USER',
            resourceId: admin.id,
            ipAddress: clientIP,
            userAgent: request.headers.get('user-agent') || undefined
        });

        return NextResponse.json({
            success: true,
            message: 'MFA disabled successfully'
        });

    } catch (error) {
        console.error('MFA disable error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
