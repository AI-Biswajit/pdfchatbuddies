
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PdfFile, 
  ChatMessage, 
  PdfSummary,
  PdfContextType
} from '@/types';
import { extractTextFromPdf } from '@/utils/pdfUtils';
import { toast } from 'sonner';

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

  // Function to set a new PDF file, cleaning up previous resources
  const setPdf = (file: PdfFile | null) => {
    // Cleanup old URL if exists
    if (pdfFile?.url) {
      try {
        URL.revokeObjectURL(pdfFile.url);
      } catch (error) {
        console.error("Error revoking object URL:", error);
      }
    }
    
    setPdfFile(file);
    
    // Reset related states when changing PDF
    if (!file) {
      setCurrentPage(1);
      setTotalPages(0);
      setExtractedText('');
      setSummary(null);
      setProcessingError(null);
    }
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    setChatMessages(prevMessages => [...prevMessages, newMessage]);
  };

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
        setExtractedText
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
