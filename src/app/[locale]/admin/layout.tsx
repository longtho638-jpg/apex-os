import type React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ResonanceBell } from '@/components/notifications/ResonanceBell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Note: Auth check temporarily disabled for development

  return (
    <div className="flex h-screen w-full bg-black text-white font-mono overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#050505]">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

        {/* Resonance Bell (Top Right) */}
        <div className="absolute top-6 right-8 z-50">
          <ResonanceBell />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto z-10 relative">{children}</div>
      </main>
    </div>
  );
}
