'use client';

import { memo, useMemo } from 'react';

const MiniSparkline = memo(
  ({ data, color }: { data: number[]; color: string }) => {
    if (!data || data.length < 2) {
      return (
        <div className="h-5 w-14 flex items-center">
          <div className="h-0.5 w-full bg-zinc-800 rounded animate-pulse" />
        </div>
      );
    }

    const points = useMemo(() => {
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      return data
        .map((p, i) => {
          const x = (i / (data.length - 1)) * 60;
          const y = 20 - ((p - min) / range) * 20;
          return `${x},${y}`;
        })
        .join(' L ');
    }, [data]);

    return (
      <svg width="60" height="20" className="opacity-70">
        <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  },
  (prev, next) => prev.color === next.color && JSON.stringify(prev.data) === JSON.stringify(next.data),
);

MiniSparkline.displayName = 'MiniSparkline';

export { MiniSparkline };
