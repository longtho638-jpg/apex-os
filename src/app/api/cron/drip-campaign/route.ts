import { type NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { emailTemplates } from '@/lib/email-templates';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  const today = new Date();
  let emailsSent = 0;

  // Define Drip Stages (Days since signup)
  const STAGES = [
    { day: 0, type: 'welcome', template: emailTemplates.welcome },
    { day: 2, type: 'feature_highlight', template: emailTemplates.featureHighlight }, // "Did you see this?"
    { day: 6, type: 'trial_ending', template: emailTemplates.trialEnding }, // "Trial Ending"
  ];

  for (const stage of STAGES) {
    // Calculate target date range for this stage
    // e.g. for Day 2, find users created between 48h and 72h ago?
    // Simplified: Find users created exactly 'day' days ago (ignoring time for simplicity, or use range)

    const targetDateStart = new Date();
    targetDateStart.setDate(today.getDate() - stage.day);
    targetDateStart.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date();
    targetDateEnd.setDate(today.getDate() - stage.day);
    targetDateEnd.setHours(23, 59, 59, 999);

    const { data: users } = await supabase
      .from('users')
      .select('id, email, name')
      .gte('created_at', targetDateStart.toISOString())
      .lte('created_at', targetDateEnd.toISOString());

    if (users) {
      for (const user of users) {
        // Check if already sent (idempotency)
        const { data: log } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('email_type', stage.type)
          .single();

        if (!log) {
          // Send Email
          // For Phase 11 requirements:
          // Day 0: Welcome (handled usually on signup, but cron adds redundancy or welcome series part 2)
          // Day 2: Khoe lãi (Feature Highlight in existing templates)
          // Day 6: Trial Ending (Existing template)

          // Note: emailTemplates structure in src/lib/email-templates.ts matches these types
          // But Day 2 needs to be specific "Did you see this?" logic if not already.
          // We'll use existing 'featureHighlight' for Day 2 as a proxy for "Did you see this/Win showcase".

          const template = stage.template; // This is an object { subject, html: (name) => ... }

          const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html(user.name || 'Trader', actionUrl),
          });

          // Log
          await supabase.from('email_logs').insert({
            user_id: user.id,
            email_type: stage.type,
            sent_at: new Date().toISOString(),
          });

          emailsSent++;
        }
      }
    }
  }

  return NextResponse.json({ success: true, sent: emailsSent });
}
