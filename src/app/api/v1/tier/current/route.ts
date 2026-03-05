import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/viral-economics/auth';
import { calculateUserTier } from '@/lib/viral-economics/tier-manager';

export async function GET(request: Request) {
  const userId = await authenticateRequest(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tier = await calculateUserTier(userId);
    return NextResponse.json({ tier });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch tier' }, { status: 500 });
  }
}
