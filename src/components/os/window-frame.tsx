'use client';

import { motion } from 'framer-motion';
import { Minus, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useWindowStore, type WindowState } from '@/lib/store/window-store';
import { cn } from '@/lib/utils';

interface WindowFrameProps {
  windowState: WindowState;
}

export function WindowFrame({ windowState }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow } = useWindowStore();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(windowState.position || { x: 100, y: 100 });
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    focusWindow(windowState.id);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (windowState.isMinimized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'glass absolute flex flex-col overflow-hidden rounded-lg shadow-2xl transition-[width,height,border-radius] duration-300',
        windowState.isMaximized ? 'inset-0 rounded-none' : 'h-[500px] w-[800px]',
      )}
      style={{
        zIndex: windowState.zIndex,
        left: windowState.isMaximized ? 0 : position.x,
        top: windowState.isMaximized ? 0 : position.y,
      }}
      onMouseDown={() => focusWindow(windowState.id)}
    >
      {/* Title Bar */}
      <div
        className="flex h-10 w-full items-center justify-between bg-white/5 px-4 backdrop-blur-xl"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 group/controls">
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(windowState.id);
              }}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors"
            >
              <X className="h-2 w-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(windowState.id);
              }}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors"
            >
              <Minus className="h-2 w-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(windowState.id);
              }}
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 transition-colors"
            >
              <Square className="h-2 w-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity" />
            </button>
          </div>
          <span className="ml-4 text-sm font-medium text-white/80 select-none">{windowState.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-black/40 p-1 backdrop-blur-md">{windowState.component}</div>
    </motion.div>
  );
}
