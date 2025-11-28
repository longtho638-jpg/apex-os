import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Seeding Financial Data...');

    // 1. Create a dummy user (if not exists)
    const email = `test_user_${Date.now()}@example.com`;
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true
    });

    if (userError) {
        console.error('❌ Failed to create user:', userError);
        return;
    }

    console.log(`✅ Created User: ${user.user.id} (${email})`);

    // 1.5 Ensure user exists in public.users (if not handled by trigger)
    const { error: publicUserError } = await supabase
        .from('users')
        .upsert({
            id: user.user.id,
            email: email,
            full_name: 'Test User'
            // role: 'user' -- Removing to use default or avoid constraint error
        });

    if (publicUserError) {
        console.error('❌ Failed to create public user:', publicUserError);
        // Continue anyway, maybe it exists?
    } else {
        console.log(`✅ Upserted public user: ${user.user.id}`);
    }

    // 2. Create a Wallet
    const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .insert({
            user_id: user.user.id,
            currency: 'USDT',
            balance: 1000.00 // Initial balance
        })
        .select()
        .single();

    if (walletError) {
        console.error('❌ Failed to create wallet:', walletError);
        return;
    }

    console.log(`✅ Created Wallet: ${wallet.id} (Balance: 1000 USDT)`);

    // 3. Create Transactions (Sum should match 1000)
    // Deposit 1500
    await supabase.from('transactions').insert({
        wallet_id: wallet.id,
        type: 'DEPOSIT',
        amount: 1500.00,
        status: 'COMPLETED'
    });

    // Withdrawal 500
    await supabase.from('transactions').insert({
        wallet_id: wallet.id,
        type: 'WITHDRAWAL',
        amount: 500.00,
        status: 'COMPLETED'
    });

    console.log('✅ Created Transactions: +1500 (Deposit), -500 (Withdrawal)');
    console.log('Expected Result: Balance (1000) == Tx Sum (1000)');
}

seed().catch(console.error);
