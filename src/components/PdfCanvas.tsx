
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PdfCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isRendering: boolean;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({ 
  canvasRef,
  isRendering
}) => {
  return (
    <div className={cn(
      "pdf-page-transition relative shadow-lg",
      isRendering && "pdf-page-loading opacity-50"
    )}>
      <canvas ref={canvasRef} className="block" />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/30">
          <Loader2 className="h-8 w-8 animate-spin text-chat-primary" />
        </div>
      )}
    </div>
  );
};
