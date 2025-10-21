import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local worker file with correct base path
// Respect Vite's base URL configuration for GitHub Pages deployment
if (typeof window !== 'undefined') {
  const basePath = import.meta.env.BASE_URL || '/';
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    `${basePath}pdf.worker.min.mjs`,
    window.location.origin
  ).href;
}

/**
 * Field mapping interface for detected fields
 */
export interface FieldMapping {
  label: string;
  coordinates: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  page: number;
  confidence: number;
}

/**
 * Core OCR service for detecting text and field positions in PDF forms
 *
 * @deprecated This class is a simplified version. Use PdfFieldDetector for production use.
 * PdfFieldDetector provides enhanced detection with better accuracy and more features.
 */
export class PdfOcrDetector {
  private worker: Worker | null = null;

  constructor() {
    // Worker will be initialized in init()
  }

  /**
   * Initialize the OCR worker
   */
  async init(): Promise<void> {
    this.worker = await createWorker('pol', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
  }

  /**
   * Detect fields in a PDF document
   * @param pdfUrl URL or ArrayBuffer of the PDF
   * @returns Array of detected field mappings
   */
  async detectFields(pdfUrl: string | ArrayBuffer | Uint8Array): Promise<FieldMapping[]> {
    if (!this.worker) {
      throw new Error('OCR worker not initialized. Call init() first.');
    }

    const loadingTask = pdfjsLib.getDocument(
      typeof pdfUrl === 'string' ? pdfUrl : { data: pdfUrl }
    );
    const pdf = await loadingTask.promise;
    const fieldMappings: FieldMapping[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        console.warn(`Could not get canvas context for page ${pageNum}`);
        continue;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const {
        data: { words },
      } = await this.worker.recognize(canvas);

      // Example field detection logic - looks for common field labels
      const fieldKeywords = /Nazwisko:|PESEL:|Adres:|NIP:|Imię:|Data:|Telefon:|Email:/i;

      words?.forEach((word) => {
        if (word.text && fieldKeywords.test(word.text)) {
          fieldMappings.push({
            label: word.text,
            coordinates: {
              x0: word.bbox.x0 / 2, // Scale back from 2x rendering
              y0: word.bbox.y0 / 2,
              x1: word.bbox.x1 / 2,
              y1: word.bbox.y1 / 2,
            },
            page: pageNum,
            confidence: word.confidence / 100,
          });
        }
      });
    }

    return fieldMappings;
  }

  /**
   * Terminate the OCR worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
