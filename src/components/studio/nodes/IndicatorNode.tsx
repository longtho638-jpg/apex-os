'use client';

import { Handle, Position } from '@xyflow/react';
import { Activity } from 'lucide-react';
import { memo } from 'react';

export const IndicatorNode = memo(({ data }: { data: any }) => {
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>

      {/* Card Body */}
      <div className="relative bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-w-[180px] shadow-2xl transition-all hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
        {/* Target Handle (Input) */}
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-zinc-500 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 !-top-1.5"
        />

        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="block font-bold text-sm text-white tracking-wide">{data.label}</span>
            <span className="text-[10px] text-emerald-500 uppercase font-mono tracking-wider">Signal</span>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(data.params || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
              <span className="text-zinc-400 capitalize">{key}</span>
              <span className="font-mono font-bold text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Source Handle (Output) */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-emerald-500 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 !-bottom-1.5 shadow-[0_0_10px_#10B981]"
        />
      </div>
    </div>
  );
});
