import React, { useRef } from 'react';
import { usePdf } from '@/context/PdfContext';
import { generateMockSummary } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, FolderPlus, LogIn, Settings, Plus } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    setPdfFile, 
    setIsProcessing, 
    setProcessingError, 
    setSummary,
    setChatMessages,
    pdfFile,
  } = usePdf();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      setProcessingError('Invalid file type. Please upload a PDF file.');
      return;
    }

    // Reset previous state
    setProcessingError(null);
    setIsProcessing(true);
    setChatMessages([]);

    // Create object URL for the PDF
    const objectUrl = URL.createObjectURL(file);
    
    setPdfFile({
      name: file.name,
      url: objectUrl,
    });

    // Simulate processing delay
    try {
      toast.info('Analyzing PDF & Generating Summary...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set mock summary
      const mockSummary = generateMockSummary(file.name);
      setSummary(mockSummary);
      
      toast.success('PDF processed successfully!');
    } catch (error) {
      console.error('Error processing PDF:', error);
      setProcessingError('Failed to process the document.');
      toast.error('Failed to process the document.');
    } finally {
      setIsProcessing(false);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewChat = () => {
    if (!pdfFile) {
      fileInputRef.current?.click();
    } else {
      // Reset chat while keeping the same PDF
      setChatMessages([]);
      toast.info('Started a new chat with the current PDF');
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-[#1A1A1A] text-white">
      <div className="flex items-center gap-2 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-chat-primary">
          <FileText size={18} />
        </div>
        <h1 className="text-xl font-bold">ChatPDF</h1>
      </div>
      
      <div className="px-3 py-4">
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20"
          variant="ghost"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      
      <div className="px-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full justify-start gap-2 bg-chat-primary text-white hover:bg-chat-primary/90"
        >
          <FileText size={16} />
          Upload PDF
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
      </div>
      
      {pdfFile && (
        <div className="mt-4 px-4">
          <p className="text-xs text-white/50">CURRENT DOCUMENT</p>
          <div className="mt-2 flex items-center gap-2 rounded-md bg-white/10 p-2 text-sm">
            <FileText size={14} className="text-chat-primary" />
            <span className="truncate">{pdfFile.name}</span>
          </div>
        </div>
      )}
      
      <div className="mt-auto px-3 py-4">
        <Button variant="ghost" className="w-full justify-start gap-2 text-white/70 hover:text-white">
          <FolderPlus size={16} />
          New Folder
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-white/70 hover:text-white">
          <Settings size={16} />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-white/70 hover:text-white">
          <LogIn size={16} />
          Sign in
        </Button>
      </div>
    </aside>
  );
};
