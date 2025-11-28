import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SUPABASE_JWT_SECRET || 'default-key-32-bytes-length-required!!';
const IV_LENGTH = 16;

console.log('SUPABASE_JWT_SECRET:', process.env.SUPABASE_JWT_SECRET ? 'Defined' : 'Undefined');
console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? 'Defined' : 'Undefined');
console.log('Key used:', ENCRYPTION_KEY.substring(0, 10) + '...');

function getEncryptionKey(): Buffer {
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
    console.log('Derived Key Length (bytes):', Buffer.from(key).length);
    return Buffer.from(key);
}

function encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
    if (!text) return text;

    const textParts = text.split(':');
    if (textParts.length !== 2) return text;

    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

try {
    const text = 'test-string';
    console.log('Encrypting:', text);
    const encrypted = encrypt(text);
    console.log('Encrypted:', encrypted);
    const decrypted = decrypt(encrypted);
    console.log('Decrypted:', decrypted);

    if (decrypted === text) {
        console.log('✅ Encryption test passed');
    } else {
        console.error('❌ Decrypted text does not match');
    }
} catch (error) {
    console.error('❌ Encryption test failed:', error);
}
