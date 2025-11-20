"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Root Page - Smart Router
 * Redirects users based on authentication status:
 * - Logged in → /dashboard
 * - Not logged in → /landing
 */
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/landing');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF00] mx-auto mb-4"></div>
        <p className="text-gray-400">Loading ApexOS...</p>
      </div>
    </div>
  );
}
