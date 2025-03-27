
import React, { useState, useRef, useEffect } from 'react';
import { usePdf } from '@/context/PdfContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuggestionPrompt } from '@/types';
import { getAiResponse } from '@/utils/mockData';
import { ResizablePanel } from './ResizablePanel';
import { cn } from '@/lib/utils';
import { Send, ListChecks, ThumbsUp, ThumbsDown, Copy, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export const ChatPanel: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    pdfFile,
    isProcessing,
    processingError,
    summary,
    chatMessages,
    addChatMessage
  } = usePdf();

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    // Add user message
    addChatMessage({
      sender: 'user',
      text: text.trim()
    });
    
    // Clear input
    setInputValue('');
    
    // Focus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add AI response
    const aiResponse = getAiResponse(text.trim());
    addChatMessage({
      sender: 'ai',
      text: aiResponse
    });
  };

  const handleSuggestionClick = (suggestion: SuggestionPrompt) => {
    handleSendMessage(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <ResizablePanel className="h-full" direction="horizontal" defaultSize={380} minSize={320} maxSize={600}>
      <div className="flex h-full flex-col border-l border-chat-border bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-chat-border p-4">
          <h2 className="text-lg font-semibold">Chat</h2>
        </div>
        
        {/* Chat Messages */}
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {!pdfFile ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
              <div className="mb-6 rounded-full bg-chat-primary/10 p-4">
                <FileTextIcon className="h-8 w-8 text-chat-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Upload a PDF to start</h3>
              <p className="mb-6 text-muted-foreground">
                Chat with your document by uploading a PDF file first.
              </p>
            </div>
          ) : isProcessing ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
              <div className="animate-pulse mb-6 rounded-full bg-chat-primary/10 p-4">
                <ListChecks className="h-8 w-8 text-chat-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Analyzing PDF</h3>
              <p className="mb-6 text-muted-foreground">
                Please wait while we process your document...
              </p>
              <div className="h-2 w-40 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-chat-primary animate-pulse-soft" style={{ width: '70%' }}></div>
              </div>
            </div>
          ) : processingError ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
              <div className="mb-6 rounded-full bg-red-100 p-4">
                <AlertCircleIcon className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-red-500">Error</h3>
              <p className="mb-6 text-muted-foreground">{processingError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Summary - shown when chat is empty */}
              {chatMessages.length === 0 && summary && (
                <div className="mb-6 animate-fade-in">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-chat-primary">
                      <span className="text-xs font-medium text-white">AI</span>
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg rounded-tl-none bg-chat-ai p-4 shadow-sm">
                        <p className="mb-4 text-base">Hey there! I'm excited to chat with you about this topic!</p>
                        <div className="space-y-2 text-sm">
                          <p>{summary.text}</p>
                          <p className="mt-4">I've read through all 22 pages and I'm here to help you with it!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggested prompts */}
                  <div className="mt-6 space-y-2">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">SUGGESTED QUESTIONS</p>
                    {summary.suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="outline"
                        className="w-full justify-start bg-transparent text-left hover:bg-chat-primary/5"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="mr-2 text-chat-primary">•</span>
                        {suggestion.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Conversation Messages */}
              <div className="space-y-6">
                {chatMessages.map((message) => (
                  <div key={message.id} className={cn("flex items-start gap-3 animate-slide-in", 
                    message.sender === 'user' ? "justify-end" : ""
                  )}>
                    {message.sender === 'ai' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-chat-primary">
                        <span className="text-xs font-medium text-white">AI</span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[85%] rounded-lg p-4 shadow-sm",
                      message.sender === 'ai' 
                        ? "bg-chat-ai rounded-tl-none" 
                        : "bg-chat-user rounded-tr-none"
                    )}>
                      <p className="whitespace-pre-line">{message.text}</p>
                      
                      {message.sender === 'ai' && (
                        <div className="mt-2 flex items-center gap-1 pt-1 text-muted-foreground">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(message.text);
                              toast.success('Copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
        
        {/* Chat Input */}
        <div className="chat-input-container border-t border-chat-border p-4">
          <div className="relative flex items-center">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask any question..."
              className="pr-10"
              disabled={!pdfFile || isProcessing || !!processingError}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 h-8 w-8"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || !pdfFile || isProcessing || !!processingError}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </ResizablePanel>
  );
};

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);
