import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // Find users active > 30 days on Monthly plan
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: users } = await supabase
    .from('subscriptions')
    .select('user_id, users(email, name)')
    .eq('billing_cycle', 'monthly')
    .eq('status', 'active')
    .lt('created_at', thirtyDaysAgo.toISOString())
    .limit(50); // Batch processing

  let sentCount = 0;

  if (users) {
    for (const sub of users) {
        // Check if upsell already sent
        const { data: log } = await supabase
            .from('email_logs')
            .select('id')
            .eq('user_id', sub.user_id)
            .eq('email_type', 'upsell_annual')
            .single();
            
        if (!log && sub.users) {
            const user: any = sub.users;
            // Send Upsell Email
            // Note: We'll define the template inline here for simplicity or use emailTemplates lib
            await sendEmail({
                to: user.email,
                subject: '🎁 Special Offer: Save 17% on ApexOS Annual',
                html: `
                    <h1>Happy 1st Month, ${user.name || 'Trader'}!</h1>
                    <p>You've been crushing it with ApexOS Pro.</p>
                    <p>Switch to the Annual plan today and get <strong>2 months FREE</strong> (save ~17%).</p>
                    <a href="https://apexrebate.com/pricing?upgrade=annual">Claim Offer</a>
                `
            });
            
            // Log it
            await supabase.from('email_logs').insert({
                user_id: sub.user_id,
                email_type: 'upsell_annual',
                sent_at: new Date().toISOString()
            });
            
            sentCount++;
        }
    }
  }

  return NextResponse.json({ success: true, sent: sentCount });
}
