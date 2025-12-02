'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Button3DProps {
  children: ReactNode;
  variant?: 'primary' | 'glass' | 'danger';
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button3D({
  children,
  variant = 'primary',
  full = false,
  onClick,
  disabled = false,
  className = ''
}: Button3DProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return 'bg-emerald-600 text-white';
      case 'danger': return 'bg-red-600 text-white';
      case 'glass': return 'bg-[rgba(255,255,255,0.1)] text-white backdrop-blur-md border border-[rgba(255,255,255,0.1)]';
      default: return 'bg-emerald-600 text-white';
    }
  };

  const getShadowColor = () => {
    switch (variant) {
      case 'primary': return 'rgba(16, 185, 129, 0.4)';
      case 'danger': return 'rgba(239, 68, 68, 0.4)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-8 py-4 rounded-xl font-bold overflow-hidden
        ${getVariantStyles()}
        ${full ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        shadow-lg
        ${className}
      `}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 20px 40px ${getShadowColor()}`
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="relative z-10">{children}</span>
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
    </motion.button>
  );
}
