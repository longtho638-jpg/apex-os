// Test encryption/decryption flow
// Run: node scripts/test-encryption.js

require('dotenv').config({ path: '.env.local' });

// Import the actual vault functions
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function getMasterKey() {
    const masterKey = process.env.VAULT_KEY_MASTER;
    if (!masterKey) {
        throw new Error('VAULT_KEY_MASTER environment variable is not set');
    }
    if (masterKey.length < 32) {
        throw new Error('VAULT_KEY_MASTER must be at least 32 characters long');
    }
    return masterKey;
}

function deriveKey(masterKey, salt) {
    return crypto.pbkdf2Sync(
        masterKey,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        'sha512'
    );
}

function encrypt(plaintext) {
    try {
        const masterKey = getMasterKey();
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = deriveKey(masterKey, salt);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        return [
            salt.toString('base64'),
            iv.toString('base64'),
            authTag.toString('base64'),
            encrypted
        ].join(':');
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}

function decrypt(encrypted) {
    try {
        const masterKey = getMasterKey();
        const parts = encrypted.split(':');

        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }

        const [saltB64, ivB64, authTagB64, ciphertext] = parts;
        const salt = Buffer.from(saltB64, 'base64');
        const iv = Buffer.from(ivB64, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');

        if (salt.length !== SALT_LENGTH) {
            throw new Error('Invalid salt length');
        }
        if (iv.length !== IV_LENGTH) {
            throw new Error('Invalid IV length');
        }
        if (authTag.length !== TAG_LENGTH) {
            throw new Error('Invalid auth tag length');
        }

        const key = deriveKey(masterKey, salt);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

// Test
console.log('Testing Encryption/Decryption...\n');

const testSecret = 'JBSWY3DPEHPK3PXP'; // Example TOTP secret
console.log('Original secret:', testSecret);

try {
    const encrypted = encrypt(testSecret);
    console.log('✅ Encryption successful');
    console.log('Encrypted:', encrypted.substring(0, 50) + '...');
    console.log('Parts:', encrypted.split(':').length);

    const decrypted = decrypt(encrypted);
    console.log('✅ Decryption successful');
    console.log('Decrypted:', decrypted);

    if (decrypted === testSecret) {
        console.log('\n✅ ✅ ✅ ENCRYPTION/DECRYPTION WORKING CORRECTLY! ✅ ✅ ✅');
    } else {
        console.log('\n❌ Decrypted value does not match original');
    }
} catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
}
