
import React from 'react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { PdfViewer } from '@/components/PdfViewer';
import { ChatPanel } from '@/components/ChatPanel';
import { PdfProvider } from '@/context/PdfContext';
import { MobileLayout } from '@/components/MobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { 
  SidebarProvider, 
  SidebarInset 
} from '@/components/ui/sidebar';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <PdfProvider>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen w-full overflow-hidden">
            <LeftSidebar />
            <SidebarInset>
              <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                <ResizablePanel 
                  defaultSize={65} 
                  minSize={30} 
                  maxSize={80} 
                  className="transition-all overflow-hidden"
                >
                  <PdfViewer />
                </ResizablePanel>
                <ResizableHandle withHandle className="transition-colors hover:bg-primary" />
                <ResizablePanel 
                  defaultSize={35} 
                  minSize={20} 
                  maxSize={70} 
                  className="transition-all overflow-hidden"
                >
                  <ChatPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </SidebarInset>
          </div>
        </SidebarProvider>
      )}
    </PdfProvider>
  );
};

export default Index;
