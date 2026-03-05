'use client';

import { PhaseTimeline } from '@/components/strategy/PhaseTimeline';
import { StrategyHeader } from '@/components/strategy/StrategyHeader';

export default function StrategyPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <StrategyHeader />
      <PhaseTimeline />
    </div>
  );
}
