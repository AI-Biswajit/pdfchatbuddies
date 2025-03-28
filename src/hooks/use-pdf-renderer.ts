
import { useState, useEffect, useRef } from 'react';
import { usePdf } from '@/context/PdfContext';
import * as pdfjs from 'pdfjs-dist';
import { RenderTask } from 'pdfjs-dist';
import { toast } from 'sonner';

export const usePdfRenderer = () => {
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [renderTask, setRenderTask] = useState<RenderTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(100);
  const [fitToWidth, setFitToWidth] = useState(false);

  const {
    pdfFile,
    currentPage,
    totalPages,
    setTotalPages,
    currentScale,
    setCurrentScale,
    setProcessingError,
    loadState
  } = usePdf();

  // Load PDF document when file changes
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
  }, [pdfFile, retryCount, loadState, setProcessingError, setTotalPages]);

  // Calculate fit-to-width scale when document or container changes
  useEffect(() => {
    if (fitToWidth && pdfDocument && containerRef.current) {
      const calculateFitToWidth = async () => {
        try {
          const page = await pdfDocument.getPage(currentPage);
          const viewport = page.getViewport({ scale: 1.0 });
          const containerWidth = containerRef.current?.parentElement?.clientWidth || 1000;
          // Account for padding
          const availableWidth = containerWidth - 32; // 16px padding on each side
          const scale = availableWidth / viewport.width;
          
          setCurrentScale(scale);
        } catch (error) {
          console.error('Error calculating fit-to-width scale:', error);
        }
      };
      
      calculateFitToWidth();
    }
  }, [pdfDocument, fitToWidth, containerRef, currentPage, setCurrentScale]);

  // Update display scale when currentScale changes
  useEffect(() => {
    // Display the actual scale percentage without adjusting for pixel ratio
    // This ensures the displayed percentage matches what was set in PdfContext
    setDisplayScale(Math.round(currentScale * 100));
  }, [currentScale]);

  // Render PDF page when document, page or scale changes
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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setRenderError(null);
    toast.info("Retrying PDF load...");
  };

  const toggleFitToWidth = () => {
    setFitToWidth(!fitToWidth);
  };

  return {
    canvasRef,
    containerRef,
    isLoading,
    isRendering,
    renderError,
    displayScale,
    fitToWidth,
    toggleFitToWidth,
    handleRetry
  };
};
