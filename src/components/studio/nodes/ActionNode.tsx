'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export const ActionNode = memo(({ data }: { data: any }) => {
  const isBuy = data.action === 'BUY';
  const isSell = data.action === 'SELL';
  
  const glowColor = isBuy ? 'from-emerald-500 to-green-500' : isSell ? 'from-red-500 to-orange-500' : 'from-yellow-500 to-amber-500';
  const iconColor = isBuy ? 'text-emerald-400' : isSell ? 'text-red-400' : 'text-yellow-400';
  const bgColor = isBuy ? 'bg-emerald-500/10' : isSell ? 'bg-red-500/10' : 'bg-yellow-500/10';
  const borderColor = isBuy ? 'border-emerald-500/20' : isSell ? 'border-red-500/20' : 'border-yellow-500/20';

  return (
    <div className="relative group">
      {/* Intense Glow for Action */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-500 animate-pulse`}></div>
      
      {/* Card Body */}
      <div className={`relative bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-w-[140px] shadow-2xl flex flex-col items-center text-center transition-all hover:${isBuy ? 'border-emerald-500/50' : isSell ? 'border-red-500/50' : 'border-yellow-500/50'}`}>
        <Handle 
            type="target" 
            position={Position.Top} 
            className="!w-3 !h-3 !bg-zinc-500 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 !-top-1.5" 
        />
        
        <div className={`p-3 rounded-full border ${bgColor} ${borderColor} mb-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
            <Zap className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Execute</span>
        <span className={`font-black text-xl tracking-wider ${iconColor}`}>{data.action}</span>
      </div>
    </div>
  );
});
