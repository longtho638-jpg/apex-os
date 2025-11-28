import { TradingService } from '../backend/services/trading';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../backend/config';

const supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);

async function runTest() {
    console.log('🚀 Starting Guardian Integration Test...');

    // 1. Get Test User
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
        console.error('❌ No users found.');
        process.exit(1);
    }
    const userId = users[0].id;

    // 1.1 Ensure Wallet has enough balance for Whale Test
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (wallet) {
        await supabase.from('wallets').update({ balance: 1000000 }).eq('id', wallet.id); // 1M USDT
        console.log('💰 Wallet topped up to 1M USDT for Whale Test');
    }

    const tradingService = new TradingService();
    const symbol = 'BTC/USDT';

    // 1.2 Clear existing positions to free up exposure
    const positions = await tradingService.getPositions(userId);
    if (positions.length > 0) {
        console.log(`🧹 Closing ${positions.length} existing positions...`);
        for (const pos of positions) {
            await tradingService.closePosition(userId, pos.id);
        }
        console.log('✅ All positions closed.');
    }

    // 2. Place Whale Order (> $100k)
    // Price approx 90k, so 2 BTC = 180k
    const quantity = 2.0;

    console.log(`\n1️⃣  Placing WHALE Order: ${quantity} ${symbol}...`);
    try {
        await tradingService.placeOrder(userId, symbol, 'BUY', quantity);
        console.log('✅ Order Placed. Waiting for Guardian to detect...');

        // Wait for async processing
        await new Promise(r => setTimeout(r, 2000));

        // 3. Check Alerts
        const { data: alerts } = await supabase
            .from('security_alerts')
            .select('*')
            .eq('type', 'WHALE_ALERT')
            .order('created_at', { ascending: false })
            .limit(1);

        if (alerts && alerts.length > 0) {
            const alert = alerts[0];
            // Check if recent (last 10 seconds)
            const alertTime = new Date(alert.created_at).getTime();
            if (Date.now() - alertTime < 10000) {
                console.log('✅ WHALE_ALERT Detected!');
                console.log(`   Message: ${alert.message}`);
                console.log(`   Severity: ${alert.severity}`);
            } else {
                console.warn('⚠️  Found alert but it might be old.');
            }
        } else {
            console.error('❌ No WHALE_ALERT found!');
        }

    } catch (error) {
        console.error('❌ Order Failed:', error);
    }

    process.exit(0);
}

runTest();
