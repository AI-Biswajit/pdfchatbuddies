
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
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={65} minSize={40} maxSize={75}>
                <PdfViewer />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={25}>
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
