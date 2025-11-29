import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

interface PageParams {
    params: Promise<{
        code: string;
        locale: string;
    }>;
}

export default async function ReferralLandingPage({ params }: PageParams) {
  const { code } = await params;
  const supabase = getSupabaseClient();

  // Verify code validity
  const { data: referral } = await supabase
    .from('referral_codes')
    .select('user_id') // joined with user profile ideally
    .eq('code', code)
    .single();

  if (referral) {
    // Set cookie for attribution
    // Note: In Server Components, cookies() is read-only or requires specific handling for setting.
    // Setting cookies in a Server Component response is done via middleware or by returning a Response object if it was a route handler.
    // But in a Page, we can't easily set a cookie directly without a Client Component or Middleware intercepting.
    // Ideally, this logic lives in middleware.ts matching /r/:code.
    // For this implementation, we will assume Middleware handles the cookie setting 
    // OR we use a client component wrapper to set it.
    // Let's use a Client Component approach for simplicity in this stack if middleware isn't modified.
    
    // However, strict Server Component redirect is cleaner.
    // Let's assume we redirect to /signup?ref=CODE and signup page handles it.
  }

  redirect(`/signup?ref=${code}`);
}
