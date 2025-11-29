'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

export const LogicNode = memo(({ data }: { data: any }) => {
  return (
    <div className="bg-zinc-900 border border-blue-500/50 rounded-lg p-3 min-w-[120px] shadow-[0_0_10px_rgba(59,130,246,0.2)]">
      <Handle type="target" position={Position.Top} className="!bg-zinc-500" />
      <div className="flex items-center gap-2 mb-1 justify-center">
        <GitMerge className="w-4 h-4 text-blue-400" />
        <span className="font-bold text-sm text-white">{data.label}</span>
      </div>
      <p className="text-xs text-center text-blue-300 font-mono">{data.condition}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
});
