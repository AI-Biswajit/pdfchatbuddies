
import React from 'react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { PdfViewer } from '@/components/PdfViewer';
import { ChatPanel } from '@/components/ChatPanel';
import { PdfProvider } from '@/context/PdfContext';
import { MobileLayout } from '@/components/MobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <PdfProvider>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <div className="flex h-screen w-full overflow-hidden">
          <LeftSidebar />
          <main className="flex flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="w-full">
              <ResizablePanel defaultSize={65} minSize={30} maxSize={80} className="transition-all">
                <PdfViewer />
              </ResizablePanel>
              <ResizableHandle withHandle className="transition-colors hover:bg-primary" />
              <ResizablePanel defaultSize={35} minSize={20} maxSize={70} className="transition-all">
                <ChatPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </div>
      )}
    </PdfProvider>
  );
};

export default Index;
