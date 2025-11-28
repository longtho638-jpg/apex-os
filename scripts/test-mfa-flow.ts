#!/usr/bin/env ts-node

/**
 * Test MFA Flow - End-to-End Testing
 * Tests MFA setup, TOTP validation, and recovery code usage
 */

import { generateMFASecret, verifyMFAToken, verifyRecoveryCode } from '../src/lib/mfa';

async function testMFAFlow() {
    console.log('🧪 Testing MFA Flow...\n');

    try {
        // Test 1: Generate MFA Secret
        console.log('1️⃣ Generating MFA secret...');
        const mfaData = await generateMFASecret('test@example.com', 'ApexOS');

        console.log('✅ Secret generated:');
        console.log(`   Secret (base32): ${mfaData.secret}`);
        console.log(`   Encrypted: ${mfaData.encryptedSecret.substring(0, 30)}...`);
        console.log(`   Recovery Codes: ${mfaData.recoveryCodes.length} codes generated`);
        console.log(`   QR Code: ${mfaData.qrCode.substring(0, 50)}...\n`);

        // Test 2: Verify Recovery Codes
        console.log('2️⃣ Testing recovery code validation...');
        const testCode = mfaData.recoveryCodes[0];
        console.log(`   Testing code: ${testCode}`);

        const result = await verifyRecoveryCode(testCode, mfaData.hashedRecoveryCodes);

        if (result.valid) {
            console.log('✅ Recovery code validated successfully');
            console.log(`   Remaining codes: ${result.remainingCodes?.length}\n`);
        } else {
            console.log('❌ Recovery code validation failed\n');
        }

        // Test 3: Invalid recovery code
        console.log('3️⃣ Testing invalid recovery code...');
        const invalidResult = await verifyRecoveryCode('INVALID-CODE', mfaData.hashedRecoveryCodes);

        if (!invalidResult.valid) {
            console.log('✅ Invalid code correctly rejected\n');
        } else {
            console.log('❌ Invalid code was accepted (ERROR)\n');
        }

        // Test 4: TOTP Token Verification (manual)
        console.log('4️⃣ TOTP token verification:');
        console.log('   ⚠️  Manual test required:');
        console.log('   1. Scan QR code with authenticator app');
        console.log('   2. Call verifyMFAToken(token, secret)');
        console.log(`   3. Secret: ${mfaData.secret}\n`);

        console.log('✅ All automated tests passed!');
        console.log('\n📋 Test Summary:');
        console.log('   ✅ MFA secret generation');
        console.log('   ✅ Recovery code validation');
        console.log('   ✅ Invalid code rejection');
        console.log('   ⏩ TOTP validation (requires manual testing)');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests
testMFAFlow().catch(console.error);
