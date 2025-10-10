import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

/**
 * PDF Field Detector
 * 
 * Automatically detects form fields in PDF documents using:
 * - PDF.js for rendering PDF pages as images
 * - Tesseract.js for OCR text detection
 * - Image processing for rectangle/box detection
 * 
 * This service analyzes PDF forms to automatically generate field mappings
 * without manual coordinate entry.
 */

export interface DetectedField {
  name: string;           // Generated field name
  label: string;          // Detected label text
  x: number;              // X coordinate (from left)
  y: number;              // Y coordinate (from bottom)
  width: number;          // Field width
  height: number;         // Field height
  page: number;           // Page number (1-based)
  confidence: number;     // Detection confidence (0-1)
  type: 'text' | 'checkbox' | 'signature'; // Field type
}

export interface DetectedRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface DetectedText {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FieldDetectionResult {
  fields: DetectedField[];
  rectangles: DetectedRectangle[];
  texts: DetectedText[];
  pageCount: number;
  pageSize: { width: number; height: number };
}

export class PdfFieldDetector {
  private workerSrc: string;

  constructor() {
    // Set up PDF.js worker
    this.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js`;
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
    }
  }

  /**
   * Detect form fields in a PDF file
   * @param pdfFile PDF file as ArrayBuffer or Uint8Array
   * @returns Detected fields and metadata
   */
  async detectFields(pdfFile: ArrayBuffer | Uint8Array): Promise<FieldDetectionResult> {
    try {
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: pdfFile });
      const pdf = await loadingTask.promise;
      
      const pageCount = pdf.numPages;
      const allFields: DetectedField[] = [];
      const allRectangles: DetectedRectangle[] = [];
      const allTexts: DetectedText[] = [];
      let pageSize = { width: 595, height: 842 }; // Default A4

      // Process each page
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better detection
        
        pageSize = { width: viewport.width / 2, height: viewport.height / 2 };

        // Render page to canvas
        const canvas = this.createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        if (!context) {
          console.warn(`Could not get canvas context for page ${pageNum}`);
          continue;
        }

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Detect rectangles (form field boxes)
        const rectangles = await this.detectRectangles(canvas, pageNum);
        allRectangles.push(...rectangles);

        // Perform OCR to detect text labels
        const texts = await this.detectTextWithOCR(canvas, pageNum);
        allTexts.push(...texts);

        // Match texts to rectangles to identify fields
        const fields = this.matchTextToRectangles(texts, rectangles, pageNum, pageSize.height);
        allFields.push(...fields);
      }

      return {
        fields: allFields,
        rectangles: allRectangles,
        texts: allTexts,
        pageCount,
        pageSize
      };
    } catch (error) {
      console.error('Error detecting PDF fields:', error);
      throw new Error('Failed to detect PDF fields: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create a canvas element (works in both browser and Node.js with canvas package)
   */
  private createCanvas(width: number, height: number): HTMLCanvasElement {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    } else {
      // For Node.js environment, would need node-canvas package
      // For now, throw an error as this is primarily for browser use
      throw new Error('Canvas creation is only supported in browser environment');
    }
  }

  /**
   * Detect rectangles in the rendered PDF page
   * Uses edge detection and contour finding
   */
  private async detectRectangles(canvas: HTMLCanvasElement, pageNum: number): Promise<DetectedRectangle[]> {
    const context = canvas.getContext('2d');
    if (!context) return [];

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const rectangles: DetectedRectangle[] = [];

    // Simple rectangle detection based on horizontal and vertical lines
    const edges = this.detectEdges(imageData);
    const detectedRects = this.findRectangles(edges, canvas.width, canvas.height);

    for (const rect of detectedRects) {
      rectangles.push({
        x: rect.x / 2, // Scale back from 2x rendering
        y: rect.y / 2,
        width: rect.width / 2,
        height: rect.height / 2,
        page: pageNum
      });
    }

    return rectangles;
  }

  /**
   * Simple edge detection algorithm
   */
  private detectEdges(imageData: ImageData): Uint8ClampedArray {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const edges = new Uint8ClampedArray(width * height);

    // Convert to grayscale and detect edges
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Convert to grayscale
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // Simple edge detection (Sobel-like)
        const idx_up = ((y - 1) * width + x) * 4;
        const idx_down = ((y + 1) * width + x) * 4;
        const idx_left = (y * width + (x - 1)) * 4;
        const idx_right = (y * width + (x + 1)) * 4;
        
        const gray_up = (data[idx_up] + data[idx_up + 1] + data[idx_up + 2]) / 3;
        const gray_down = (data[idx_down] + data[idx_down + 1] + data[idx_down + 2]) / 3;
        const gray_left = (data[idx_left] + data[idx_left + 1] + data[idx_left + 2]) / 3;
        const gray_right = (data[idx_right] + data[idx_right + 1] + data[idx_right + 2]) / 3;
        
        const dx = Math.abs(gray_right - gray_left);
        const dy = Math.abs(gray_down - gray_up);
        const gradient = Math.sqrt(dx * dx + dy * dy);
        
        edges[y * width + x] = gradient > 50 ? 255 : 0;
      }
    }

    return edges;
  }

  /**
   * Find rectangles from edge data
   */
  private findRectangles(edges: Uint8ClampedArray, width: number, height: number): DetectedRectangle[] {
    const rectangles: DetectedRectangle[] = [];
    const minWidth = 50; // Minimum width for a field
    const minHeight = 15; // Minimum height for a field
    const maxWidth = width * 0.8; // Maximum 80% of page width
    const maxHeight = 100; // Maximum height

    // Simple approach: scan for rectangular regions with strong edges
    for (let y = 0; y < height - minHeight; y += 10) {
      for (let x = 0; x < width - minWidth; x += 10) {
        // Check if this could be the top-left corner of a rectangle
        if (this.hasHorizontalLine(edges, width, x, y, minWidth) &&
            this.hasVerticalLine(edges, width, height, x, y, minHeight)) {
          
          // Try to find the bottom-right corner
          let rectWidth = minWidth;
          let rectHeight = minHeight;
          
          // Extend width
          while (x + rectWidth < width && rectWidth < maxWidth &&
                 this.hasVerticalLine(edges, width, height, x + rectWidth, y, minHeight)) {
            rectWidth += 10;
          }
          
          // Extend height
          while (y + rectHeight < height && rectHeight < maxHeight &&
                 this.hasHorizontalLine(edges, width, x, y + rectHeight, rectWidth)) {
            rectHeight += 10;
          }
          
          // Only add if it looks like a form field
          if (rectWidth >= minWidth && rectWidth <= maxWidth &&
              rectHeight >= minHeight && rectHeight <= maxHeight) {
            
            // Check if this rectangle overlaps with existing ones
            const overlaps = rectangles.some(existing => 
              this.rectanglesOverlap(
                { x, y, width: rectWidth, height: rectHeight },
                existing
              )
            );
            
            if (!overlaps) {
              rectangles.push({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                page: 1 // Will be set by caller
              });
            }
          }
        }
      }
    }

    return rectangles;
  }

  /**
   * Check if there's a horizontal line at the given position
   */
  private hasHorizontalLine(edges: Uint8ClampedArray, width: number, x: number, y: number, length: number): boolean {
    let edgeCount = 0;
    const threshold = length * 0.3; // At least 30% should be edges
    
    for (let i = 0; i < length && x + i < width; i++) {
      if (edges[y * width + x + i] > 128) {
        edgeCount++;
      }
    }
    
    return edgeCount >= threshold;
  }

  /**
   * Check if there's a vertical line at the given position
   */
  private hasVerticalLine(edges: Uint8ClampedArray, width: number, height: number, x: number, y: number, length: number): boolean {
    let edgeCount = 0;
    const threshold = length * 0.3;
    
    for (let i = 0; i < length && y + i < height; i++) {
      if (edges[(y + i) * width + x] > 128) {
        edgeCount++;
      }
    }
    
    return edgeCount >= threshold;
  }

  /**
   * Check if two rectangles overlap
   */
  private rectanglesOverlap(rect1: { x: number; y: number; width: number; height: number }, 
                           rect2: { x: number; y: number; width: number; height: number }): boolean {
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
  }

  /**
   * Perform OCR on the canvas to detect text
   */
  private async detectTextWithOCR(canvas: HTMLCanvasElement, pageNum: number): Promise<DetectedText[]> {
    try {
      const result = await Tesseract.recognize(canvas, 'pol', {
        logger: m => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress (Page ${pageNum}): ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const texts: DetectedText[] = [];
      
      if (result.data.words) {
        for (const word of result.data.words) {
          texts.push({
            text: word.text,
            x: word.bbox.x0 / 2, // Scale back from 2x rendering
            y: word.bbox.y0 / 2,
            width: (word.bbox.x1 - word.bbox.x0) / 2,
            height: (word.bbox.y1 - word.bbox.y0) / 2,
            confidence: word.confidence / 100
          });
        }
      }

      return texts;
    } catch (error) {
      console.error(`Error performing OCR on page ${pageNum}:`, error);
      return [];
    }
  }

  /**
   * Match detected text to rectangles to identify form fields
   */
  private matchTextToRectangles(
    texts: DetectedText[],
    rectangles: DetectedRectangle[],
    pageNum: number,
    pageHeight: number
  ): DetectedField[] {
    const fields: DetectedField[] = [];
    const maxDistance = 100; // Maximum distance between label and field

    for (const rect of rectangles) {
      // Look for text near this rectangle (typically above or to the left)
      let closestText: DetectedText | null = null;
      let minDistance = maxDistance;

      for (const text of texts) {
        // Calculate distance from text to rectangle
        const distance = this.calculateDistance(
          { x: text.x, y: text.y },
          { x: rect.x, y: rect.y }
        );

        // Text should be above or to the left of the field
        const isAbove = text.y < rect.y && text.y > rect.y - maxDistance;
        const isLeft = text.x < rect.x && text.x > rect.x - maxDistance && 
                      Math.abs(text.y - rect.y) < 30;

        if ((isAbove || isLeft) && distance < minDistance && text.confidence > 0.5) {
          closestText = text;
          minDistance = distance;
        }
      }

      // Generate field name from label or use generic name
      const fieldName = closestText 
        ? this.generateFieldName(closestText.text)
        : `field_${pageNum}_${Math.round(rect.x)}_${Math.round(rect.y)}`;

      const label = closestText ? closestText.text : '';

      // Determine field type based on size and label
      const fieldType = this.determineFieldType(rect, label);

      // Convert Y coordinate to PDF coordinate system (from bottom)
      const pdfY = pageHeight - (rect.y + rect.height);

      fields.push({
        name: fieldName,
        label: label,
        x: Math.round(rect.x),
        y: Math.round(pdfY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        page: pageNum,
        confidence: closestText ? closestText.confidence : 0.5,
        type: fieldType
      });
    }

    return fields;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Generate a field name from label text
   */
  private generateFieldName(label: string): string {
    // Remove Polish characters and special characters
    let name = label.toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (char) => {
        const map: Record<string, string> = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
          'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return name || 'unnamed_field';
  }

  /**
   * Determine field type based on size and label
   */
  private determineFieldType(rect: DetectedRectangle, label: string): 'text' | 'checkbox' | 'signature' {
    const area = rect.width * rect.height;
    
    // Small square boxes are likely checkboxes
    if (rect.width < 30 && rect.height < 30 && Math.abs(rect.width - rect.height) < 10) {
      return 'checkbox';
    }
    
    // Large boxes with "podpis" in label are signatures
    if (label.toLowerCase().includes('podpis') && area > 5000) {
      return 'signature';
    }
    
    // Everything else is a text field
    return 'text';
  }

  /**
   * Generate a mapping.json file from detected fields
   */
  generateMapping(detectionResult: FieldDetectionResult, formVersion: string = '2023'): object {
    const fields: Record<string, any> = {};
    
    for (const field of detectionResult.fields) {
      fields[field.name] = {
        pdfField: field.name,
        page: field.page,
        x: field.x,
        y: field.y,
        label: field.label,
        type: field.type,
        confidence: field.confidence
      };
    }

    return {
      version: formVersion,
      fields: fields,
      calculations: {},
      metadata: {
        generatedBy: 'PdfFieldDetector',
        generatedAt: new Date().toISOString(),
        pageCount: detectionResult.pageCount,
        pageSize: detectionResult.pageSize
      }
    };
  }

  /**
   * Detect fields from a PDF URL
   */
  async detectFieldsFromUrl(pdfUrl: string): Promise<FieldDetectionResult> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from ${pdfUrl}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return this.detectFields(arrayBuffer);
  }
}
