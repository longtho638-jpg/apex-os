'use client';

import { ReactNode } from 'react';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    from?: string;
    to?: string;
}

export function GradientText({ 
    children, 
    className = '', 
    from = 'from-emerald-400', 
    to = 'to-cyan-400' 
}: GradientTextProps) {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${from} ${to} ${className}`}>
      {children}
    </span>
  );
}
