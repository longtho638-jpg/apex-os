import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

function getMasterKey(): Buffer {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
        throw new Error('SUPABASE_JWT_SECRET is not defined');
    }
    // Ensure key is 32 bytes for aes-256
    return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts text using AES-256-GCM
 * Format: iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getMasterKey();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts text using AES-256-GCM
 * Expects format: iv:authTag:encryptedText
 */
export function decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getMasterKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Checks if a string looks like it's encrypted with our format
 */
export function isEncrypted(text: string): boolean {
    const parts = text.split(':');
    return parts.length === 3 &&
        parts[0].length === IV_LENGTH * 2 &&
        parts[1].length === TAG_LENGTH * 2;
}
