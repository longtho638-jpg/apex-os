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

async function tamper() {
    console.log('😈 Tampering with Financial Data...');

    // 1. Get the wallet
    const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .limit(1)
        .single();

    if (walletError) {
        console.error('❌ Failed to fetch wallet:', walletError);
        return;
    }

    console.log(`Current Balance: ${wallet.balance}`);

    // 2. Modify balance WITHOUT transaction
    const newBalance = wallet.balance + 1;

    const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

    if (updateError) {
        console.error('❌ Failed to tamper wallet:', updateError);
        return;
    }

    console.log(`✅ Tampered Wallet: ${wallet.id}`);
    console.log(`New Balance: ${newBalance} (Should be ${wallet.balance})`);
    console.log('EXPECTED: Auditor Agent should detect a mismatch of 1.0');
}

tamper().catch(console.error);
