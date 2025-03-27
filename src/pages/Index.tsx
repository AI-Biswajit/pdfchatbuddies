
import React from 'react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { PdfViewer } from '@/components/PdfViewer';
import { ChatPanel } from '@/components/ChatPanel';
import { PdfProvider } from '@/context/PdfContext';
import { MobileLayout } from '@/components/MobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';

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
            <PdfViewer />
            <ChatPanel />
          </main>
        </div>
      )}
    </PdfProvider>
  );
};

export default Index;
