'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export const ActionNode = memo(({ data }: { data: any }) => {
  const color = data.action === 'BUY' ? 'emerald' : data.action === 'SELL' ? 'red' : 'yellow';
  const borderColor = data.action === 'BUY' ? 'border-emerald-500' : data.action === 'SELL' ? 'border-red-500' : 'border-yellow-500';
  const textColor = data.action === 'BUY' ? 'text-emerald-400' : data.action === 'SELL' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className={`bg-zinc-900 border ${borderColor} rounded-lg p-3 min-w-[120px] shadow-lg`}>
      <Handle type="target" position={Position.Top} className="!bg-zinc-500" />
      <div className="flex items-center gap-2 justify-center">
        <Zap className={`w-4 h-4 ${textColor}`} />
        <span className={`font-bold text-lg ${textColor}`}>{data.action}</span>
      </div>
    </div>
  );
});
