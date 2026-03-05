import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for API Keys
  return NextResponse.json([
    {
      id: 'key_1',
      exchange: 'binance',
      label: 'Main Account',
      created_at: '2024-01-15T10:00:00Z',
      last_used_at: new Date().toISOString(),
    },
    {
      id: 'key_2',
      exchange: 'okx',
      label: 'Hedging Bot',
      created_at: '2024-02-20T14:30:00Z',
      last_used_at: null,
    },
  ]);
}

export async function POST(request: Request) {
  const _data = await request.json();
  return NextResponse.json({
    success: true,
    key_id: `key_${Date.now()}`,
    message: 'API key added successfully',
  });
}
