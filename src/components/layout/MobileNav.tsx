'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, BarChart2, User } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  
  const NAV_ITEMS = [
    { icon: Home, label: 'Home', path: '/en/landing' },
    { icon: Activity, label: 'Signals', path: '/en/dashboard/signals' },
    { icon: BarChart2, label: 'Dashboard', path: '/en/dashboard/overview' },
    { icon: User, label: 'Profile', path: '/en/settings' },
  ];

  // Hide on desktop
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.includes(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
