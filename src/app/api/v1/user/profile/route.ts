import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Mock data for User Profile
  return NextResponse.json(
    {
      email: 'demo@apexrebate.com',
      display_name: 'Demo Trader',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },
  );
}

export async function PUT(request: Request) {
  const data = await request.json();
  return NextResponse.json({
    email: 'demo@apexrebate.com',
    display_name: data.display_name || 'Demo Trader',
    avatar_url: data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    created_at: '2024-01-01T00:00:00Z',
  });
}
