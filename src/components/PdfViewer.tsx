
import React, { useRef } from 'react';
import { usePdf } from '@/context/PdfContext';
import { usePdfRenderer } from '@/hooks/use-pdf-renderer';
import { PdfControls } from './PdfControls';
import { PdfSearch } from './PdfSearch';
import { PdfEmptyState } from './PdfEmptyState';
import { PdfLoadingState } from './PdfLoadingState';
import { PdfErrorState } from './PdfErrorState';
import { PdfCanvas } from './PdfCanvas';

export const PdfViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pdfFile, loadState } = usePdf();
  
  const {
    canvasRef,
    isLoading,
    isRendering,
    renderError,
    displayScale,
    handleRetry
  } = usePdfRenderer();

  return (
    <div className="flex h-full flex-1 flex-col">
      {pdfFile && !renderError && loadState === 'success' && (
        <>
          <PdfControls 
            displayScale={displayScale} 
            isRendering={isRendering} 
          />
          {!renderError && <PdfSearch />}
        </>
      )}
      
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4 flex justify-center items-center"
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
          />
        )}
      </div>
    </div>
  );
};
