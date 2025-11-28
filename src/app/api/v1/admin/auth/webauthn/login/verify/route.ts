import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { auditService } from '@/lib/audit';
import { SignJWT } from 'jose';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: Request) {
    try {
        const { adminId, response, expectedChallenge } = await request.json();

        if (!adminId || !response || !expectedChallenge) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get credential from DB to verify signature
        const { data: credential } = await supabase
            .from('admin_security_keys')
            .select('*')
            .eq('credential_id', response.id)
            .single();

        if (!credential) {
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 400 }
            );
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: credential.credential_id,
                publicKey: Buffer.from(credential.public_key, 'base64'),
                counter: credential.counter,
            } as any,
        });

        if (verification.verified) {
            const { authenticationInfo } = verification;

            // Update counter
            await supabase
                .from('admin_security_keys')
                .update({
                    counter: authenticationInfo.newCounter,
                    last_used_at: new Date().toISOString()
                })
                .eq('id', credential.id);

            // Get admin details for token
            const { data: admin } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', adminId)
                .single();

            // Generate JWT Token (Login Success)
            const token = await new SignJWT({
                sub: admin.id,
                email: admin.email,
                role: 'admin', // or 'service_role' if needed, but usually 'authenticated' with admin claims
                mfa_verified: true // Hardware key counts as MFA
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('7d')
                .sign(JWT_SECRET);

            // Audit log
            await auditService.log({
                userId: adminId,
                action: 'LOGIN_SUCCESS_WEBAUTHN',
                resourceType: 'AUTH',
                resourceId: adminId,
                ipAddress: 'unknown',
                userAgent: request.headers.get('user-agent') || undefined
            });

            return NextResponse.json({
                verified: true,
                token,
                user: {
                    id: admin.id,
                    email: admin.email,
                    full_name: admin.full_name
                }
            });
        }

        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });

    } catch (error) {
        console.error('WebAuthn login verify error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
