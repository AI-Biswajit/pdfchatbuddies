
import React from 'react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { PdfViewer } from '@/components/PdfViewer';
import { ChatPanel } from '@/components/ChatPanel';
import { PdfProvider } from '@/context/PdfContext';

const Index: React.FC = () => {
  return (
    <PdfProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <LeftSidebar />
        <main className="flex flex-1 overflow-hidden">
          <PdfViewer />
          <ChatPanel />
        </main>
      </div>
    </PdfProvider>
  );
};

export default Index;
