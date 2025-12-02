'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

export const LogicNode = memo(({ data }: { data: any }) => {
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
      
      {/* Card Body */}
      <div className="relative bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-w-[140px] shadow-2xl flex flex-col items-center text-center transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
        <Handle 
            type="target" 
            position={Position.Top} 
            className="!w-3 !h-3 !bg-zinc-500 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 !-top-1.5" 
        />
        
        <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-2">
            <GitMerge className="w-5 h-5 text-blue-400" />
        </div>
        
        <span className="font-bold text-sm text-white tracking-wide mb-1">{data.label}</span>
        <div className="bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 w-full">
            <p className="text-xs text-blue-300 font-mono font-bold">{data.condition}</p>
        </div>

        <Handle 
            type="source" 
            position={Position.Bottom} 
            className="!w-3 !h-3 !bg-blue-500 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 !-bottom-1.5 shadow-[0_0_10px_#3B82F6]" 
        />
      </div>
    </div>
  );
});
