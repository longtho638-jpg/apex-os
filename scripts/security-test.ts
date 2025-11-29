
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'verified_tester_1763873096775@apex.com'; 
// Note: We assume this user exists and has a valid password from previous steps.
// If not, the test setup might need to create a user or reset password.
const USER_PASSWORD = 'Admin123!@#'; 

describe('Security Regression Testing (Automated Audit)', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        // 1. Authenticate to get a valid token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key to sign in? No, use Public Anon for realistic test
        );
        
        // Actually, let's use the API endpoint to login if possible, or direct Supabase Auth
        // Direct Supabase Auth is more reliable for test setup
        const { data, error } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: USER_PASSWORD
        });

        if (error || !data.session) {
            throw new Error('Setup failed: Could not login to get token. ' + error?.message);
        }

        authToken = data.session.access_token;
        userId = data.user.id;
        console.log('✅ Setup: Authenticated as Tester. UserID:', userId);
    });

    // --- 1. Middleware & Access Control Tests ---

    it('🛑 Should block unauthorized access to /api/admin/config', async () => {
        // Try accessing without token
        const res = await fetch(`${BASE_URL}/api/v1/admin/config`, {
            method: 'GET',
        });
        expect(res.status).toBe(401); // Or 307 redirect to login, depending on middleware config
    });

    it('🛑 Should block "Bearer invalid_token" access', async () => {
        const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
            headers: { 'Authorization': 'Bearer invalid_token_123' }
        });
        expect([401, 403]).toContain(res.status);
    });

    // --- 2. IDOR Tests ---

    it('🛑 Should prevent IDOR on Order History', async () => {
        // Try to fetch orders for a random UUID (simulating another user)
        const victimId = '00000000-0000-0000-0000-000000000000';
        
        // Old vulnerable way: ?userId=...
        const res = await fetch(`${BASE_URL}/api/v1/trading/orders?userId=${victimId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // If fixed, it should either ignore the param and return MY orders (200), 
        // or return 403 Forbidden if it strictly validates param matching token.
        // But definitely NOT return the victim's orders.
        
        const data = await res.json();
        
        // Check that returned data does NOT belong to victimId
        if (Array.isArray(data) && data.length > 0) {
            data.forEach((order: any) => {
                expect(order.user_id).not.toBe(victimId);
                expect(order.user_id).toBe(userId); // Should match my ID
            });
        }
    });

    // --- 3. Webhook Security Tests ---

    it('🛑 Should reject Webhook without Signature', async () => {
        const res = await fetch(`${BASE_URL}/api/webhooks/polar`, {
            method: 'POST',
            body: JSON.stringify({ type: 'payment.succeeded', data: {} }),
            headers: { 'Content-Type': 'application/json' }
            // Missing 'Polar-Webhook-Signature' header
        });
        expect([400, 401, 403]).toContain(res.status);
    });

    it('🛑 Should reject Webhook with Invalid Signature', async () => {
        const res = await fetch(`${BASE_URL}/api/webhooks/polar`, {
            method: 'POST',
            body: JSON.stringify({ type: 'test' }),
            headers: { 
                'Content-Type': 'application/json',
                'Polar-Webhook-Signature': 'fake_signature_123' 
            }
        });
        expect([400, 401, 403]).toContain(res.status);
    });

    // --- 4. API Logic & Abuse Tests ---

    it('🛑 Should reject negative Leverage', async () => {
        const res = await fetch(`${BASE_URL}/api/v1/trade/position`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol: 'BTC/USD',
                side: 'long',
                amount: 100,
                leverage: -5 // Malicious input
            })
        });
        
        // 400 Bad Request (Validation Error) OR 403 Forbidden (Permission Denied) are both SECURE.
        // 200 OK would be INSECURE.
        expect([400, 403]).toContain(res.status);
    });

    it('🛑 Should reject extremely high Leverage', async () => {
        const res = await fetch(`${BASE_URL}/api/v1/trade/position`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol: 'BTC/USD',
                side: 'long',
                amount: 100,
                leverage: 9999 // Attack
            })
        });
        expect([400, 403]).toContain(res.status);
    });

    // --- 5. User Enumeration ---
    
    it('🛑 Should NOT reveal if email exists on Signup', async () => {
        // Use the admin email which definitely exists
        const res = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: 'NewPassword123!'
            })
        });

        const data = await res.json();
        // The response message should be generic
        // Bad: "Email already exists"
        // Good: "If user exists, email sent" or generic 400
        
        // For this test, we just want to ensure it doesn't explicitly say "exists"
        // Note: This expectation depends on your fix implementation.
        // If you implemented generic message, status might be 200 or 400.
        // Let's warn if body contains "already exists"
        if (res.status === 400 || res.status === 409) {
             expect(JSON.stringify(data).toLowerCase()).not.toContain('already exists');
        }
    });

});
