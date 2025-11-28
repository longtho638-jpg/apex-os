'use client';

import { useState } from 'react';
import AlphaDashboard from '@/components/dashboard/AlphaDashboard';
import { SignalFilters, FilterState } from '@/components/dashboard/SignalFilters';

export default function SignalsPage() {
  const [filters, setFilters] = useState<FilterState>({
    symbols: [],
    timeframe: '1h',
    minConfidence: 60
  });

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-[#030303]">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <SignalFilters filters={filters} onChange={setFilters} />
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 overflow-hidden">
        {/* Pass filters to AlphaDashboard to handle client-side filtering */}
        <AlphaDashboard filters={filters} />
      </main>
    </div>
  );
}
