
import React, { useEffect, useRef, useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { PdfSearch } from './PdfSearch';
import * as pdfjs from 'pdfjs-dist';
import { RenderTask } from 'pdfjs-dist';
import { toast } from 'sonner';

// We're using the worker configuration from pdfUtils.ts

export const PdfViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderTask, setRenderTask] = useState<RenderTask | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    pdfFile,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    currentScale,
    setCurrentScale,
    setProcessingError
  } = usePdf();

  // Load PDF document when file changes or when retrying
  useEffect(() => {
    if (!pdfFile) return;

    setIsLoading(true);
    setRenderError(null);
    
    // Cancel any ongoing render task
    if (renderTask) {
      renderTask.cancel();
      setRenderTask(null);
    }
    
    // Clean up previous PDF document
    if (pdfDocument) {
      pdfDocument.destroy().catch(err => console.error("Error destroying PDF document:", err));
      setPdfDocument(null);
    }
    
    const loadOptions = {
      url: pdfFile.url,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      enableXfa: true,
      disableRange: true,
      disableStream: true,
    };
    
    console.log("Loading PDF with options:", loadOptions);
    const loadingTask = pdfjs.getDocument(loadOptions);
    
    loadingTask.promise.then(
      (doc) => {
        console.log("PDF document loaded successfully");
        setPdfDocument(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        
        if (doc.numPages === 0) {
          setIsLoading(false);
          const errorMsg = 'The PDF document appears to be empty.';
          setRenderError(errorMsg);
          setProcessingError(errorMsg);
          toast.error(errorMsg);
        }
      },
      (error) => {
        console.error('Error loading PDF:', error);
        const errorMsg = `Failed to load the PDF document: ${error.message}`;
        setRenderError(errorMsg);
        setProcessingError(errorMsg);
        setIsLoading(false);
        toast.error(errorMsg);
      }
    ).catch(error => {
      console.error('Unhandled error loading PDF:', error);
      const errorMsg = `Failed to load the PDF document: ${error.message}`;
      setRenderError(errorMsg);
      setProcessingError(errorMsg);
      setIsLoading(false);
      toast.error(errorMsg);
    });

    // Cleanup
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      
      if (loadingTask) {
        loadingTask.destroy().catch(err => console.error("Error destroying loading task:", err));
      }
      
      if (pdfDocument) {
        pdfDocument.destroy().catch(err => console.error("Error destroying PDF document:", err));
      }
    };
  }, [pdfFile, retryCount]);

  // Render PDF page when page or scale changes
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) {
      return;
    }

    setIsLoading(true);
    setRenderError(null);
    
    // Cancel any ongoing render task
    if (renderTask) {
      renderTask.cancel();
      setRenderTask(null);
    }

    // Get the current page from the document
    pdfDocument.getPage(currentPage).then(
      (page) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setIsLoading(false);
          return;
        }
        
        const context = canvas.getContext('2d');
        if (!context) {
          setIsLoading(false);
          setRenderError('Failed to get canvas context.');
          toast.error('Failed to get canvas context.');
          return;
        }
        
        const viewport = page.getViewport({ scale: currentScale });

        // Set canvas dimensions to match the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the page
        const newRenderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        setRenderTask(newRenderTask);

        newRenderTask.promise.then(
          () => {
            console.log("Page rendered successfully");
            setIsLoading(false);
          },
          (error) => {
            if (error && error.name !== 'RenderingCancelledException') {
              console.error('Error rendering PDF page:', error);
              setRenderError(`Failed to render the PDF page: ${error.message}`);
              toast.error(`Failed to render the PDF page: ${error.message}`);
            }
            setIsLoading(false);
          }
        ).catch(error => {
          console.error('Unhandled error rendering PDF page:', error);
          setIsLoading(false);
          toast.error(`Error rendering PDF page: ${error.message}`);
        });
      },
      (error) => {
        console.error('Error getting PDF page:', error);
        setRenderError(`Failed to get the PDF page: ${error.message}`);
        setIsLoading(false);
        toast.error(`Failed to get the PDF page: ${error.message}`);
      }
    ).catch(error => {
      console.error('Unhandled error getting PDF page:', error);
      setIsLoading(false);
      toast.error(`Error getting PDF page: ${error.message}`);
    });

    return () => {
      if (renderTask) {
        renderTask.cancel();
        setRenderTask(null);
      }
    };
  }, [pdfDocument, currentPage, currentScale]);

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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setRenderError(null);
    toast.info("Retrying PDF load...");
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* PDF Controls */}
      {pdfFile && !renderError && (
        <>
        <div className="flex items-center justify-between border-b border-chat-border bg-background p-3 pdf-controls">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || isLoading}
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
              disabled={currentPage >= totalPages || isLoading}
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
              disabled={isLoading || currentScale <= 0.5}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              {Math.round(currentScale * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={zoomIn}
              disabled={isLoading || currentScale >= 3.0}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!renderError && <PdfSearch />}
        </>
      )}
      
      {/* PDF Viewer Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4 flex justify-center items-center"
      >
        {!pdfFile ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-chat-primary/10 p-4">
              <FileText className="h-12 w-12 text-chat-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No PDF loaded</h3>
            <p className="text-muted-foreground">
              Upload a PDF from the sidebar to get started.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-chat-primary" />
            <p className="mt-4 text-muted-foreground">Loading PDF...</p>
          </div>
        ) : renderError ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-destructive">Error</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {renderError}
            </p>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className={cn(
            "pdf-page-transition relative shadow-lg",
            isLoading && "pdf-page-loading opacity-50"
          )}>
            <canvas ref={canvasRef} className="block" />
          </div>
        )}
      </div>
    </div>
  );
};
