import { NextResponse } from 'next/server';
import { createReferralLink } from '@/lib/viral-economics/referral-manager';
import { authenticateRequest } from '@/lib/viral-economics/auth';

export async function GET(request: Request) {
  const userId = await authenticateRequest(request);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const link = await createReferralLink(userId);
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
  }
}
