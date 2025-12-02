'use client';

import Link from 'next/link';
import { NAV_ITEMS } from '@/config/navigation';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname();

  const mobileIds = ['overview', 'signals', 'trade', 'wallet', 'settings'];
  const navItems = mobileIds.map(id => NAV_ITEMS.find(item => item.id === id)).filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          if (!item) return null;
          const Icon = item.icon;
          const isActive = pathname?.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1'}`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}