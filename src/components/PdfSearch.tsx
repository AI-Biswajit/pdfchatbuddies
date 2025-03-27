import React, { useState } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { searchPdfContent } from '@/utils/pdfUtils';
import { toast } from 'sonner';

interface SearchResult {
  match: string;
  context: string;
}

export const PdfSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { pdfFile, extractedText } = usePdf();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (!pdfFile || !extractedText) {
      toast.error('No PDF loaded or text extracted');
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Use the utility function to search the PDF content
      const results = searchPdfContent(extractedText, searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info(`No results found for "${searchQuery}"`);
      } else {
        toast.success(`Found ${results.length} matches for "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Error searching PDF:', error);
      toast.error('Failed to search the document');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  if (!pdfFile) return null;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b border-chat-border bg-background pdf-controls">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pr-8"
            disabled={isSearching}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
        >
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
      </div>

      {showResults && (
        <div className="max-h-60 overflow-y-auto p-2 bg-background border-b border-chat-border">
          {isSearching ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Found {searchResults.length} results
              </p>
              {searchResults.map((result, index) => (
                <div key={index} className="p-2 rounded-md bg-muted/50 text-sm">
                  <p className="whitespace-pre-line">{result.context}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};