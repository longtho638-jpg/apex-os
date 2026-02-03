#!/usr/bin/env tsx
/**
 * Test encryption/decryption functionality
 * Run with: npx tsx src/scripts/test-encryption.ts
 */

import { logger } from '@/lib/logger';
import { encrypt, decrypt, encryptApiCredentials, decryptApiCredentials } from '../lib/crypto/vault';

function testEncryption() {
    logger.info('🔐 Testing Encryption/Decryption...\n');

    try {
        // Test 1: Basic encryption/decryption
        logger.info('Test  1: Basic Encryption/Decryption');
        const plaintext = 'my-secret-api-key-12345';
        logger.info(`  Original: ${plaintext}`);

        const encrypted = encrypt(plaintext);
        logger.info(`  Encrypted: ${encrypted.substring(0, 50)}...`);

        const decrypted = decrypt(encrypted);
        logger.info(`  Decrypted: ${decrypted}`);

        if (decrypted === plaintext) {
            logger.info('  ✅ PASS\n');
        } else {
            logger.info('  ❌ FAIL - Decrypted value does not match original\n');
            return false;
        }

        // Test 2: API Credentials
        logger.info('Test 2: API Credentials Encryption');
        const apiKey = 'BINANCE_API_KEY_ABC123';
        const apiSecret = 'binance_secret_xyz789';
        logger.info(`  API Key: ${apiKey}`);
        logger.info(`  API Secret: ${apiSecret}`);

        const encryptedCreds = encryptApiCredentials(apiKey, apiSecret);
        logger.info(`  Encrypted Key: ${encryptedCreds.encryptedKey.substring(0, 40)}...`);
        logger.info(`  Encrypted Secret: ${encryptedCreds.encryptedSecret.substring(0, 40)}...`);

        const decryptedCreds = decryptApiCredentials(
            encryptedCreds.encryptedKey,
            encryptedCreds.encryptedSecret
        );
        logger.info(`  Decrypted Key: ${decryptedCreds.apiKey}`);
        logger.info(`  Decrypted Secret: ${decryptedCreds.apiSecret}`);

        if (decryptedCreds.apiKey === apiKey && decryptedCreds.apiSecret === apiSecret) {
            logger.info('  ✅ PASS\n');
        } else {
            logger.info('  ❌ FAIL - Decrypted credentials do not match\n');
            return false;
        }

        // Test 3: Tamper detection
        logger.info('Test 3: Tamper Detection');
        const tamperedEncrypted = encrypted.substring(0, 50) + 'XXXX' + encrypted.substring(54);
        try {
            decrypt(tamperedEncrypted);
            logger.info('  ❌ FAIL - Should have thrown error for tampered data\n');
            return false;
        } catch (error) {
            logger.info('  ✅ PASS - Tampered data rejected\n');
        }

        // Test 4: Multiple encryptions produce different ciphertexts
        logger.info('Test 4: Randomized Encryption (Different IV each time)');
        const encrypted1 = encrypt(plaintext);
        const encrypted2 = encrypt(plaintext);

        if (encrypted1 !== encrypted2) {
            logger.info('  ✅ PASS - Each encryption uses unique IV\n');
        } else {
            logger.info('  ❌ FAIL - Encryptions should not be identical\n');
            return false;
        }

        logger.info('========================================');
        logger.info('✅ ALL TESTS PASSED');
        logger.info('========================================\n');
        return true;

    } catch (error) {
        logger.error('❌ Test failed with error:', error);
        if (error instanceof Error && error.message.includes('VAULT_KEY_MASTER')) {
            logger.info('\n⚠️  VAULT_KEY_MASTER not set in environment variables.');
            logger.info('   Please add to .env.local:');
            logger.info('   VAULT_KEY_MASTER=your-32-character-secret-key\n');
        }
        return false;
    }
}

// Run tests
if (process.env.NODE_ENV !== 'production') {
    testEncryption();
} else {
    logger.info('⚠️  Skipping encryption tests in production environment');
}
