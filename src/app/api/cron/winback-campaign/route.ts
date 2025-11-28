import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
// import { sendEmail } from '@/lib/email-service'; // Mocking this for now as service not fully setup
import { emailTemplates } from '@/lib/email-templates';

// Mock email sender
async function sendEmail(params: any) {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Mock Email Sent]', params);
    }
    // In prod, this would call Resend/SendGrid
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // Find users who canceled 7, 30, or 60 days ago
  const targetDays = [7, 30, 60];
  let emailsSent = 0;

  for (const days of targetDays) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const { data: churnedUsers } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier')
      .eq('subscription_status', 'canceled')
      .gte('canceled_at', `${targetDateStr}T00:00:00`)
      .lt('canceled_at', `${targetDateStr}T23:59:59`);

    if (!churnedUsers || churnedUsers.length === 0) continue;

    for (const user of churnedUsers) {
      // Check if we already sent win-back email
      const { data: existingEmail } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('email_type', 'winback')
        .single();

      if (existingEmail) continue;

      // TODO: Calculate profit missed (would need historical signal data)
      const profitMissed = Math.random() * 500 + 100; // Placeholder

      const template = emailTemplates.winBack(user.name || 'there', days, profitMissed);

      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      // Log email sent
      await supabase.from('email_logs').insert({
        user_id: user.id,
        email_type: 'winback',
        sent_at: new Date().toISOString(),
      });

      emailsSent++;
    }
  }

  return NextResponse.json({ success: true, emailsSent });
}
