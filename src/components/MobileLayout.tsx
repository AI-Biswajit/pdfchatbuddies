
import React, { useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { LeftSidebar } from './LeftSidebar';
import { PdfViewer } from './PdfViewer';
import { ChatPanel } from './ChatPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, MessageSquare, FileText } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const MobileLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<'pdf' | 'chat'>('pdf');
  const { pdfFile } = usePdf();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-chat-border bg-[#1A1A1A] p-3 text-white">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#1A1A1A] w-[280px]">
              <LeftSidebar />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-bold">ChatPDF</h1>
          
          {pdfFile && (
            <div className="flex gap-1">
              <Button
                variant={activeView === 'pdf' ? 'default' : 'ghost'}
                size="icon"
                className={activeView === 'pdf' ? 'bg-chat-primary text-white' : 'text-white hover:bg-white/10'}
                onClick={() => setActiveView('pdf')}
              >
                <FileText className="h-5 w-5" />
              </Button>
              
              <Button
                variant={activeView === 'chat' ? 'default' : 'ghost'}
                size="icon"
                className={activeView === 'chat' ? 'bg-chat-primary text-white' : 'text-white hover:bg-white/10'}
                onClick={() => setActiveView('chat')}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Content */}
        <div className="relative flex flex-1 overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'pdf' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
            <PdfViewer />
          </div>
          
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'chat' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
            <ChatPanel />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
