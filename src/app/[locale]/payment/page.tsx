"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PaymentPage() {
    const t = useTranslations('Payment');

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Thanh Toán</h1>
                        <p className="text-sm text-gray-400">Payment & Billing</p>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-8 text-center">
                    <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-gray-400">Payment system under development</p>
                </div>
            </main>
        </div>
    );
}
