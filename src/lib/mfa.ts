import { TOTP } from 'otpauth';
import QRCode from 'qrcode';

interface MFASecret {
    secret: string;
    uri: string;
    qrCode: string;
}

/**
 * Generate a new MFA secret and QR code
 * @param email User's email address
 * @param issuer Application name (default: ApexOS)
 */
export async function generateMFASecret(email: string, issuer: string = 'ApexOS'): Promise<MFASecret> {
    // Generate a new TOTP object
    const totp = new TOTP({
        issuer: issuer,
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: new TOTP({}).secret // Generate random secret
    });

    const secret = totp.secret.base32;
    const uri = totp.toString();
    const qrCode = await QRCode.toDataURL(uri);

    return {
        secret,
        uri,
        qrCode
    };
}

/**
 * Verify a TOTP token
 * @param token The 6-digit token provided by the user
 * @param secret The user's stored secret (base32)
 */
export function verifyMFAToken(token: string, secret: string): boolean {
    const totp = new TOTP({
        secret: secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30
    });

    // validate returns the delta (time drift) or null if invalid
    // We accept a delta of +/- 1 period (30 seconds) for clock drift
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
}
