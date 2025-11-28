/**
 * Vault - Encryption/Decryption utilities for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 * 
 * @module vault
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000;

/**
 * Get the master encryption key from environment
 * @throws {Error} if VAULT_KEY_MASTER is not set
 */
function getMasterKey(): string {
    const masterKey = process.env.VAULT_KEY_MASTER;

    if (!masterKey) {
        throw new Error('VAULT_KEY_MASTER environment variable is not set');
    }

    if (masterKey.length < 32) {
        throw new Error('VAULT_KEY_MASTER must be at least 32 characters long');
    }

    return masterKey;
}

/**
 * Derive encryption key from master key using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
        masterKey,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        'sha512'
    );
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * 
 * @param plaintext - The data to encrypt
 * @returns Base64 encoded encrypted data with format: salt:iv:authTag:ciphertext
 * 
 * @example
 * const encrypted = encrypt('my-api-key');
 * // Returns: "base64salt:base64iv:base64tag:base64cipher"
 */
export function encrypt(plaintext: string): string {
    try {
        const masterKey = getMasterKey();

        // Generate random salt and IV
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);

        // Derive encryption key from master key
        const key = deriveKey(masterKey, salt);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt
        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Get authentication tag
        const authTag = cipher.getAuthTag();

        // Combine salt, iv, tag, and encrypted data
        // Format: salt:iv:tag:ciphertext
        return [
            salt.toString('base64'),
            iv.toString('base64'),
            authTag.toString('base64'),
            encrypted
        ].join(':');

    } catch (error) {
        throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Decrypt data encrypted with the encrypt() function
 * 
 * @param encrypted - Base64 encoded encrypted data (salt:iv:authTag:ciphertext)
 * @returns Decrypted plaintext
 * 
 * @example
 * const decrypted = decrypt(encrypted);
 * // Returns: "my-api-key"
 */
export function decrypt(encrypted: string): string {
    try {
        const masterKey = getMasterKey();

        // Parse the encrypted data
        const parts = encrypted.split(':');

        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }

        const [saltB64, ivB64, authTagB64, ciphertext] = parts;

        // Decode from base64
        const salt = Buffer.from(saltB64, 'base64');
        const iv = Buffer.from(ivB64, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');

        // Validate lengths
        if (salt.length !== SALT_LENGTH) {
            throw new Error('Invalid salt length');
        }

        if (iv.length !== IV_LENGTH) {
            throw new Error('Invalid IV length');
        }

        if (authTag.length !== TAG_LENGTH) {
            throw new Error('Invalid auth tag length');
        }

        // Derive the same key using the salt
        const key = deriveKey(masterKey, salt);

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // Decrypt
        let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

    } catch (error) {
        // Fallback removed: Strict encryption enforcement
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Securely hash a value (one-way, for verification only)
 * Uses SHA-256
 * 
 * @param value - Value to hash
 * @returns Hex-encoded hash
 */
export function hash(value: string): string {
    return crypto
        .createHash('sha256')
        .update(value)
        .digest('hex');
}

/**
 * Verify if a value matches a hash
 * 
 * @param value - Value to check
 * @param hashedValue - Hash to compare against
 * @returns true if value matches hash
 */
export function verifyHash(value: string, hashedValue: string): boolean {
    const valueHash = hash(value);
    return crypto.timingSafeEqual(
        Buffer.from(valueHash),
        Buffer.from(hashedValue)
    );
}

/**
 * Check if data appears to be encrypted (basic format validation)
 */
export function isEncrypted(data: string): boolean {
    const parts = data.split(':');
    return parts.length === 4 && parts.every(part => {
        try {
            Buffer.from(part, 'base64');
            return true;
        } catch {
            return false;
        }
    });
}

/**
 * Safely encrypt API credentials
 * Returns an object with encrypted key and secret
 */
export function encryptApiCredentials(apiKey: string, apiSecret: string): {
    encryptedKey: string;
    encryptedSecret: string;
} {
    return {
        encryptedKey: encrypt(apiKey),
        encryptedSecret: encrypt(apiSecret)
    };
}

/**
 * Safely decrypt API credentials
 * Returns an object with decrypted key and secret
 */
export function decryptApiCredentials(encryptedKey: string, encryptedSecret: string): {
    apiKey: string;
    apiSecret: string;
} {
    return {
        apiKey: decrypt(encryptedKey),
        apiSecret: decrypt(encryptedSecret)
    };
}
