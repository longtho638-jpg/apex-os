
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTransaction() {
    const email = 'billwill.mentor@gmail.com';

    // 1. Get User from public table
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error('❌ User not found in public.users:', userError?.message);
        return;
    }

    const userId = user.id;

    // 2. Get Wallet
    let { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', userId).single();

    if (!wallet) {
        console.log('Creating wallet...');
        const { data: newWallet, error: walletError } = await supabase
            .from('wallets')
            .insert({ user_id: userId, currency: 'USDT', balance: 1000 })
            .select()
            .single();

        if (walletError) {
            console.error('❌ Wallet creation failed:', walletError);
            return;
        }
        wallet = newWallet;
    }

    if (!wallet) {
        console.error('❌ Failed to get or create wallet');
        return;
    }

    console.log(`✅ Wallet ID: ${wallet.id}`);

    const statuses = ['completed', 'COMPLETED', 'pending', 'PENDING', 'success', 'SUCCESS', 'paid', 'PAID'];
    const provider = 'stripe'; // We know this is valid from previous run

    for (const status of statuses) {
        console.log(`👉 Trying status: '${status}' with provider='${provider}'...`);

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                type: 'deposit',
                amount: 1000,
                status: status,
                provider: provider
            })
            .select();

        if (!error) {
            console.log(`🎉 SUCCESS! Inserted with status='${status}' and provider='${provider}'.`);
            return;
        } else {
            console.log(`   ❌ Failed: ${error.message}`);
        }
    }
}

seedTransaction();
