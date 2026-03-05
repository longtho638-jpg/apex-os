import crypto from 'node:crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SUPABASE_JWT_SECRET;

if (!ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL SECURITY ERROR: ENCRYPTION_KEY or SUPABASE_JWT_SECRET is not set in production environment.',
    );
  } else {
  }
}

const _SAFE_KEY = ENCRYPTION_KEY || 'development-only-unsafe-key-do-not-use-in-prod!!'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function getEncryptionKey(): Buffer {
  // Ensure key is 32 bytes
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
  return Buffer.from(key);
}

export function encrypt(text: string): string {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string): string {
  if (!text) return text;

  const textParts = text.split(':');
  if (textParts.length !== 2) return text; // Not encrypted or invalid format

  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
