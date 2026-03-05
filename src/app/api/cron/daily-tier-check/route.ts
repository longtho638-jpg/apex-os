import { type NextRequest, NextResponse } from 'next/server';
import { dailyTierCheck } from '@/lib/viral-economics/cron-jobs';

/**
 * RaaS Daily Tier Check Cron
 * Scans all users, promotes tiers based on 30-day trading volume,
 * and checks badge eligibility.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dailyTierCheck();
    return NextResponse.json({ success: true, job: 'daily-tier-check' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
