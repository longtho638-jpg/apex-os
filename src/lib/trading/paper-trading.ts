import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class PaperTradingEngine {
    
    async createWallet(userId: string) {
        const { data, error } = await supabase
            .from('paper_wallets')
            .insert({ user_id: userId, balance_usdt: 100000 })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async getWallet(userId: string) {
        const { data, error } = await supabase
            .from('paper_wallets')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) return null; // Or create one
        return data;
    }

    async executeTrade(userId: string, symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number) {
        // 1. Get Wallet
        let wallet = await this.getWallet(userId);
        if (!wallet) wallet = await this.createWallet(userId);

        const cost = quantity * price;

        // 2. Validate Balance (for BUY) or Position (for SELL)
        if (side === 'BUY') {
            if (wallet.balance_usdt < cost) throw new Error('Insufficient paper balance');
            
            // Deduct Balance
            await supabase.from('paper_wallets').update({ 
                balance_usdt: wallet.balance_usdt - cost 
            }).eq('id', wallet.id);

            // Update/Create Position
            const { data: pos } = await supabase.from('paper_positions')
                .select('*')
                .eq('wallet_id', wallet.id)
                .eq('symbol', symbol)
                .single();

            if (pos) {
                const newQty = pos.quantity + quantity;
                const totalCost = (pos.quantity * pos.average_entry_price) + cost;
                const newAvg = totalCost / newQty;
                await supabase.from('paper_positions').update({
                    quantity: newQty,
                    average_entry_price: newAvg
                }).eq('id', pos.id);
            } else {
                await supabase.from('paper_positions').insert({
                    wallet_id: wallet.id,
                    symbol,
                    quantity,
                    average_entry_price: price
                });
            }
        } else {
            // SELL Logic
            const { data: pos } = await supabase.from('paper_positions')
                .select('*')
                .eq('wallet_id', wallet.id)
                .eq('symbol', symbol)
                .single();
            
            if (!pos || pos.quantity < quantity) throw new Error('Insufficient position');

            const revenue = quantity * price;
            const entryCost = quantity * pos.average_entry_price;
            const realizedPnl = revenue - entryCost;

            // Update Balance
            await supabase.from('paper_wallets').update({ 
                balance_usdt: wallet.balance_usdt + revenue 
            }).eq('id', wallet.id);

            // Update Position
            if (pos.quantity === quantity) {
                await supabase.from('paper_positions').delete().eq('id', pos.id);
            } else {
                await supabase.from('paper_positions').update({
                    quantity: pos.quantity - quantity
                }).eq('id', pos.id);
            }

            // Record Trade with PnL
            await supabase.from('paper_trades').insert({
                wallet_id: wallet.id,
                symbol,
                side,
                type: 'MARKET', // Simplified
                quantity,
                price,
                pnl: realizedPnl
            });

            return { status: 'FILLED', pnl: realizedPnl };
        }

        // Record Trade (BUY)
        const { data: trade } = await supabase.from('paper_trades').insert({
            wallet_id: wallet.id,
            symbol,
            side,
            type: 'MARKET', // Simplified
            quantity,
            price
        }).select().single();

        return trade;
    }
}
