'use client';

import { useEffect, useState } from 'react';

interface TypeWriterProps {
    text: string;
    speed?: number;
    className?: string;
    cursor?: boolean;
}

export function TypeWriter({ 
    text, 
    speed = 50, 
    className = '', 
    cursor = true 
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && <span className="animate-pulse text-emerald-500">|</span>}
    </span>
  );
}
