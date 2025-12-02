import { createClient } from '@supabase/supabase-js';

export class SystemStatsService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getGlobalStats() {
    // 1. Active Users
    const { count: userCount } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 2. Total Volume
    const { data: orders } = await this.supabase
      .from('orders')
      .select('price, quantity')
      .eq('status', 'FILLED');

    const totalVolume = orders?.reduce((sum, order) => {
      return sum + (Number(order.price) * Number(order.quantity));
    }, 0) || 0;

    // 3. Revenue (Trading Fees + Withdrawal Fees)
    // Assuming 0.1% trading fee
    const revenue = totalVolume * 0.001;

    return {
      activeUsers: userCount || 0,
      totalVolume,
      revenue,
      systemHealth: 'healthy',
      lastUpdated: new Date().toISOString()
    };
  }

  async getRecentActivity(limit = 10) {
    const { data: orders } = await this.supabase
      .from('orders')
      .select('id, symbol, side, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(limit);

    return orders?.map(o => ({
      type: 'ORDER',
      text: `New ${o.side} order for ${o.symbol}`,
      time: o.created_at,
      icon: 'TrendingUp',
      color: 'text-emerald-400'
    })) || [];
  }

  async getTradingStats() {
    const { data: orders } = await this.supabase
      .from('orders')
      .select('symbol, price, quantity')
      .eq('status', 'FILLED');

    const volumeBySymbol: Record<string, number> = {};
    orders?.forEach(o => {
      const vol = Number(o.price) * Number(o.quantity);
      volumeBySymbol[o.symbol] = (volumeBySymbol[o.symbol] || 0) + vol;
    });

    return { volumeBySymbol };
  }

  async getFinanceStats() {
    const { data: txs } = await this.supabase
      .from('transactions')
      .select('type, amount');

    const deposits = txs?.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const withdrawals = txs?.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Pending commissions
    const { data: commissions } = await this.supabase
      .from('commissions')
      .select('amount');

    const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    return { deposits, withdrawals, totalCommissions };
  }

  async getSignalStats() {
    // Mock for now, or fetch from signals table if it exists
    return {
      totalSignals: 124,
      winRate: 78.5,
      activeSignals: 12
    };
  }
}
