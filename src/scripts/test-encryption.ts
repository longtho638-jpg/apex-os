#!/usr/bin/env tsx
/**
 * Test encryption/decryption functionality
 * Run with: npx tsx src/scripts/test-encryption.ts
 */

import { encrypt, decrypt, encryptApiCredentials, decryptApiCredentials } from '../lib/crypto/vault';

function testEncryption() {
    console.log('🔐 Testing Encryption/Decryption...\n');

    try {
        // Test 1: Basic encryption/decryption
        console.log('Test  1: Basic Encryption/Decryption');
        const plaintext = 'my-secret-api-key-12345';
        console.log(`  Original: ${plaintext}`);

        const encrypted = encrypt(plaintext);
        console.log(`  Encrypted: ${encrypted.substring(0, 50)}...`);

        const decrypted = decrypt(encrypted);
        console.log(`  Decrypted: ${decrypted}`);

        if (decrypted === plaintext) {
            console.log('  ✅ PASS\n');
        } else {
            console.log('  ❌ FAIL - Decrypted value does not match original\n');
            return false;
        }

        // Test 2: API Credentials
        console.log('Test 2: API Credentials Encryption');
        const apiKey = 'BINANCE_API_KEY_ABC123';
        const apiSecret = 'binance_secret_xyz789';
        console.log(`  API Key: ${apiKey}`);
        console.log(`  API Secret: ${apiSecret}`);

        const encryptedCreds = encryptApiCredentials(apiKey, apiSecret);
        console.log(`  Encrypted Key: ${encryptedCreds.encryptedKey.substring(0, 40)}...`);
        console.log(`  Encrypted Secret: ${encryptedCreds.encryptedSecret.substring(0, 40)}...`);

        const decryptedCreds = decryptApiCredentials(
            encryptedCreds.encryptedKey,
            encryptedCreds.encryptedSecret
        );
        console.log(`  Decrypted Key: ${decryptedCreds.apiKey}`);
        console.log(`  Decrypted Secret: ${decryptedCreds.apiSecret}`);

        if (decryptedCreds.apiKey === apiKey && decryptedCreds.apiSecret === apiSecret) {
            console.log('  ✅ PASS\n');
        } else {
            console.log('  ❌ FAIL - Decrypted credentials do not match\n');
            return false;
        }

        // Test 3: Tamper detection
        console.log('Test 3: Tamper Detection');
        const tamperedEncrypted = encrypted.substring(0, 50) + 'XXXX' + encrypted.substring(54);
        try {
            decrypt(tamperedEncrypted);
            console.log('  ❌ FAIL - Should have thrown error for tampered data\n');
            return false;
        } catch (error) {
            console.log('  ✅ PASS - Tampered data rejected\n');
        }

        // Test 4: Multiple encryptions produce different ciphertexts
        console.log('Test 4: Randomized Encryption (Different IV each time)');
        const encrypted1 = encrypt(plaintext);
        const encrypted2 = encrypt(plaintext);

        if (encrypted1 !== encrypted2) {
            console.log('  ✅ PASS - Each encryption uses unique IV\n');
        } else {
            console.log('  ❌ FAIL - Encryptions should not be identical\n');
            return false;
        }

        console.log('========================================');
        console.log('✅ ALL TESTS PASSED');
        console.log('========================================\n');
        return true;

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        if (error instanceof Error && error.message.includes('VAULT_KEY_MASTER')) {
            console.log('\n⚠️  VAULT_KEY_MASTER not set in environment variables.');
            console.log('   Please add to .env.local:');
            console.log('   VAULT_KEY_MASTER=your-32-character-secret-key\n');
        }
        return false;
    }
}

// Run tests
if (process.env.NODE_ENV !== 'production') {
    testEncryption();
} else {
    console.log('⚠️  Skipping encryption tests in production environment');
}
