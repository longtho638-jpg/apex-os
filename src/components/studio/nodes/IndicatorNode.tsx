'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Activity } from 'lucide-react';

export const IndicatorNode = memo(({ data }: { data: any }) => {
  return (
    <div className="bg-zinc-900 border border-emerald-500/50 rounded-lg p-3 min-w-[150px] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
      <Handle type="target" position={Position.Top} className="!bg-zinc-500" />
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        <span className="font-bold text-sm text-white">{data.label}</span>
      </div>
      <div className="space-y-1">
        {Object.entries(data.params || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between text-xs text-zinc-400">
                <span>{key}:</span>
                <span className="text-white">{value}</span>
            </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </div>
  );
});
