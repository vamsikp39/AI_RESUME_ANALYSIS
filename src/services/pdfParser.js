import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure local Vite-bundled worker path for high-performance in-browser parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts plain text from an uploaded PDF file in-browser.
 * @param {File} file - The uploaded PDF file object.
 * @param {Function} onProgress - Optional callback for tracking parsing progress.
 * @returns {Promise<string>} Plain text content extracted from the PDF.
 */
export async function parsePdf(file, onProgress) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    // Register progress updates if provided
    if (onProgress) {
      loadingTask.onProgress = (progressData) => {
        if (progressData.total > 0) {
          const percent = Math.round((progressData.loaded / progressData.total) * 100);
          onProgress(percent);
        }
      };
    }
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    const totalPages = pdf.numPages;
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text pieces with spaces, maintaining general structural flow
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
        
      fullText += pageText + '\n';
      
      if (onProgress && !loadingTask.onProgress) {
        onProgress(Math.round((pageNum / totalPages) * 100));
      }
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF resume. The file may be corrupt or encrypted.', { cause: error });
  }
}

/**
 * Simple client-side fallback text extractor for TXT or pasted text inputs.
 * @param {File} file - The file to read.
 * @returns {Promise<string>}
 */
export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read text file.'));
    reader.readAsText(file);
  });
}
