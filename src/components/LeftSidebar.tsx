
import React, { useRef } from 'react';
import { usePdf } from '@/context/PdfContext';
import { generateMockSummary } from '@/utils/mockData';
import { extractTextFromPdf } from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, FolderPlus, LogIn, Settings, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export const LeftSidebar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    setPdfFile, 
    setIsProcessing, 
    setProcessingError, 
    setSummary,
    setChatMessages,
    pdfFile,
    setExtractedText
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

    try {
      // Create object URL for the PDF
      const objectUrl = URL.createObjectURL(file);
      console.log("Created object URL:", objectUrl);
      
      // Set the PDF file object with the file name and URL
      const pdfFileObj = {
        name: file.name,
        url: objectUrl,
      };
      
      toast.info('Loading PDF file...');
      
      // First set the PDF file to trigger loading
      await setPdfFile(pdfFileObj);
      
      // Try to extract text in the background after PDF is loaded
      setTimeout(async () => {
        try {
          const text = await extractTextFromPdf(objectUrl);
          setExtractedText(text);
          
          // Set mock summary
          const mockSummary = generateMockSummary(file.name);
          setSummary(mockSummary);
          
          toast.success('PDF processed successfully!');
        } catch (error) {
          console.error('Error extracting text from PDF:', error);
          toast.warning('Could not extract text from PDF. Some features may be limited.');
        } finally {
          setIsProcessing(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setProcessingError('Failed to process the document.');
      toast.error('Failed to process the document.');
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-chat-primary">
              <FileText size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">ChatPDF</h1>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleNewChat}
                className="justify-start gap-2 bg-white/10 hover:bg-white/20 w-full"
              >
                <Plus size={16} />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => fileInputRef.current?.click()}
                className="justify-start gap-2 bg-chat-primary text-white hover:bg-chat-primary/90 w-full"
              >
                <FileText size={16} />
                <span>Upload PDF</span>
              </SidebarMenuButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
            </SidebarMenuItem>
          </SidebarMenu>
          
          {pdfFile && (
            <div className="mt-4 px-4">
              <p className="text-xs text-sidebar-foreground/50">CURRENT DOCUMENT</p>
              <div className="mt-2 flex items-center gap-2 rounded-md bg-sidebar-accent p-2 text-sm">
                <FileText size={14} className="text-chat-primary" />
                <span className="truncate">{pdfFile.name}</span>
              </div>
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground w-full">
              <FolderPlus size={16} />
              <span>New Folder</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground w-full">
              <Settings size={16} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground w-full">
              <LogIn size={16} />
              <span>Sign in</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
