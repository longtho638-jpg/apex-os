'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const frameDuration = 16; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      const increment = end / totalFrames;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, frameDuration);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('en-US');

  return (
    <span ref={ref} className={`font-mono ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
