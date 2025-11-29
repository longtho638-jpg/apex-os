import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class PaperTradingEngine {

    async createWallet(userId: string) {
        // Wallet creation now handled by atomic function
        const { data, error } = await supabase
            .from('paper_wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Wallet doesn't exist, will be created on first trade
            return null;
        }
        if (error) throw error;
        return data;
    }

    async getWallet(userId: string) {
        const { data, error } = await supabase
            .from('paper_wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data;
    }

    async executeTrade(
        userId: string,
        symbol: string,
        side: 'BUY' | 'SELL',
        quantity: number,
        price: number
    ) {
        // Call atomic Postgres function - eliminates race conditions
        const { data, error } = await supabase.rpc('execute_paper_trade', {
            p_user_id: userId,
            p_symbol: symbol,
            p_side: side,
            p_quantity: quantity,
            p_price: price
        });

        if (error) {
            // Parse Postgres exception messages
            if (error.message.includes('Insufficient paper balance')) {
                throw new Error('Insufficient paper balance');
            }
            if (error.message.includes('Insufficient position')) {
                throw new Error('Insufficient position to sell');
            }
            throw error;
        }

        return data;
    }
}
