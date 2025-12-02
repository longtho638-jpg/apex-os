import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seedData() {
    console.log('🌱 Seeding Real Dashboard Data...');

    // 1. Get or Create a Test User
    // We'll pick the first user in auth.users or create one
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    let userId;
    if (!users || users.length === 0) {
        console.log('No users found. Creating test user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'test_dashboard@apex.os',
            password: 'password123',
            email_confirm: true
        });
        if (createError) throw createError;
        userId = newUser.user.id;
    } else {
        userId = users[0].id;
        console.log(`Using existing user: ${users[0].email} (${userId})`);
    }

    // 2. Seed Wallet
    console.log('💰 Seeding User Wallet...');
    const { error: walletError } = await supabase.from('user_wallets').upsert({
        user_id: userId,
        balance_usd: 15420.50,
        total_earned: 2847.32,
        is_frozen: false
    }, { onConflict: 'user_id' });

    if (walletError) console.error('Wallet Seed Error:', walletError);

    // 3. Seed Trading Signals (for global stats)
    console.log('📊 Seeding Trading Signals...');
    const signals = [
        { symbol: 'BTC/USDT', type: 'long', entry_price: 95000, target_price: 98000, stop_loss: 94000, status: 'active' },
        { symbol: 'ETH/USDT', type: 'short', entry_price: 3500, target_price: 3200, stop_loss: 3600, status: 'active' },
        { symbol: 'SOL/USDT', type: 'long', entry_price: 180, target_price: 200, stop_loss: 170, status: 'closed' }
    ];

    const { error: signalError } = await supabase.from('trading_signals').insert(signals);
    if (signalError) console.log('Signal Seed Note: Signals might already exist or schema differs.', signalError.message);

    // 4. Seed Referral Network (Mock count)
    // We can't easily fake referrals without creating more auth users, 
    // but we can check if the count query works.
    // If you want to see referrals, you need to register more users and set their referrer_id.
    
    console.log('✅ Seeding Complete!');
    console.log('-----------------------------------');
    console.log('👉 Login with: test_dashboard@apex.os / password123 (or your existing login)');
    console.log('👉 Check Dashboard Overview to see real data.');
}

seedData().catch(console.error);
