import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file
 * @param pdfBuffer - Buffer containing the PDF data
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfData = await pdfParse(pdfBuffer, {
      // Set reasonable limits to prevent hanging
      max: 5000000, // Maximum characters to extract (5 MB)
    });
    
    // Return text or an empty string if null/undefined
    return pdfData.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Fetch a PDF from a URL and extract its text
 * @param url - URL of the PDF file
 * @returns Promise resolving to the extracted text
 */
export async function fetchAndExtractPDFText(url: string): Promise<string> {
  try {
    // Use fetch with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Mozilla/5.0 (compatible; ChatbotService/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf') && !contentType.includes('octet-stream')) {
      console.warn(`Warning: Response content-type is not PDF: ${contentType}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    
    // Check if we actually received data
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      throw new Error('Received empty PDF buffer');
    }
    
    const buffer = Buffer.from(pdfBuffer);
    return await extractTextFromPDF(buffer);
  } catch (error) {
    console.error('Error fetching or processing PDF:', error);
    // Return empty string instead of throwing to avoid breaking the application
    return '';
  }
} 