import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker properly
const pdfjsVersion = pdfjs.version;
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  // Use CDN worker to avoid issues with blob URLs
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

/**
 * Extract text content from a PDF file
 * @param pdfUrl URL of the PDF file
 * @returns Promise resolving to the extracted text
 */
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    // Create a new loading task with proper configuration
    const loadingTask = pdfjs.getDocument({
      url: pdfUrl,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/cmaps/`,
      cMapPacked: true,
      enableXfa: true, // Enable XFA forms for better compatibility
      disableRange: true, // Disable range requests which can cause issues with blob URLs
      disableStream: true, // Disable streaming for better blob URL handling
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get a summary of the PDF content (placeholder for future AI integration)
 * @param text The extracted text from the PDF
 * @param maxLength Maximum length of the summary
 * @returns A summary of the PDF content
 */
export const generatePdfSummary = (text: string, maxLength: number = 200): string => {
  // This is a placeholder for future AI-based summarization
  // For now, just return the first part of the text
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...'
    : text;
};

/**
 * Search for text in PDF content
 * @param text The extracted text from the PDF
 * @param query The search query
 * @returns An array of matches with context
 */
export const searchPdfContent = (text: string, query: string): Array<{match: string, context: string}> => {
  if (!query.trim()) return [];
  
  const results: Array<{match: string, context: string}> = [];
  const lines = text.split('\n');
  const queryLower = query.toLowerCase();
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(queryLower)) {
      // Get some context (lines before and after)
      const startIdx = Math.max(0, index - 1);
      const endIdx = Math.min(lines.length - 1, index + 1);
      const context = lines.slice(startIdx, endIdx + 1).join('\n');
      
      results.push({
        match: line,
        context
      });
    }
  });
  
  return results;
};
