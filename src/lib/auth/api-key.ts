import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import { decrypt } from '@/lib/security/encryption';

export async function verifyApiKey(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key');
    const signature = request.headers.get('x-api-signature');
    const timestamp = request.headers.get('x-api-timestamp');
    const method = request.method;
    const path = request.nextUrl.pathname;

    if (!apiKey || !signature || !timestamp) {
        return { success: false, error: 'Missing API Key headers', status: 401 };
    }

    // 1. Check Timestamp (Replay Attack Protection) - 30s window
    const now = Date.now();
    const reqTime = parseInt(timestamp, 10);
    if (isNaN(reqTime) || Math.abs(now - reqTime) > 30000) {
        return { success: false, error: 'Request timestamp expired', status: 401 };
    }

    // 2. Fetch Secret from DB
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('user_id, secret_key, permissions, is_active')
        .eq('access_key', apiKey)
        .single();

    if (error || !keyData || !keyData.is_active) {
        return { success: false, error: 'Invalid API Key', status: 401 };
    }

    // 3. Verify Signature
    let body = '';
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        try {
            body = await request.clone().text();
        } catch (e) {
            // Body might be already consumed?
        }
    }

    // Construct payload: timestamp + method + path + body
    const payload = `${timestamp}${method.toUpperCase()}${path}${body}`;

    // Decrypt the secret key
    let secretKey = keyData.secret_key;
    try {
        // If it looks encrypted (contains colons), decrypt it
        if (secretKey.includes(':')) {
            secretKey = decrypt(secretKey);
        }
    } catch (e) {
        logger.error('Failed to decrypt API key:', e);
        return { success: false, error: 'Internal Server Error', status: 500 };
    }

    const expectedSignature = createHmac('sha256', secretKey)
        .update(payload)
        .digest('hex');

    if (expectedSignature !== signature) {
        return { success: false, error: 'Invalid Signature', status: 401 };
    }

    // 4. Update Usage (Async - don't await)
    supabase.from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('access_key', apiKey)
        .then();

    return {
        success: true,
        userId: keyData.user_id,
        permissions: keyData.permissions
    };
}
