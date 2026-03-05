'use client';

import { Activity, AlertTriangle, Bot, Key, List, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SECURITY_NAV_ITEMS = [
  { name: 'Admin Dashboard', path: '/admin', icon: Activity },
  { name: 'MFA Setup', path: '/admin/security/mfa/setup', icon: Key },
  { name: 'IP Whitelist', path: '/admin/security/ip-whitelist', icon: Shield },
  { name: 'Audit Logs', path: '/admin/security/audit-logs', icon: List },
  { name: 'Security Alerts', path: '/admin/security/alerts', icon: AlertTriangle },
  { name: 'Agent Status', path: '/admin/agents', icon: Bot },
];

export default function AdminSecuritySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-1">Admin Panel</h2>
        <p className="text-xs text-gray-500">Security Management</p>
      </div>

      <nav className="space-y-2">
        {SECURITY_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-white">System Status</span>
        </div>
        <p className="text-xs text-gray-500">All security features active</p>
      </div>
    </aside>
  );
}
