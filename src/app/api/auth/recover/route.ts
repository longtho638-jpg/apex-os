import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';
import { emailTemplates } from '@/lib/email-templates';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Rate Limiting (Prevent Abuse)
        const RATE_LIMIT_KEY = `recover_limit:${email}`;
        const attempts = await redis.incr(RATE_LIMIT_KEY);
        if (attempts === 1) {
            await redis.expire(RATE_LIMIT_KEY, 3600); // 1 hour
        }
        if (attempts > 3) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        // 2. Generate Recovery Link (Admin)
        const supabase = getSupabaseClient(); // Service Role

        // Ensure the redirect URL is properly encoded
        const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`);
        redirectUrl.searchParams.set('next', '/dashboard/settings/security');

        console.log('[Auth] Generating recovery link for:', email);
        console.log('[Auth] Redirect URL:', redirectUrl.toString());

        const { data, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: redirectUrl.toString()
            }
        });

        if (linkError || !data.properties?.action_link) {
            console.error('[Auth] Generate Link Error:', linkError);
            // Return success even if failed to prevent user enumeration (security best practice)
            // But for debugging/this context, we might want to know. 
            // Let's return a generic error if it's a system issue, but success if user not found (to mimic standard auth)
            // Actually, admin.generateLink might error if user doesn't exist? 
            // Documentation says it returns error.
            return NextResponse.json({ success: true, message: 'If an account exists, a recovery email has been sent.' });
        }

        // 3. Send Custom Email via Resend
        const actionLink = data.properties.action_link;
        const template = emailTemplates.resetPassword;

        // Fetch user ID for CRM logging
        const { data: userList } = await supabase.auth.admin.listUsers();
        const user = userList.users.find(u => u.email === email);
        const userId = user?.id;

        const { success, error: emailError } = await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html(email.split('@')[0], actionLink),
            userId: userId,
            templateId: 'resetPassword'
        });

        if (!success) {
            console.error('[Auth] Send Email Error:', emailError);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Recovery email sent' });

    } catch (error) {
        console.error('[Auth] Recovery Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
