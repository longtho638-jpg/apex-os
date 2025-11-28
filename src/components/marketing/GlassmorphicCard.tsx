'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassmorphicCardProps {
    children: ReactNode;
    hover?: boolean;
    className?: string;
}

export function GlassmorphicCard({ children, hover = true, className = '' }: GlassmorphicCardProps) {
  return (
    <motion.div 
      className={`
        relative p-8 rounded-2xl
        bg-[rgba(255,255,255,0.05)] backdrop-blur-xl
        border border-[rgba(255,255,255,0.1)]
        shadow-xl
        overflow-hidden
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.02,
        borderColor: 'rgba(16, 185, 129, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
