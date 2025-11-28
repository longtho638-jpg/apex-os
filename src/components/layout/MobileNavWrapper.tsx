'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MobileNav } from './MobileNav';

export function MobileNavWrapper() {
  const pathname = usePathname();
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    // Show on dashboard and landing pages, hide on login/signup
    const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup');
    setShowMobileNav(!isAuthPage);
  }, [pathname]);

  if (!showMobileNav) return null;

  return <MobileNav />;
}
