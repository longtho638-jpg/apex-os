import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const days = parseInt(searchParams.get('days') || '30');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch transactions (Realized PnL)
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .in('type', ['TRADE_PROFIT', 'TRADE_LOSS', 'COMMISSION', 'FEE']); // Include fees/commissions for Net PnL

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process Data
    let totalPnl = 0;
    let wins = 0;
    let losses = 0;
    const dailyMap: Record<string, number> = {};
    const symbolMap: Record<string, { pnl: number, trades: number, wins: number }> = {};

    transactions?.forEach(tx => {
        const amount = tx.amount;
        totalPnl += amount;

        // Daily PnL
        const date = new Date(tx.created_at).toISOString().split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + amount;

        // Win/Loss (Only count actual trades, not fees)
        if (tx.type === 'TRADE_PROFIT') wins++;
        if (tx.type === 'TRADE_LOSS') losses++;

        // Symbol Breakdown (Parse metadata)
        // Assuming metadata has { symbol: 'BTC/USDT' }
        const symbol = (tx.metadata as any)?.symbol || 'UNKNOWN';
        if (!symbolMap[symbol]) symbolMap[symbol] = { pnl: 0, trades: 0, wins: 0 };

        symbolMap[symbol].pnl += amount;
        if (tx.type === 'TRADE_PROFIT' || tx.type === 'TRADE_LOSS') {
            symbolMap[symbol].trades++;
            if (tx.type === 'TRADE_PROFIT') symbolMap[symbol].wins++;
        }
    });

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    // Format Daily PnL
    const dailyPnl = Object.entries(dailyMap)
        .map(([date, pnl]) => ({ date, pnl }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Format Trade Breakdown
    const tradeBreakdown = Object.entries(symbolMap)
        .map(([symbol, stats]) => ({
            symbol,
            pnl: stats.pnl,
            trades: stats.trades,
            win_rate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
        }))
        .sort((a, b) => b.pnl - a.pnl);

    const bestPair = tradeBreakdown.length > 0 ? tradeBreakdown[0].symbol : 'N/A';
    const worstPair = tradeBreakdown.length > 0 ? tradeBreakdown[tradeBreakdown.length - 1].symbol : 'N/A';

    return NextResponse.json({
        total_pnl: totalPnl,
        win_rate: winRate,
        total_trades: totalTrades,
        best_pair: bestPair,
        worst_pair: worstPair,
        daily_pnl: dailyPnl,
        trade_breakdown: tradeBreakdown
    });
}
