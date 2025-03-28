import React, { useEffect, useRef, useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { PdfSearch } from './PdfSearch';
import * as pdfjs from 'pdfjs-dist';
import { RenderTask } from 'pdfjs-dist';
import { toast } from 'sonner';

export const PdfViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderTask, setRenderTask] = useState<RenderTask | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [displayScale, setDisplayScale] = useState(100);

  const {
    pdfFile,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    currentScale,
    setCurrentScale,
    setProcessingError,
    loadState
  } = usePdf();

  useEffect(() => {
    if (!pdfFile || loadState !== 'success') return;

    setIsLoading(true);
    setRenderError(null);
    
    if (renderTask) {
      renderTask.cancel();
      setRenderTask(null);
    }
    
    if (pdfDocument) {
      pdfDocument.destroy().catch(err => console.error("Error destroying PDF document:", err));
      setPdfDocument(null);
    }
    
    const loadOptions = {
      url: pdfFile.url,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      enableXfa: true,
      disableRange: false,
      disableStream: false,
    };
    
    console.log("Loading PDF document with options:", loadOptions);
    const loadingTask = pdfjs.getDocument(loadOptions);
    
    loadingTask.promise.then(
      (doc) => {
        console.log("PDF document loaded successfully in viewer");
        setPdfDocument(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        
        if (doc.numPages === 0) {
          setIsLoading(false);
          const errorMsg = 'The PDF document appears to be empty.';
          setRenderError(errorMsg);
          setProcessingError(errorMsg);
          toast.error(errorMsg);
        } else {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error loading PDF in viewer:', error);
        const errorMsg = `Failed to load the PDF document: ${error.message}`;
        setRenderError(errorMsg);
        setProcessingError(errorMsg);
        setIsLoading(false);
        toast.error(errorMsg);
      }
    ).catch(error => {
      console.error('Unhandled error loading PDF in viewer:', error);
      const errorMsg = `Failed to load the PDF document: ${error.message}`;
      setRenderError(errorMsg);
      setProcessingError(errorMsg);
      setIsLoading(false);
      toast.error(errorMsg);
    });

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      
      if (pdfDocument) {
        pdfDocument.destroy().catch(err => console.error("Error destroying PDF document:", err));
      }
    };
  }, [pdfFile, retryCount, loadState]);

  useEffect(() => {
    setDisplayScale(Math.round(currentScale * 100));
  }, [currentScale]);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) {
      return;
    }

    setIsRendering(true);
    setRenderError(null);
    
    if (renderTask) {
      renderTask.cancel();
      setRenderTask(null);
    }

    pdfDocument.getPage(currentPage).then(
      (page) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setIsRendering(false);
          return;
        }
        
        const context = canvas.getContext('2d');
        if (!context) {
          setIsRendering(false);
          setRenderError('Failed to get canvas context.');
          toast.error('Failed to get canvas context.');
          return;
        }
        
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: currentScale });
        
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        
        context.scale(pixelRatio, pixelRatio);

        const newRenderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        setRenderTask(newRenderTask);

        newRenderTask.promise.then(
          () => {
            console.log("Page rendered successfully");
            setIsRendering(false);
          },
          (error) => {
            if (error && error.name !== 'RenderingCancelledException') {
              console.error('Error rendering PDF page:', error);
              setRenderError(`Failed to render the PDF page: ${error.message}`);
              toast.error(`Failed to render the PDF page: ${error.message}`);
            }
            setIsRendering(false);
          }
        ).catch(error => {
          console.error('Unhandled error rendering PDF page:', error);
          setIsRendering(false);
          toast.error(`Error rendering PDF page: ${error.message}`);
        });
      },
      (error) => {
        console.error('Error getting PDF page:', error);
        setRenderError(`Failed to get the PDF page: ${error.message}`);
        setIsRendering(false);
        toast.error(`Failed to get the PDF page: ${error.message}`);
      }
    ).catch(error => {
      console.error('Unhandled error getting PDF page:', error);
      setIsRendering(false);
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
      {pdfFile && !renderError && loadState === 'success' && (
        <>
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
        {!renderError && <PdfSearch />}
        </>
      )}
      
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
        ) : loadState === 'loading' || isLoading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-chat-primary" />
            <p className="mt-4 text-muted-foreground">Loading PDF...</p>
          </div>
        ) : renderError || loadState === 'error' ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-destructive">Error</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {renderError || "Failed to load the PDF. Please try again with a different file."}
            </p>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="mt-4 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
