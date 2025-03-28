
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PdfLoadingState: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-chat-primary" />
      <p className="mt-4 text-muted-foreground">Loading PDF...</p>
    </div>
  );
};
