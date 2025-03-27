
import React, { useEffect, useRef, useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

// Configure the worker source
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const PdfViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderTask, setRenderTask] = useState<pdfjs.PDFRenderTask | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);

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
    
    const loadingTask = pdfjs.getDocument(pdfFile.url);
    
    loadingTask.promise.then(
      (doc) => {
        setPdfDocument(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading PDF:', error);
        setProcessingError('Failed to load the PDF document.');
        setIsLoading(false);
      }
    );

    // Cleanup
    return () => {
      loadingTask.destroy();
      if (pdfFile?.url) {
        URL.revokeObjectURL(pdfFile.url);
      }
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [pdfFile]);

  // Render PDF page when page or scale changes
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    setIsLoading(true);
    
    // Cancel any ongoing render task
    if (renderTask) {
      renderTask.cancel();
    }

    pdfDocument.getPage(currentPage).then(
      (page) => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
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
            setIsLoading(false);
          },
          (error) => {
            if (error && error.name !== 'RenderingCancelledException') {
              console.error('Error rendering PDF page:', error);
              setProcessingError('Failed to render the PDF page.');
            }
            setIsLoading(false);
          }
        );
      },
      (error) => {
        console.error('Error getting PDF page:', error);
        setProcessingError('Failed to get the PDF page.');
        setIsLoading(false);
      }
    );

    return () => {
      if (renderTask) {
        renderTask.cancel();
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
    setCurrentScale(prev => Math.min(prev + 0.1, 3.0));
  };

  const zoomOut = () => {
    setCurrentScale(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* PDF Controls */}
      {pdfFile && (
        <div className="flex items-center justify-between border-b border-chat-border bg-white p-3">
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
      )}
      
      {/* PDF Viewer Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center"
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
