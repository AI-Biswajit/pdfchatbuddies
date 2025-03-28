
import React, { useRef, useEffect } from 'react';
import { usePdf } from '@/context/PdfContext';
import { usePdfRenderer } from '@/hooks/use-pdf-renderer';
import { PdfControls } from './PdfControls';
import { PdfSearch } from './PdfSearch';
import { PdfEmptyState } from './PdfEmptyState';
import { PdfLoadingState } from './PdfLoadingState';
import { PdfErrorState } from './PdfErrorState';
import { PdfCanvas } from './PdfCanvas';

export const PdfViewer: React.FC = () => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const { pdfFile, loadState } = usePdf();
  
  const {
    canvasRef,
    containerRef,
    isLoading,
    isRendering,
    renderError,
    displayScale,
    fitToWidth,
    toggleFitToWidth,
    handleRetry
  } = usePdfRenderer();

  // Handle viewer container resize for fit-to-width
  useEffect(() => {
    if (!viewerContainerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (fitToWidth) {
        // Force a re-calculation of the fit-to-width scale
        toggleFitToWidth();
        toggleFitToWidth();
      }
    });
    
    resizeObserver.observe(viewerContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [fitToWidth, toggleFitToWidth]);

  return (
    <div className="flex h-full flex-1 flex-col">
      {pdfFile && !renderError && loadState === 'success' && (
        <>
          <PdfControls 
            displayScale={displayScale} 
            isRendering={isRendering} 
            fitToWidth={fitToWidth}
            onToggleFitToWidth={toggleFitToWidth}
          />
          {!renderError && <PdfSearch />}
        </>
      )}
      
      <div
        ref={viewerContainerRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4 flex justify-center items-start"
      >
        {!pdfFile ? (
          <PdfEmptyState />
        ) : loadState === 'loading' || isLoading ? (
          <PdfLoadingState />
        ) : renderError || loadState === 'error' ? (
          <PdfErrorState 
            errorMessage={renderError || "Failed to load the PDF. Please try again with a different file."} 
            onRetry={handleRetry} 
          />
        ) : (
          <PdfCanvas 
            canvasRef={canvasRef} 
            isRendering={isRendering}
            containerRef={containerRef}
          />
        )}
      </div>
    </div>
  );
};
