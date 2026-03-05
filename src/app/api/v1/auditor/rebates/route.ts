import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  // Fetch rebate transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'FEE_REBATE') // Assuming 'FEE_REBATE' is the type for self-rebates
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let totalRebates = 0;
  const history =
    transactions?.map((tx) => {
      totalRebates += tx.amount;
      return {
        date: new Date(tx.created_at).toISOString().split('T')[0],
        exchange: (tx.metadata as any)?.exchange || 'ApexOS',
        amount: tx.amount,
        status: 'completed', // All logged transactions are completed
        trades_count: (tx.metadata as any)?.trades_count || 1,
      };
    }) || [];

  // Group by date for history if needed, but flat list is fine for now

  return NextResponse.json({
    total_rebates: totalRebates,
    monthly_average: totalRebates / 12, // Simple approximation
    rebate_history: history,
  });
}
