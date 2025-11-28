// Vercel Cron Job - runs daily
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';
import { emailTemplates } from '@/lib/email-templates';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // Get users in trial (trial_ends_at > now)
  const { data: users } = await supabase
    .from('users')
    .select('id, email, name, created_at, trial_ends_at')
    .not('trial_ends_at', 'is', null)
    .gte('trial_ends_at', new Date().toISOString());

  const now = new Date();
  let emailsSent = 0;

  for (const user of users || []) {
    const signupDate = new Date(user.created_at);
    const daysActive = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

    let emailData = null;

    // Day 2: Feature highlight
    if (daysActive === 2) {
      emailData = {
        to: user.email,
        subject: emailTemplates.featureHighlight.subject,
        html: emailTemplates.featureHighlight.html(user.name || 'there'),
      };
    }

    // Day 6: Trial ending
    else if (daysActive === 6) {
      emailData = {
        to: user.email,
        subject: emailTemplates.trialEnding.subject,
        html: emailTemplates.trialEnding.html(user.name || 'there'),
      };
    }

    if (emailData) {
      await sendEmail(emailData);
      emailsSent++;
    }
  }

  return NextResponse.json({
    success: true,
    emailsSent,
    usersProcessed: users?.length || 0,
  });
}
