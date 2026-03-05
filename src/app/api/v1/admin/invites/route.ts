import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const { data, error } = await supabase.from('invites').select('*').order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { count = 1 } = await req.json();

  const invites = Array.from({ length: count }).map(() => ({
    code: nanoid(10).toUpperCase(),
    is_used: false,
  }));

  const { data, error } = await supabase.from('invites').insert(invites).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
