
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PdfFile, 
  ChatMessage, 
  PdfSummary,
  PdfContextType
} from '@/types';
import { extractTextFromPdf } from '@/utils/pdfUtils';
import { toast } from 'sonner';
import * as pdfjs from 'pdfjs-dist';

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const PdfProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PdfSummary | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentScale, setCurrentScale] = useState<number>(1.0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Function to validate and pre-load PDF
  const validatePdf = useCallback(async (url: string): Promise<boolean> => {
    try {
      console.log("Validating PDF at:", url);
      const loadingTask = pdfjs.getDocument({
        url,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        enableXfa: true,
        disableRange: false,
        disableStream: false,
      });
      
      // Just check if we can load the document
      const doc = await loadingTask.promise;
      console.log("PDF validation successful. Pages:", doc.numPages);
      setTotalPages(doc.numPages);
      
      // Clean up
      await doc.destroy();
      return true;
    } catch (error) {
      console.error("PDF validation failed:", error);
      setProcessingError(`Failed to validate PDF: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, []);

  // Function to set a new PDF file, cleaning up previous resources
  const setPdf = useCallback(async (file: PdfFile | null) => {
    // Cleanup old URL if exists
    if (pdfFile?.url) {
      try {
        URL.revokeObjectURL(pdfFile.url);
      } catch (error) {
        console.error("Error revoking object URL:", error);
      }
    }
    
    // Reset related states when changing PDF
    if (!file) {
      setPdfFile(null);
      setCurrentPage(1);
      setTotalPages(0);
      setExtractedText('');
      setSummary(null);
      setProcessingError(null);
      setLoadState('idle');
      return;
    }
    
    // Set loading state
    setLoadState('loading');
    
    // Validate PDF before setting it
    const isValid = await validatePdf(file.url);
    
    if (isValid) {
      setPdfFile(file);
      setCurrentPage(1);
      setLoadState('success');
    } else {
      // If validation failed, attempt to revoke the URL
      try {
        URL.revokeObjectURL(file.url);
      } catch (error) {
        console.error("Error revoking invalid PDF URL:", error);
      }
      setLoadState('error');
      toast.error("The PDF could not be loaded. Please try a different file.");
    }
  }, [pdfFile, validatePdf]);

  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    setChatMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  return (
    <PdfContext.Provider
      value={{
        pdfFile,
        setPdfFile: setPdf,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        isProcessing,
        setIsProcessing,
        processingError,
        setProcessingError,
        summary,
        setSummary,
        chatMessages,
        setChatMessages,
        addChatMessage,
        currentScale,
        setCurrentScale,
        extractedText,
        setExtractedText,
        loadState
      }}
    >
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = (): PdfContextType => {
  const context = useContext(PdfContext);
  
  if (context === undefined) {
    throw new Error('usePdf must be used within a PdfProvider');
  }
  
  return context;
};
