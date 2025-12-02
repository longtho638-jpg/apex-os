import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

export class SystemStatsService {
    private supabase: SupabaseClient;

    constructor() {
        if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
            throw new Error('Missing Supabase configuration');
        }
        this.supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
    }

    /**
     * Aggregates high-level system stats for Admin Dashboard & Homepage
     */
    async getGlobalStats() {
        // 1. Active Users (Total count)
        const { count: userCount, error: userError } = await this.supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // 2. Total Volume (Sum of all filled orders)
        // Note: In a real large-scale app, this should be a pre-calculated materialized view
        const { data: orders, error: orderError } = await this.supabase
            .from('orders')
            .select('price, quantity')
            .eq('status', 'FILLED');

        if (orderError) throw orderError;

        const totalVolume = orders?.reduce((sum, order) => {
            return sum + (Number(order.price) * Number(order.quantity));
        }, 0) || 0;

        // 3. Revenue (Sum of subscription payments + commissions)
        // For now, we'll simulate this based on volume (e.g., 0.1% fee) + subscriptions
        // In production, query the 'payments' table
        const estimatedRevenue = totalVolume * 0.001;

        // 4. System Health Check
        // Simple check: Can we query the DB?
        const healthStatus = userCount !== null ? 'healthy' : 'degraded';

        return {
            activeUsers: userCount || 0,
            totalVolume,
            revenue: estimatedRevenue,
            systemHealth: healthStatus,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Get recent activity feed
     */
    async getRecentActivity(limit = 5) {
        // Combine recent orders and new users
        const { data: recentOrders } = await this.supabase
            .from('orders')
            .select('id, created_at, symbol, side, user_id')
            .order('created_at', { ascending: false })
            .limit(limit);

        const { data: newUsers } = await this.supabase
            .from('users')
            .select('id, created_at, email')
            .order('created_at', { ascending: false })
            .limit(limit);

        // Merge and sort
        const activities = [
            ...(recentOrders?.map(o => ({
                type: 'ORDER',
                text: `New ${o.side} order for ${o.symbol}`,
                time: o.created_at,
                icon: 'TrendingUp',
                color: 'text-emerald-400'
            })) || []),
            ...(newUsers?.map(u => ({
                type: 'USER',
                text: `New user joined`,
                time: u.created_at,
                icon: 'Users',
                color: 'text-blue-400'
            })) || [])
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, limit);

        return activities;
    }

    /**
     * Get detailed Trading stats for Admin Monitor & Homepage Ticker
     */
    async getTradingStats() {
        // Recent filled orders for the "Live Ticker"
        const { data: recentTrades } = await this.supabase
            .from('orders')
            .select('symbol, side, price, quantity, created_at')
            .eq('status', 'FILLED')
            .order('created_at', { ascending: false })
            .limit(10);

        // Volume by symbol (Simple aggregation)
        // In production, use RPC or materialized view
        const { data: volumeData } = await this.supabase
            .from('orders')
            .select('symbol, price, quantity')
            .eq('status', 'FILLED');

        const volumeBySymbol: Record<string, number> = {};
        volumeData?.forEach(o => {
            const vol = Number(o.price) * Number(o.quantity);
            volumeBySymbol[o.symbol] = (volumeBySymbol[o.symbol] || 0) + vol;
        });

        return {
            recentTrades,
            volumeBySymbol
        };
    }

    /**
     * Get Finance stats for Admin Treasury & Homepage Payouts
     */
    async getFinanceStats() {
        // Total Payouts (Withdrawals)
        const { data: withdrawals } = await this.supabase
            .from('wallet_transactions')
            .select('amount')
            .eq('type', 'WITHDRAWAL')
            .eq('status', 'COMPLETED');

        const totalPayouts = withdrawals?.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0) || 0;

        // Pending Withdrawals count
        const { count: pendingCount } = await this.supabase
            .from('wallet_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'WITHDRAWAL')
            .eq('status', 'PENDING');

        return {
            totalPayouts,
            pendingWithdrawals: pendingCount || 0
        };
    }

    /**
     * Get AI Signal stats for Admin Monitor & Homepage Win Rate
     */
    async getSignalStats() {
        // This assumes a 'trading_signals' table exists (it does per schema audit)
        const { data: signals } = await this.supabase
            .from('trading_signals')
            .select('result')
            .not('result', 'is', null)
            .limit(100);

        const total = signals?.length || 0;
        const wins = signals?.filter(s => s.result === 'WIN').length || 0;
        const winRate = total > 0 ? (wins / total) * 100 : 0;

        return {
            winRate,
            totalSignals: total
        };
    }
}
// Combine recent orders and new users
const { data: recentOrders } = await this.supabase
    .from('orders')
    .select('id, created_at, symbol, side, user_id')
    .order('created_at', { ascending: false })
    .limit(limit);

const { data: newUsers } = await this.supabase
    .from('users')
    .select('id, created_at, email')
    .order('created_at', { ascending: false })
    .limit(limit);

// Merge and sort
const activities = [
    ...(recentOrders?.map(o => ({
        type: 'ORDER',
        text: `New ${o.side} order for ${o.symbol}`,
        time: o.created_at,
        icon: 'TrendingUp',
        color: 'text-emerald-400'
    })) || []),
    ...(newUsers?.map(u => ({
        type: 'USER',
        text: `New user joined`,
        time: u.created_at,
        icon: 'Users',
        color: 'text-blue-400'
    })) || [])
].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit);

return activities;
    }
}
