
export interface PdfFile {
  name: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export interface SuggestionPrompt {
  id: string;
  text: string;
}

export interface PdfSummary {
  text: string;
  suggestions: SuggestionPrompt[];
}

export interface PdfContextType {
  pdfFile: PdfFile | null;
  setPdfFile: (file: PdfFile | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  processingError: string | null;
  setProcessingError: (error: string | null) => void;
  summary: PdfSummary | null;
  setSummary: (summary: PdfSummary | null) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  currentScale: number;
  setCurrentScale: (scale: number) => void;
  extractedText: string;
  setExtractedText: (text: string) => void;
}
