import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { auditService } from '@/lib/audit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

export async function POST(request: Request) {
    try {
        const { adminId, response, expectedChallenge } = await request.json();

        if (!adminId || !response || !expectedChallenge) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential } = verification.registrationInfo;
            const counter = (verification.registrationInfo as any).counter || 0;

            // Save to DB
            const { error } = await supabase
                .from('admin_security_keys')
                .insert({
                    admin_id: adminId,
                    credential_id: Buffer.from(credential.id).toString('base64url'),
                    public_key: Buffer.from(credential.publicKey).toString('base64'),
                    counter,
                    transports: response.response.transports || [],
                    nickname: 'Security Key' // Could ask user for this
                });

            if (error) throw error;

            // Audit log
            await auditService.log({
                userId: adminId,
                action: 'WEBAUTHN_REGISTER_SUCCESS',
                resourceType: 'SECURITY_KEY',
                resourceId: 'new_key',
                ipAddress: 'unknown', // Should get from request
                userAgent: request.headers.get('user-agent') || undefined
            });

            return NextResponse.json({ verified: true });
        }

        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });

    } catch (error) {
        console.error('WebAuthn registration verify error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
