
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PdfLoadingState: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-16">
      <Loader2 className="h-12 w-12 animate-spin text-chat-primary" />
      <p className="mt-4 text-muted-foreground">Loading PDF document...</p>
      <p className="text-xs text-muted-foreground mt-2">This may take a moment for large files</p>
    </div>
  );
};
