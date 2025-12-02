'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
    if (code) {
      // 1. Set in LocalStorage (Persistent)
      localStorage.setItem('referral_code', code);

      // 2. Set in Cookie (For Server/Middleware access if needed)
      document.cookie = `referral_code=${code}; path=/; max-age=2592000`; // 30 days

      // 3. Redirect to Signup
      router.push(`/signup?ref=${code}`);
    } else {
      router.push('/');
    }
  }, [code, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black text-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent animate-spin" />
        <p className="text-zinc-400 font-mono">Applying Referral Code: <span className="text-emerald-400 font-bold">{code}</span></p>
      </div>
    </div>
  );
}
