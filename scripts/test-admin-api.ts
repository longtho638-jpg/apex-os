
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🚀 Testing Admin API...');

    // Dynamically import jwt to ensure env vars are loaded
    const { generateSessionToken } = await import('../src/lib/jwt');

    // 1. Generate a valid token
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    const token = generateSessionToken('test@example.com', 'super_admin', mockUserId);

    console.log('Generated Token:', token.substring(0, 20) + '...');

    // 2. Make the request
    try {
        const response = await fetch('http://localhost:3000/api/v1/admin/providers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.status === 401) {
            console.error('❌ Test Failed: Still getting 401 Unauthorized');
        } else if (response.status === 403) {
            console.log('✅ JWT Verified! (Got 403 as expected for fake user)');
        } else if (response.status === 200) {
            console.log('✅ Success! (Got 200 OK)');
        } else {
            console.log('⚠️ Unexpected status code');
        }

    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

main();
