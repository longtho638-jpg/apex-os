import { type NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { emailTemplates } from '@/lib/email-templates';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Strict Rate Limiting (Cost DoS Prevention)

    // Check 60s Cooldown
    const COOLDOWN_KEY = `resend_cooldown:${email}`;
    const inCooldown = await redis.get(COOLDOWN_KEY);
    if (inCooldown) {
      return NextResponse.json(
        {
          error: 'Please wait 60 seconds before requesting another email.',
        },
        { status: 429 },
      );
    }

    // Check Hourly Limit (Max 5)
    const HOURLY_LIMIT_KEY = `resend_limit:${email}`;
    const attempts = await redis.incr(HOURLY_LIMIT_KEY);

    // Set expiry on first attempt
    if (attempts === 1) {
      await redis.expire(HOURLY_LIMIT_KEY, 3600); // 1 hour
    }

    if (attempts > 5) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 },
      );
    }

    // Set Cooldown
    await redis.set(COOLDOWN_KEY, '1', 'EX', 60);

    // 2. Generate Verification Link (Admin)
    const supabase = getSupabaseClient(); // Uses Service Role Key

    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: type || 'signup',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (linkError || !data.properties?.action_link) {
      logger.error('Supabase Generate Link Error:', linkError);
      return NextResponse.json({ error: 'Failed to generate verification link' }, { status: 400 });
    }

    // 3. Send Custom Email via Resend
    const actionLink = data.properties.action_link;

    let subject = '';
    let html = '';
    let templateId = '';

    if (type === 'recovery') {
      templateId = 'resetPassword';
      subject = emailTemplates.resetPassword.subject;
      html = emailTemplates.resetPassword.html(email.split('@')[0], actionLink);
    } else {
      templateId = 'verification';
      subject = emailTemplates.verification.subject;
      html = emailTemplates.verification.html(email.split('@')[0], actionLink);
    }

    // Fetch user ID for CRM logging
    const { data: userData } = await supabase.from('auth.users').select('id').eq('email', email).single();
    // Note: Direct access to auth.users might be restricted depending on RLS/Service Role.
    // Since we use getSupabaseClient() which uses Service Role, we can use admin.listUsers or similar.
    // Better: use admin api
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList.users.find((u) => u.email === email);
    const userId = user?.id;

    const { success, error: emailError } = await sendEmail({
      to: email,
      subject: subject,
      html: html,
      userId: userId,
      templateId: templateId,
    });

    if (!success) {
      logger.error('Resend Email Error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Custom email sent successfully' });
  } catch (error) {
    logger.error('Resend API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
