import { type NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service'; // Mock function from previous phase
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // Find active users who registered > 7 days ago and have 0 referrals
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Simplified query: active users, joined < 7 days ago
  // Ideally join with referral_codes table where total_referrals = 0
  const { data: users } = await supabase
    .from('users')
    .select('id, email, name')
    .lt('created_at', sevenDaysAgo.toISOString())
    .eq('status', 'active')
    .limit(50); // Batch limit

  let emailsSent = 0;

  if (users) {
    for (const user of users) {
      // Check referral count
      const { data: refCode } = await supabase
        .from('referral_codes')
        .select('code, total_referrals')
        .eq('user_id', user.id)
        .single();

      // If no code or 0 referrals, send reminder
      if (!refCode || refCode.total_referrals === 0) {
        // Check if already sent reminder recently (email_logs)
        const { data: sent } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('email_type', 'referral_reminder')
          .single();

        if (!sent) {
          const code = refCode?.code || 'GENERATE'; // In case they haven't generated one yet

          await sendEmail({
            to: user.email,
            subject: '💰 Earn 30% Commission - Share ApexOS',
            html: `
                    <h1>Want to trade for free?</h1>
                    <p>Invite 3 friends and earn up to 30% commission on their trading volume.</p>
                    <p>Your referral link: https://apexrebate.com/r/${code}</p>
                    <a href="https://apexrebate.com/dashboard/referrals">Go to Referral Dashboard</a>
                `,
          });

          await supabase.from('email_logs').insert({
            user_id: user.id,
            email_type: 'referral_reminder',
            sent_at: new Date().toISOString(),
          });

          emailsSent++;
        }
      }
    }
  }

  return NextResponse.json({ success: true, emailsSent });
}
