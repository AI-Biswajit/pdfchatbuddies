
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { usePdf } from '@/context/PdfContext';

interface PdfControlsProps {
  displayScale: number;
  isRendering: boolean;
}

export const PdfControls: React.FC<PdfControlsProps> = ({ 
  displayScale, 
  isRendering 
}) => {
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentScale,
    setCurrentScale
  } = usePdf();

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setCurrentScale(Math.min(currentScale + 0.1, 3.0));
  };

  const zoomOut = () => {
    setCurrentScale(Math.max(currentScale - 0.1, 0.5));
  };

  return (
    <div className="flex items-center justify-between border-b border-chat-border bg-background p-3 pdf-controls">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousPage}
          disabled={currentPage <= 1 || isRendering}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages || isRendering}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          disabled={isRendering || currentScale <= 0.5}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          {displayScale}%
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={zoomIn}
          disabled={isRendering || currentScale >= 3.0}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
