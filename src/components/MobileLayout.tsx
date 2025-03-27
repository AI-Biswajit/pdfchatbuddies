import React, { useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { LeftSidebar } from './LeftSidebar';
import { PdfViewer } from './PdfViewer';
import { ChatPanel } from './ChatPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, MessageSquare, FileText } from 'lucide-react';

export const MobileLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<'pdf' | 'chat'>('pdf');
  const { pdfFile } = usePdf();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-chat-border bg-[#1A1A1A] p-3 text-white">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => document.getElementById('sidebar-trigger')?.click()}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
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
        {/* Sidebar (hidden by default on mobile) */}
        <div className="absolute inset-0 z-30 transform -translate-x-full transition-transform duration-300 ease-in-out" id="mobile-sidebar">
          <LeftSidebar />
          <div 
            className="absolute top-4 right-4 z-40"
            id="sidebar-close"
            onClick={() => document.getElementById('sidebar-trigger')?.click()}
          >
            <Button variant="ghost" size="icon" className="bg-white/10 text-white hover:bg-white/20">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Toggle for sidebar */}
        <input 
          type="checkbox" 
          id="sidebar-trigger" 
          className="hidden" 
          onChange={(e) => {
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar) {
              if (e.target.checked) {
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0');
              } else {
                sidebar.classList.remove('translate-x-0');
                sidebar.classList.add('-translate-x-full');
              }
            }
          }}
        />
        
        {/* Main Content */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'pdf' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
          <PdfViewer />
        </div>
        
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeView === 'chat' ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};