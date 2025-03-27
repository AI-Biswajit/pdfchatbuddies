
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  direction?: 'horizontal' | 'vertical';
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  children: React.ReactNode;
  className?: string;
  id?: string;
  onResize?: (size: number) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  direction = 'horizontal',
  minSize = 280,
  maxSize = 600,
  defaultSize = 380,
  children,
  className,
  id,
  onResize,
}) => {
  const [size, setSize] = useState(defaultSize);
  const resizePanelRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(defaultSize);
  const isResizingRef = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizingRef.current = true;
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = size;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    let delta = direction === 'horizontal' 
      ? startPosRef.current - e.clientX 
      : startPosRef.current - e.clientY;
    
    let newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
    
    setSize(newSize);
    if (onResize) onResize(newSize);
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Restore text selection
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={resizePanelRef}
      id={id}
      className={cn('relative flex-shrink-0', className)}
      style={{ 
        width: direction === 'horizontal' ? `${size}px` : '100%',
        height: direction === 'vertical' ? `${size}px` : '100%',
      }}
    >
      {children}
      
      <div
        className={cn(
          'absolute z-20 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100',
          direction === 'horizontal' 
            ? 'left-0 top-0 h-full w-1 cursor-col-resize' 
            : 'top-0 left-0 w-full h-1 cursor-row-resize'
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            'rounded-full bg-chat-primary/30',
            direction === 'horizontal' ? 'h-8 w-1' : 'w-8 h-1'
          )}
        />
      </div>
    </div>
  );
};
