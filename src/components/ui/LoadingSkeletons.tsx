export function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg" />
          <div className="space-y-2">
            <div className="w-20 h-4 bg-white/10 rounded" />
            <div className="w-12 h-3 bg-white/10 rounded" />
          </div>
        </div>
        <div className="w-16 h-8 bg-white/10 rounded" />
      </div>
      <div className="space-y-2 pt-4 border-t border-white/5">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-2 bg-white/10 rounded" />
          <div className="h-2 bg-white/10 rounded" />
          <div className="h-2 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="w-full h-[300px] bg-white/5 border border-white/10 rounded-2xl animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
