'use client';

import { BarChart3, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <Home className="h-6 w-6" />,
  },
  {
    href: '/trade',
    label: 'Trade',
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: <Shield className="h-6 w-6" />,
  },
];

export function Dock() {
  const pathname = usePathname();
  const _hoveredApp = null; // Simplified for now

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="glass flex h-16 items-center gap-4 rounded-2xl px-6 transition-all duration-300 hover:px-8 border border-white/10 bg-black/50 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110',
                isActive
                  ? 'bg-white/20 text-white shadow-lg shadow-white/10'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              )}
            >
              {item.icon}

              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 border border-white/10">
                {item.label}
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-2 h-1 w-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
