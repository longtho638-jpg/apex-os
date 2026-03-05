'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/os/sidebar';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { SupportChat } from '@/components/support/SupportChat';
import { WinStreakPopup } from '@/components/upsell/WinStreakPopup';
import { NAV_ITEMS } from '@/config/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Import Sidebar dynamically or at top
  // We need to import Sidebar from '@/components/os/sidebar'

  return (
    <div className="flex h-screen w-full bg-[#030303] overflow-hidden">
      {/* Mobile menu button - Keep for now if needed, or rely on MobileNav */}
      {/* For this refactor, we focus on Desktop unification. 
                We will hide the Sidebar on mobile and show it on desktop.
            */}

      <div className="hidden lg:flex h-full p-4 pr-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Slide-over) - Optional, reusing Sidebar might need styling adjustments.
                For now, let's keep the existing mobile sidebar logic BUT use the Sidebar component if possible, 
                or just keep the simple one for mobile to avoid breaking it. 
                Actually, let's use the simple one for mobile for safety, or just rely on MobileNav.
                The user complaint was about "From this Page downwards", implying desktop list.
            */}

      {/* Mobile sidebar overlay & content - simplified for now, assuming MobileNav is primary */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full bg-[#0A0A0A] z-50 overflow-y-auto">
            {/* We can put a simple menu here or the Sidebar component without margins */}
            <div className="p-4">
              <nav className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const href = `/${locale}${item.href}`;
                  const isActive = pathname === href || pathname?.startsWith(`${href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400'}`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-white">
            <Menu size={24} />
          </button>
          <span className="font-bold text-white">ApexOS</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Desktop Header - if needed, or let pages handle it. 
                    Dashboard pages usually have their own header? 
                    The previous layout had a header with Bell.
                    Let's keep a generic header container if the pages expect it, 
                    OR better: The ReportsPage has its OWN header.
                    If we move Reports to Dashboard, it will have TWO headers if we keep this one.
                    
                    DECISION: The Dashboard pages (Overview etc) likely expect the header to be in the layout.
                    ReportsPage has its own header.
                    If we unify, we should probably REMOVE the header from the Layout and let pages define it, 
                    OR make the Layout header adaptable.
                    
                    However, for now, let's keep the Layout header but make it visually consistent.
                    The previous layout header was:
                    <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-4">
                    
                    Let's keep it for now to avoid breaking Overview page.
                */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* We wrap children in a div if needed, or just render them. 
                         Previous layout had <div className="p-6">{children}</div>.
                         ReportsPage has its own padding.
                         If we keep p-6, ReportsPage will have double padding.
                         
                         Let's REMOVE the p-6 from layout and ensure Dashboard pages have their own padding 
                         OR keep p-6 and remove it from ReportsPage when we move it.
                         
                         Let's keep p-6 for now, but maybe make it conditional? No, CSS only.
                         Let's keep it simple: Render children.
                     */}
          {children}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Interactive Onboarding Checklist */}
      {/* Note: OnboardingChecklist expects userId prop, we might need to fetch it or pass from context */}
      {/* For now, passing dummy or retrieving from context if available. Let's assume layout can access user session or child pages do. */}
      {/* Since this is a layout and we don't have user context readily available in this file without async/await or provider, */}
      {/* we will place placeholders. In a real app, wrap with SessionProvider. */}
      {/* <OnboardingChecklist userId="current-user-id" />  <-- This needs to be passed correctly */}

      {/* Global Components */}
      <WinStreakPopup />
      <SupportChat />
    </div>
  );
}
