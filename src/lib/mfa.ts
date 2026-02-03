import { logger } from '@/lib/logger';
import { TOTP } from 'otpauth';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { encrypt, decrypt } from './crypto/vault';

const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_LENGTH = 8;

interface MFASecret {
    secret: string; // Plain secret (show once)
    encryptedSecret: string; // For DB storage
    uri: string;
    qrCode: string;
    recoveryCodes: string[]; // Plain codes (show once)
    hashedRecoveryCodes: string[]; // For DB storage
}

/**
 * Generate a new MFA secret, QR code, and recovery codes
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
    // logger.info('[MFA Setup] Plain secret generated:', secret); // redacted

    const uri = totp.toString();
    const qrCode = await QRCode.toDataURL(uri);

    // Encrypt secret for storage
    // logger.info('[MFA Setup] Calling encrypt function...'); // redacted
    const encryptedSecret = await encrypt(secret);
    // logger.info('[MFA Setup] Encrypted secret:', encryptedSecret.substring(0, 50) + '...'); // redacted
    // logger.info('[MFA Setup] Encrypted parts:', encryptedSecret.split(':').length); // redacted

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes();
    const hashedRecoveryCodes = await Promise.all(
        recoveryCodes.map(code => bcrypt.hash(code, 10))
    );

    return {
        secret,
        encryptedSecret,
        uri,
        qrCode,
        recoveryCodes,
        hashedRecoveryCodes
    };
}

/**
 * Verify a TOTP token
 * @param token The 6-digit token provided by the user
 * @param secret The user's stored secret (base32)
 */
export function verifyMFAToken(token: string, secret: string): boolean {
    try {
        const totp = new TOTP({
            secret: secret,
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        });

        // validate returns the delta (time drift) or null if invalid
        // We accept a delta of +/- 1 period (30 seconds) for clock drift
        const delta = totp.validate({ token: token.replace(/\s/g, ''), window: 1 });

        return delta !== null;
    } catch (error) {
        logger.error('MFA token verification error:', error);
        return false;
    }
}

/**
 * Verify recovery code
 * @param code The recovery code provided by the user
 * @param hashedCodes Array of hashed recovery codes from DB
 * @returns Object with valid flag and remaining codes if valid
 */
export async function verifyRecoveryCode(
    code: string,
    hashedCodes: string[]
): Promise<{ valid: boolean; remainingCodes?: string[] }> {
    for (let i = 0; i < hashedCodes.length; i++) {
        const isMatch = await bcrypt.compare(code, hashedCodes[i]);
        if (isMatch) {
            // Remove used code
            const remainingCodes = hashedCodes.filter((_, index) => index !== i);
            return { valid: true, remainingCodes };
        }
    }

    return { valid: false };
}

/**
 * Generate random recovery codes
 * Format: XXXX-XXXX
 */
function generateRecoveryCodes(): string[] {
    const codes: string[] = [];

    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
        const code = crypto
            .randomBytes(RECOVERY_CODE_LENGTH / 2)
            .toString('hex')
            .toUpperCase()
            .match(/.{1,4}/g) // Format as XXXX-XXXX
            ?.join('-') || '';

        codes.push(code);
    }

    return codes;
}

/**
 * Decrypt MFA secret from database
 * @param encryptedSecret Encrypted secret from DB
 */
export function decryptMFASecret(encryptedSecret: string): string {
    return decrypt(encryptedSecret);
}
