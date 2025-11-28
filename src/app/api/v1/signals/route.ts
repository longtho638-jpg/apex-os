import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('trading_signals')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error in signals API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

