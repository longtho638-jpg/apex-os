import { TradingService } from '../backend/services/trading';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runRiskTest() {
    console.log('🚀 Starting Risk Management Test...');

    // 1. Get Test User
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
        console.error('❌ No users found.');
        process.exit(1);
    }
    const userId = users[0].id;
    console.log(`👤 Testing with User ID: ${userId}`);

    // 1.1 Ensure User has a Wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!wallet) {
        console.log('💰 Creating new wallet for user...');
        const { error: walletError } = await supabase
            .from('wallets')
            .insert({
                user_id: userId,
                balance: 100000,
                currency: 'USDT',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (walletError) {
            console.error('❌ Failed to create wallet:', walletError);
            process.exit(1);
        }
        console.log('✅ Wallet created with 100,000 USDT');
    } else {
        console.log(`💰 Wallet found. Balance: ${wallet.balance}`);
        if (Number(wallet.balance) < 100000) {
            console.log('🔄 Top-up wallet to 100,000 USDT for risk test...');
            await supabase
                .from('wallets')
                .update({ balance: 100000 })
                .eq('id', wallet.id);
            console.log('✅ Wallet topped up');
        }
    }

    // 2. Initialize Service
    const tradingService = new TradingService();

    // 3. Attempt to place a HUGE order
    // Assuming mock balance is 100,000 USDT (default in TradingService if no wallet)
    // We try to buy 100 BTC (approx $9,000,000 value)
    const symbol = 'BTC/USDT';
    const quantity = 100;

    console.log(`\n1️⃣  Attempting to buy ${quantity} ${symbol} (Value > $8M)...`);
    console.log('   Expected Result: Order REJECTED due to insufficient margin/exposure limit.');

    try {
        await tradingService.placeOrder(userId, symbol, 'BUY', quantity);
        console.error('❌ TEST FAILED: Order was accepted but should have been rejected!');
    } catch (error: any) {
        console.log('\n✅ TEST PASSED: Order was rejected as expected.');
        console.log(`   Error Message: "${error.message}"`);

        if (error.message.includes('Risk Check Failed')) {
            console.log('   Reason: Risk limits enforced successfully.');
        } else {
            console.warn('   ⚠️  Warning: Rejected but maybe for a different reason?');
        }
    }
}

runRiskTest();
