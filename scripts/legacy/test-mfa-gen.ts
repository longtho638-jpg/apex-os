// Test MFA Secret Generation
// Run: node scripts/test-mfa-gen.js

require('dotenv').config({ path: '.env.local' });
const { generateMFASecret } = require('../src/lib/mfa');

async function test() {
    console.log('Testing generateMFASecret...');
    try {
        const mfaData = await generateMFASecret('test@example.com');
        console.log('Secret:', mfaData.secret);
        console.log('Encrypted Secret:', mfaData.encryptedSecret);

        if (mfaData.secret === mfaData.encryptedSecret) {
            console.error('❌ FAIL: Encrypted secret matches plain secret!');
        } else if (mfaData.encryptedSecret.includes(':')) {
            console.log('✅ PASS: Encrypted secret looks correct (contains :)');
        } else {
            console.error('❌ FAIL: Encrypted secret does not look like salt:iv:tag:cipher format');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
