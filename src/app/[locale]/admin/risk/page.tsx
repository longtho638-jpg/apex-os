'use client';

import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import RiskManagement from '@/components/admin/RiskManagement';

export default function RiskPage() {
  const t = useTranslations('AdminRisk');

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[#050505]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            {t('title')}
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-1 uppercase tracking-widest">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <RiskManagement />
      </div>
    </div>
  );
}
