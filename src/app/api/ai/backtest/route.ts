import { type NextRequest, NextResponse } from 'next/server';
import { runMomentumStrategy } from '@/lib/ai/engines/momentum';

export async function POST(req: NextRequest) {
  const { agentId, timeframe } = await req.json();

  // Mock Historical Data
  const prices = Array.from({ length: 30 }, (_, _i) => 50000 + Math.random() * 5000);

  // Run Strategy Simulation
  const _result = await runMomentumStrategy(prices);

  // Calculate Mock Performance
  const initialBalance = 10000;
  const finalBalance = initialBalance * (1 + (Math.random() * 0.2 - 0.05)); // -5% to +15%
  const roi = ((finalBalance - initialBalance) / initialBalance) * 100;
  const maxDrawdown = Math.random() * 10;

  return NextResponse.json({
    roi,
    maxDrawdown,
    sharpeRatio: 1.5 + Math.random(),
    trades: 12,
    winRate: 65 + Math.random() * 10,
  });
}
