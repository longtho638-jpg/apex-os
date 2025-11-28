import { TradingService } from '../backend/services/trading';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runTest() {
    console.log('🚀 Starting Trading Logic Test...');

    // 1. Setup Test User
    // We'll pick the first user from the DB or create a dummy one if needed
    // For safety, let's try to find an existing user
    const { data: users } = await supabase.from('users').select('id').limit(1);

    if (!users || users.length === 0) {
        console.error('❌ No users found in DB to test with.');
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
        if (Number(wallet.balance) < 1000) {
            console.log('🔄 Top-up wallet to 100,000 USDT...');
            await supabase
                .from('wallets')
                .update({ balance: 100000 })
                .eq('id', wallet.id);
            console.log('✅ Wallet topped up');
        }
    }

    const tradingService = new TradingService();
    const symbol = 'BTC/USDT';
    const quantity = 0.1;

    try {
        // 2. Place Order
        console.log(`\n1️⃣  Placing MARKET BUY Order for ${quantity} ${symbol}...`);
        const { order, position } = await tradingService.placeOrder(userId, symbol, 'BUY', quantity);

        console.log('✅ Order Placed:', order.id);
        console.log('   Status:', order.status);
        console.log('   Fill Price:', order.price);
        console.log('✅ Position Created/Updated:', position.id);
        console.log('   Entry Price:', position.entry_price);
        console.log('   Quantity:', position.quantity);

        // 3. Check Positions & PnL
        console.log('\n2️⃣  Checking Open Positions...');
        const positions = await tradingService.getPositions(userId);
        const myPos = positions.find(p => p.id === position.id);

        if (myPos) {
            console.log('✅ Position Found');
            console.log('   Current Price:', myPos.current_price);
            console.log('   Unrealized PnL:', myPos.unrealized_pnl);
        } else {
            console.error('❌ Position not found in list!');
        }

        // 4. Close Position
        console.log('\n3️⃣  Closing Position...');
        const { position: closedPos, realizedPnL } = await tradingService.closePosition(userId, position.id);

        console.log('✅ Position Closed');
        console.log('   Close Price:', closedPos.current_price);
        console.log('   Realized PnL:', realizedPnL);

        console.log('\n🎉 Test Completed Successfully!');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

runTest();
