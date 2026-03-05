import { STRATEGY_PHASES } from '@/lib/strategy/phases';

export function StrategyHeader() {
  const completedCount = STRATEGY_PHASES.filter((p) => p.status === 'completed').length;
  const totalCount = STRATEGY_PHASES.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">The Art of War: $1M Roadmap</h1>
          <p className="text-gray-400 italic">
            "The general who wins a battle makes many calculations in his temple ere the battle is fought."
            <span className="block text-sm text-gray-500 mt-1">— Sun Tzu</span>
          </p>
        </div>
        <div className="w-full md:w-1/3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">War Progress</span>
            <span className="text-[#00FF94] font-mono">
              {completedCount}/{totalCount} Phases
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00FF94] to-[#06B6D4] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
