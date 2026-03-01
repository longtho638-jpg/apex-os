import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';
import { getTierByVolume, UNIFIED_TIERS } from '@apex-os/vibe-payment';

/**
 * RaaS Volume Milestone Nudge
 * Replaces SaaS upsell-tenure cron. Instead of pushing monthly→annual,
 * we nudge users who are close to the next tier threshold.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // Find users approaching next tier threshold (within 20% of upgrade)
  const { data: users } = await supabase
    .from('users')
    .select('user_id, email, full_name, monthly_volume, subscription_tier')
    .gt('monthly_volume', 0)
    .limit(100);

  let sentCount = 0;

  if (users) {
    for (const user of users) {
      const volume = Number(user.monthly_volume || 0);
      const currentTier = getTierByVolume(volume);
      const tierConfig = UNIFIED_TIERS[currentTier];

      // Skip Sovereign (already max tier)
      if (currentTier === 'SOVEREIGN') continue;

      const nextThreshold = tierConfig.monthlyVolumeMax;
      const progress = volume / nextThreshold;

      // Nudge when user is 80%+ toward next tier
      if (progress < 0.80) continue;

      // Check if nudge already sent this month
      const { data: log } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('email_type', 'volume_milestone_nudge')
        .gte('sent_at', new Date(new Date().setDate(1)).toISOString())
        .single();

      if (log) continue;

      const remaining = nextThreshold - volume;
      const nextTierName = currentTier === 'EXPLORER' ? 'Operator'
        : currentTier === 'OPERATOR' ? 'Architect' : 'Sovereign';

      await sendEmail({
        to: user.email,
        subject: `You're ${Math.round(progress * 100)}% to ${nextTierName} — unlock lower spreads`,
        html: `
          <h1>Almost there, ${user.full_name || 'Trader'}!</h1>
          <p>Your 30-day volume: <strong>$${volume.toLocaleString()}</strong></p>
          <p>Just <strong>$${remaining.toLocaleString()}</strong> more to unlock <strong>${nextTierName}</strong> tier.</p>
          <p>Benefits: Lower spread, higher rebates, more AI agents.</p>
          <a href="https://apexrebate.com/trading">Keep Trading →</a>
        `
      });

      await supabase.from('email_logs').insert({
        user_id: user.user_id,
        email_type: 'volume_milestone_nudge',
        sent_at: new Date().toISOString()
      });

      sentCount++;
    }
  }

  return NextResponse.json({ success: true, sent: sentCount });
}
