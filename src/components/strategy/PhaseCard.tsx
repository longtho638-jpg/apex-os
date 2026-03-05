import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { StrategyPhase } from '@/types/strategy';

interface PhaseCardProps {
  phase: StrategyPhase;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  const isCompleted = phase.status === 'completed';
  const isMissing = phase.status === 'missing-ui';

  return (
    <div
      className={cn(
        'relative group p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]',
        isCompleted
          ? 'bg-gray-900/50 border-gray-800 hover:border-[#00FF94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.1)]'
          : 'bg-gray-900/30 border-gray-800/50 opacity-70 hover:opacity-100',
      )}
    >
      {/* Status Icon */}
      <div className="absolute top-4 right-4">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-[#00FF94]" />
        ) : isMissing ? (
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {/* Phase Number */}
      <div className="text-xs font-mono text-gray-500 mb-1">PHASE {phase.id.toString().padStart(2, '0')}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00FF94] transition-colors">{phase.name}</h3>

      {/* Sun Tzu Principle */}
      <div className="mb-3 p-2 bg-black/40 rounded border border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-serif text-yellow-500/80">{phase.sunTzu.chinese}</span>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{phase.sunTzu.english}</span>
        </div>
        <p className="text-[10px] text-gray-400 italic leading-relaxed">"{phase.sunTzu.meaning}"</p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{phase.description}</p>

      {/* Impact Badge */}
      <div className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
        IMPACT: {phase.impact}
      </div>

      {/* Action Button */}
      {phase.uiRoute && phase.uiRoute !== '#' ? (
        <Link
          href={phase.uiRoute}
          className={cn(
            'block w-full py-2 text-center text-xs font-bold rounded transition-colors',
            isCompleted
              ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20',
          )}
        >
          {isMissing ? 'MISSING UI' : 'VIEW DASHBOARD'}
        </Link>
      ) : (
        <button
          disabled
          className="w-full py-2 text-center text-xs font-bold rounded bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-800"
        >
          NO WEB UI
        </button>
      )}
    </div>
  );
}
