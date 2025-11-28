'use client';

import React from 'react';
import PricingEngine from '@/components/admin/PricingEngine';
import { DollarSign } from 'lucide-react';

import { useTranslations } from '@/contexts/I18nContext';

export default function PricingPage() {
    const t = useTranslations('AdminPricing');

    return (
        <div className="p-6 space-y-6 min-h-screen bg-[#050505]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-[#00FF94]" />
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 text-xs font-mono mt-1 uppercase tracking-widest">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <PricingEngine />
            </div>
        </div>
    );
}
