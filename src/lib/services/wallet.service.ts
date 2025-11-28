import { createClient } from '@supabase/supabase-js';
import { Wallet, Transaction, Withdrawal, PaymentMethod } from '@/types/finance';
import { eventBus } from '@/lib/agent/event-bus';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export class WalletService {
    /**
     * Get or create user wallet
     */
    static async getWallet(userId: string, currency: string = 'USDT'): Promise<Wallet> {
        const { data, error } = await supabaseAdmin
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .eq('currency', currency)
            .single();

        if (error && error.code === 'PGRST116') {
            // Create if not exists
            const { data: newWallet, error: createError } = await supabaseAdmin
                .from('wallets')
                .insert({ user_id: userId, currency })
                .select()
                .single();

            if (createError) throw createError;
            return newWallet;
        }

        if (error) throw error;
        return data;
    }

    /**
     * Get transaction history
     */
    static async getTransactions(userId: string, walletId: string, limit = 20, offset = 0): Promise<Transaction[]> {
        const { data, error } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('wallet_id', walletId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];
    }

    /**
     * Get payment methods
     */
    static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
        const { data, error } = await supabaseAdmin
            .from('payment_methods')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Add payment method
     */
    static async addPaymentMethod(userId: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        const { data: method, error } = await supabaseAdmin
            .from('payment_methods')
            .insert({ ...data, user_id: userId })
            .select()
            .single();

        if (error) throw error;
        return method;
    }

    /**
     * Request withdrawal
     */
    static async requestWithdrawal(userId: string, amount: number, paymentMethodId: string): Promise<Withdrawal> {
        // 1. Get Payment Method details
        const { data: pm, error: pmError } = await supabaseAdmin
            .from('payment_methods')
            .select('*')
            .eq('id', paymentMethodId)
            .eq('user_id', userId)
            .single();

        if (pmError || !pm) throw new Error('Invalid payment method');

        // 2. Get Wallet
        const wallet = await this.getWallet(userId, 'USDT');

        // 3. Create Withdrawal (Trigger will handle balance deduction)
        // Note: We rely on DB trigger for atomicity of deduction
        const { data: withdrawal, error } = await supabaseAdmin
            .from('withdrawals')
            .insert({
                user_id: userId,
                wallet_id: wallet.id,
                amount,
                fee: 0, // Logic for fee calculation can be added here
                net_amount: amount, // - fee
                currency: 'USDT',
                status: 'pending',
                payment_method_snapshot: pm.details
            })
            .select()
            .single();

        if (error) throw error;

        // 4. Publish Event for Ops Agent
        await eventBus.publish('WITHDRAWAL_REQUEST', 'wallet_service', {
            withdrawal_id: withdrawal.id,
            amount: withdrawal.amount,
            user_id: userId
        });

        return withdrawal;
    }
}
