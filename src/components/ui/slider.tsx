'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      type="range"
      className={cn('w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00FF94]', className)}
      ref={ref}
      {...props}
    />
  ),
);
Slider.displayName = 'Slider';

export { Slider };
