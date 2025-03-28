
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PdfErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

export const PdfErrorState: React.FC<PdfErrorStateProps> = ({ 
  errorMessage, 
  onRetry 
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-destructive">Error</h3>
      <p className="text-muted-foreground text-center max-w-md">
        {errorMessage || "Failed to load the PDF. Please try again with a different file."}
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="mt-4 flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
};
