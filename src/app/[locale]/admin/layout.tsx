import React from 'react';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getSupabaseClient } from '@/lib/supabase';

import { ResonanceBell } from '@/components/notifications/ResonanceBell';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = getSupabaseClient();

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/en/login');
    }

    // 2. Check Admin Role
    // Check by ID first
    let { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

    // Fallback: Check by email if ID check failed (for legacy/manual inserts)
    if (!adminUser && user.email) {
        const { data: adminByEmail } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (adminByEmail) {
            adminUser = adminByEmail;
        }
    }

    if (!adminUser) {
        // Not an admin, redirect to dashboard
        redirect('/en/dashboard');
    }

    // ... imports

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
                <div className="flex-1 overflow-y-auto z-10 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
