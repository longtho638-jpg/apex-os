import { logger } from '@/lib/logger';
/**
 * MFA Setup API
 * POST /api/v1/admin/mfa/setup
 * 
 * Generates MFA secret, QR code, and recovery codes for admin
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateMFASecret } from '@/lib/mfa';
import { auditService } from '@/lib/audit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if admin exists
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

        // Check if MFA is already enabled
        if (admin.mfa_enabled) {
            return NextResponse.json(
                { error: 'MFA is already enabled for this account' },
                { status: 400 }
            );
        }

        // Generate MFA secret and recovery codes
        const mfaData = await generateMFASecret(email);

        // Store encrypted secret and hashed recovery codes in DB
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({
                mfa_secret: mfaData.encryptedSecret,
                mfa_recovery_codes: mfaData.hashedRecoveryCodes
            })
            .eq('email', email);

        if (updateError) {
            logger.error('Error updating admin MFA data:', updateError);
            return NextResponse.json(
                { error: 'Failed to save MFA setup' },
                { status: 500 }
            );
        }

        // Audit log
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        await auditService.log({
            userId: admin.id,
            action: 'MFA_SETUP_INITIATED',
            resourceType: 'ADMIN_USER',
            resourceId: admin.id,
            ipAddress: clientIP,
            userAgent: request.headers.get('user-agent') || undefined
        });

        // Return secret (plain), QR code, and recovery codes
        // IMPORTANT: This is the ONLY time plain codes will be shown
        return NextResponse.json({
            success: true,
            data: {
                secret: mfaData.secret,
                qrCodeDataUrl: mfaData.qrCode,
                recoveryCodes: mfaData.recoveryCodes
            }
        });

    } catch (error) {
        logger.error('MFA setup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
