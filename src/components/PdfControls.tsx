
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Minus, 
  Plus, 
  Maximize,
  RotateCcw
} from 'lucide-react';
import { usePdf } from '@/context/PdfContext';
import { toast } from 'sonner';

interface PdfControlsProps {
  displayScale: number;
  isRendering: boolean;
  fitToWidth: boolean;
  onToggleFitToWidth: () => void;
}

export const PdfControls: React.FC<PdfControlsProps> = ({ 
  displayScale, 
  isRendering,
  fitToWidth,
  onToggleFitToWidth
}) => {
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentScale,
    setCurrentScale
  } = usePdf();

  const [pageInput, setPageInput] = useState<string>(currentPage.toString());

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    
    if (isNaN(pageNumber)) {
      setPageInput(currentPage.toString());
      return;
    }
    
    if (pageNumber < 1) {
      setCurrentPage(1);
      setPageInput("1");
      toast.info("Showing first page");
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(totalPages.toString());
      toast.info(`Showing last page (${totalPages})`);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  const zoomIn = () => {
    setCurrentScale(Math.min(currentScale + 0.1, 3.0));
  };

  const zoomOut = () => {
    setCurrentScale(Math.max(currentScale - 0.1, 0.5));
  };

  const resetZoom = () => {
    setCurrentScale(1.0);
  };

  return (
    <div className="flex flex-wrap items-center justify-between border-b border-chat-border bg-background p-3 pdf-controls gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousPage}
          disabled={currentPage <= 1 || isRendering}
          className="h-8 w-8"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
          <Input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            onBlur={() => handlePageSubmit({ preventDefault: () => {} } as React.FormEvent)}
            className="h-8 w-12 text-center"
            disabled={isRendering}
          />
          <span className="text-sm text-muted-foreground">
            of {totalPages}
          </span>
        </form>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages || isRendering}
          className="h-8 w-8"
          title="Next page"
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
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={resetZoom}
            className="text-sm px-2 hover:underline"
            title="Reset zoom"
          >
            {displayScale}%
          </button>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={zoomIn}
          disabled={isRendering || currentScale >= 3.0}
          className="h-8 w-8"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant={fitToWidth ? "default" : "outline"}
          size="icon"
          onClick={onToggleFitToWidth}
          disabled={isRendering}
          className="h-8 w-8"
          title={fitToWidth ? "Disable fit to width" : "Fit to width"}
        >
          <Maximize className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={resetZoom}
          disabled={isRendering}
          className="h-8 w-8"
          title="Reset zoom (100%)"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
