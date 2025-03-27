
import React, { useEffect, useRef, useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import { PdfSearch } from './PdfSearch';
import * as pdfjs from 'pdfjs-dist';
import { RenderTask } from 'pdfjs-dist';

// Configure the worker source - IMPORTANT: This needs to be done before any PDF operations
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PdfViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderTask, setRenderTask] = useState<RenderTask | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

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

  // Load PDF document when file changes
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
    
    const loadingTask = pdfjs.getDocument({
      url: pdfFile.url,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });
    
    loadingTask.promise.then(
      (doc) => {
        console.log("PDF document loaded successfully");
        setPdfDocument(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        
        if (doc.numPages === 0) {
          setIsLoading(false);
          setRenderError('The PDF document appears to be empty.');
          setProcessingError('The PDF document appears to be empty.');
        }
      },
      (error) => {
        console.error('Error loading PDF:', error);
        setRenderError(`Failed to load the PDF document: ${error.message}`);
        setProcessingError(`Failed to load the PDF document: ${error.message}`);
        setIsLoading(false);
      }
    ).catch(error => {
      console.error('Unhandled error loading PDF:', error);
      setRenderError(`Failed to load the PDF document: ${error.message}`);
      setProcessingError(`Failed to load the PDF document: ${error.message}`);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      
      if (loadingTask) {
        loadingTask.destroy().catch(err => console.error("Error destroying loading task:", err));
      }
      
      if (pdfFile?.url) {
        URL.revokeObjectURL(pdfFile.url);
      }
      
      if (pdfDocument) {
        pdfDocument.destroy().catch(err => console.error("Error destroying PDF document:", err));
      }
    };
  }, [pdfFile]);

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
            }
            setIsLoading(false);
          }
        ).catch(error => {
          console.error('Unhandled error rendering PDF page:', error);
          setIsLoading(false);
        });
      },
      (error) => {
        console.error('Error getting PDF page:', error);
        setRenderError(`Failed to get the PDF page: ${error.message}`);
        setIsLoading(false);
      }
    ).catch(error => {
      console.error('Unhandled error getting PDF page:', error);
      setIsLoading(false);
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

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* PDF Controls */}
      {pdfFile && (
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
        <PdfSearch />
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
              <FileTextIcon className="h-12 w-12 text-chat-primary" />
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
              <AlertTriangleIcon className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-destructive">Error</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {renderError}
            </p>
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

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
