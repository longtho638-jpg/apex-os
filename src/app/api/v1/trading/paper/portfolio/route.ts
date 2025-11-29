import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();
  
  // In a real app, we'd get user from session
  // const { data: { user } } = await supabase.auth.getUser();
  // For CLI demo, assume user ID is passed in header or mock it
  const userId = req.headers.get('x-user-id');

  if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    // 1. Get Wallet
    let { data: wallet } = await supabase
      .from('virtual_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Create if not exists
    if (!wallet) {
        const { data: newWallet, error } = await supabase
            .from('virtual_wallets')
            .insert({ user_id: userId, balance: 100000.00 })
            .select()
            .single();
            
        if (error) throw error;
        wallet = newWallet;
    }

    // 2. Get Open Positions
    const { data: positions } = await supabase
      .from('virtual_positions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'OPEN');

    return NextResponse.json({
        wallet,
        positions: positions || []
    });

  } catch (error: any) {
    console.error('Paper Portfolio Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    // Reset Wallet Logic
    const supabase = getSupabaseClient();
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        // Fetch current reset count first
        const { data: currentWallet } = await supabase
            .from('virtual_wallets')
            .select('reset_count')
            .eq('user_id', userId)
            .single();

        const newResetCount = (currentWallet?.reset_count || 0) + 1;

        const { error } = await supabase
            .from('virtual_wallets')
            .update({ 
                balance: 100000.00, 
                reset_count: newResetCount,
                updated_at: new Date().toISOString() 
            })
            .eq('user_id', userId);

        if (error) throw error;

        // Close all positions
        await supabase
            .from('virtual_positions')
            .update({ status: 'CLOSED', closed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('status', 'OPEN');

        return NextResponse.json({ success: true, message: 'Wallet reset to $100k' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}