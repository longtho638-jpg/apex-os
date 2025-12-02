import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/security/crypto';
import { BinanceClient } from '@/lib/exchanges/binance';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { exchange, apiKey, apiSecret, label } = body;

        if (!exchange || !apiKey || !apiSecret) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // 1. Auth Check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify Key Live (Chỉ test Binance demo)
        if (exchange === 'binance') {
            const client = new BinanceClient(apiKey, apiSecret);
            try {
                await client.getAccountBalance(); // Nếu lỗi sẽ throw exception
            } catch (e: any) {
                return NextResponse.json({ success: false, message: 'Invalid API Key or Permissions' }, { status: 400 });
            }
        }

        // 3. Encrypt & Store
        const encryptedSecret = encrypt(apiSecret);

        const { error } = await supabase
            .from('user_exchange_keys')
            .upsert({
                user_id: user.id,
                exchange: exchange,
                api_key: apiKey,
                api_secret_encrypted: encryptedSecret,
                label: label || exchange,
                is_valid: true,
                last_synced_at: new Date().toISOString()
            }, { onConflict: 'user_id, exchange' });

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Exchange connected successfully' });

    } catch (error: any) {
        console.error('Connect Exchange Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
