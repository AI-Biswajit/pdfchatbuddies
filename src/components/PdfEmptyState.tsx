
import React from 'react';
import { FileText } from 'lucide-react';

export const PdfEmptyState: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-4 rounded-full bg-chat-primary/10 p-4">
        <FileText className="h-12 w-12 text-chat-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No PDF loaded</h3>
      <p className="text-muted-foreground">
        Upload a PDF from the sidebar to get started.
      </p>
    </div>
  );
};
