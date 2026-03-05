import { STRATEGY_PHASES } from '@/lib/strategy/phases';
import { PhaseCard } from './PhaseCard';

export function PhaseTimeline() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {STRATEGY_PHASES.map((phase) => (
        <PhaseCard key={phase.id} phase={phase} />
      ))}
    </div>
  );
}
