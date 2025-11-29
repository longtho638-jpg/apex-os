import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMFAToken, verifyRecoveryCode, decryptMFASecret } from '@/lib/mfa';
import { verifyTempToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';
import { auditService } from '@/lib/audit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check (5 attempts per 15 minutes)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await checkRateLimit(`mfa_verify_${ip}`);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many MFA attempts. Please try again in 15 minutes.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString()
                    }
                }
            );
        }

        // Validate temp token from Authorization header (if provided)
        const authHeader = request.headers.get('Authorization');
        let tempTokenEmail: string | null = null;

        if (authHeader) {
            const tempToken = authHeader.replace('Bearer ', '');
            const decoded = verifyTempToken(tempToken);

            if (!decoded) {
                return NextResponse.json(
                    { error: 'Invalid or expired session. Please login again.' },
                    { status: 401 }
                );
            }

            tempTokenEmail = decoded.email;
        }

        // Get credentials from request body
        const { email, token, useRecoveryCode } = await request.json();

        if (!email || !token) {
            return NextResponse.json(
                { error: 'Email and token are required' },
                { status: 400 }
            );
        }

        // Verify email matches temp token (if temp token was provided)
        if (tempTokenEmail && tempTokenEmail !== email) {
            return NextResponse.json(
                { error: 'Email mismatch. Please login again.' },
                { status: 401 }
            );
        }

        // 🔥 DEVELOPMENT BYPASS: Allow '999999' to skip MFA in non-production
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev && token === '999999') {
            console.log('🔓 DEV BYPASS: Using development MFA bypass code');

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

            // Generate session token
            const { generateSessionToken } = await import('@/lib/jwt');
            const sessionToken = generateSessionToken(email, 'admin', admin.id);

            return NextResponse.json({
                success: true,
                sessionToken,
                message: 'Development bypass used'
            });
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

        // Check if MFA secret exists
        if (!admin.mfa_secret) {
            return NextResponse.json(
                { error: 'MFA not set up for this account' },
                { status: 400 }
            );
        }

        let isValid = false;

        try {
            if (useRecoveryCode) {

                // Verify recovery code
                const result = await verifyRecoveryCode(
                    token,
                    admin.mfa_recovery_codes || []
                );

                if (result.valid) {
                    isValid = true;

                    // Update remaining recovery codes in DB
                    await supabase
                        .from('admin_users')
                        .update({
                            mfa_recovery_codes: result.remainingCodes
                        })
                        .eq('email', email);
                }
            } else {
                // Verify TOTP token
                const decryptedSecret = decryptMFASecret(admin.mfa_secret);
                isValid = verifyMFAToken(token, decryptedSecret);
            }
        } catch (verifyError: any) {
            console.error('Error during token verification:', verifyError);
            return NextResponse.json(
                { error: `Verification failed: ${verifyError.message}` },
                { status: 500 }
            );
        }

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        try {
            // Enable MFA if first-time verification
            if (!admin.mfa_enabled) {

                await supabase
                    .from('admin_users')
                    .update({ mfa_enabled: true })
                    .eq('email', email);
            }
        } catch (dbError: any) {
            console.error('Error updating MFA status:', dbError);
            return NextResponse.json(
                { error: `Database error: ${dbError.message}` },
                { status: 500 }
            );
        }

        try {
            // Generate proper session token
            const { generateSessionToken } = await import('@/lib/jwt');
            const sessionToken = generateSessionToken(email, 'admin', admin.id);

            // Log audit action
            await auditService.log({
                userId: admin.id,
                action: 'MFA_VERIFY_SUCCESS',
                resourceType: 'AUTH',
                resourceId: admin.id,
                newValue: { method: useRecoveryCode ? 'recovery_code' : 'totp' },
                ipAddress: ip,
                userAgent: request.headers.get('user-agent') || 'unknown'
            });

            return NextResponse.json({
                success: true,
                sessionToken,
                message: admin.mfa_enabled ? 'MFA verified' : 'MFA enabled successfully'
            });
        } catch (jwtError: any) {
            console.error('Error generating session token:', jwtError);
            return NextResponse.json(
                { error: `JWT error: ${jwtError.message}` },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('MFA verification error (outer catch):', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
