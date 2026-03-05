'use client';

import { useState } from 'react';
import AlphaDashboard from '@/components/dashboard/AlphaDashboard';
import type { FilterState } from '@/components/dashboard/SignalFilters';

export default function SignalsPage() {
  // Filter state is managed here but passed down.
  // AlphaDashboard now handles the entire layout including the filter sidebar.
  const [filters, _setFilters] = useState<FilterState>({
    symbols: [],
    timeframe: '1m',
    minConfidence: 60,
  });

  return (
    <div className="h-full bg-[#030303] overflow-hidden">
      {/* Main Dashboard takes full width/height. It has its own 3-column layout */}
      <AlphaDashboard filters={filters} />
    </div>
  );
}
