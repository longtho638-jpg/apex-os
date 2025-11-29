import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';

    if (code) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        try {
            await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
            console.error('Auth Callback Error:', error);
            // Redirect to error page or login with error
            return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`);
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
