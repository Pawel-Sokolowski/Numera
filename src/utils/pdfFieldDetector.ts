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
  name: string; // Generated field name
  label: string; // Detected label text
  x: number; // X coordinate (from left)
  y: number; // Y coordinate (from bottom)
  width: number; // Field width
  height: number; // Field height
  page: number; // Page number (1-based)
  confidence: number; // Detection confidence (0-1)
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
          viewport: viewport,
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
        pageSize,
      };
    } catch (error) {
      console.error('Error detecting PDF fields:', error);
      throw new Error(
        'Failed to detect PDF fields: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  /**
   * Create a canvas element (works in both browser and Node.js with canvas package)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createCanvas(width: number, height: number): any {
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
   * Uses enhanced edge detection, morphological operations, and improved contour finding
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async detectRectangles(canvas: any, pageNum: number): Promise<DetectedRectangle[]> {
    const context = canvas.getContext('2d');
    if (!context) return [];

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const rectangles: DetectedRectangle[] = [];

    // Enhanced detection pipeline
    const edges = this.detectEdges(imageData);
    const cleaned = this.morphologicalClose(edges, canvas.width, canvas.height);
    const detectedRects = this.findRectangles(cleaned, canvas.width, canvas.height);

    for (const rect of detectedRects) {
      rectangles.push({
        x: rect.x / 2, // Scale back from 2x rendering
        y: rect.y / 2,
        width: rect.width / 2,
        height: rect.height / 2,
        page: pageNum,
      });
    }

    return rectangles;
  }

  /**
   * Enhanced edge detection using Sobel operator with improved gradient calculation
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private detectEdges(imageData: any): Uint8ClampedArray {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const grayscale = new Uint8ClampedArray(width * height);
    const edges = new Uint8ClampedArray(width * height);

    // Step 1: Convert to grayscale with proper luminance weighting
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Use proper luminance formula for better grayscale conversion
        grayscale[y * width + x] = Math.round(
          0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
        );
      }
    }

    // Step 2: Apply enhanced Sobel operator with 3x3 kernel
    // Sobel X kernel:  [-1  0  1]    Sobel Y kernel:  [-1 -2 -1]
    //                  [-2  0  2]                     [ 0  0  0]
    //                  [-1  0  1]                     [ 1  2  1]
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        // Get 3x3 neighborhood
        const p00 = grayscale[(y - 1) * width + (x - 1)];
        const p01 = grayscale[(y - 1) * width + x];
        const p02 = grayscale[(y - 1) * width + (x + 1)];
        const p10 = grayscale[y * width + (x - 1)];
        const p12 = grayscale[y * width + (x + 1)];
        const p20 = grayscale[(y + 1) * width + (x - 1)];
        const p21 = grayscale[(y + 1) * width + x];
        const p22 = grayscale[(y + 1) * width + (x + 1)];

        // Apply Sobel kernels
        const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
        const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;

        // Calculate gradient magnitude
        const gradient = Math.sqrt(gx * gx + gy * gy);

        // Adaptive thresholding - lower threshold for better detection
        edges[y * width + x] = gradient > 40 ? 255 : 0;
      }
    }

    return edges;
  }

  /**
   * Apply morphological operations to reduce noise and enhance edges
   */
  private morphologicalClose(
    edges: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(width * height);
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);

    // Dilation followed by erosion (closing operation)
    // This helps connect nearby edges and fill small gaps
    const dilated = new Uint8ClampedArray(width * height);

    // Dilation
    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        let maxVal = 0;
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const val = edges[(y + ky) * width + (x + kx)];
            if (val > maxVal) maxVal = val;
          }
        }
        dilated[y * width + x] = maxVal;
      }
    }

    // Erosion
    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        let minVal = 255;
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const val = dilated[(y + ky) * width + (x + kx)];
            if (val < minVal) minVal = val;
          }
        }
        result[y * width + x] = minVal;
      }
    }

    return result;
  }

  /**
   * Find rectangles from edge data with improved heuristics
   */
  private findRectangles(
    edges: Uint8ClampedArray,
    width: number,
    height: number
  ): DetectedRectangle[] {
    const rectangles: DetectedRectangle[] = [];
    const minWidth = 40; // Reduced minimum width for better detection
    const minHeight = 12; // Reduced minimum height for better detection
    const maxWidth = width * 0.85; // Slightly increased maximum
    const maxHeight = 120; // Increased for larger fields
    const scanStep = 5; // Finer scanning for better precision

    // Enhanced approach: scan with finer granularity and better validation
    for (let y = 0; y < height - minHeight; y += scanStep) {
      for (let x = 0; x < width - minWidth; x += scanStep) {
        // Check if this could be the top-left corner of a rectangle
        if (
          this.hasHorizontalLine(edges, width, x, y, minWidth) &&
          this.hasVerticalLine(edges, width, height, x, y, minHeight)
        ) {
          // Try to find the bottom-right corner with adaptive extension
          let rectWidth = minWidth;
          let rectHeight = minHeight;

          // Extend width with better boundary detection
          while (x + rectWidth < width && rectWidth < maxWidth) {
            if (this.hasVerticalLine(edges, width, height, x + rectWidth, y, minHeight)) {
              rectWidth += scanStep;
            } else {
              break;
            }
          }

          // Extend height with better boundary detection
          while (y + rectHeight < height && rectHeight < maxHeight) {
            if (this.hasHorizontalLine(edges, width, x, y + rectHeight, rectWidth)) {
              rectHeight += scanStep;
            } else {
              break;
            }
          }

          // Validate rectangle dimensions and aspect ratio
          const aspectRatio = rectWidth / rectHeight;
          const isValidField =
            rectWidth >= minWidth &&
            rectWidth <= maxWidth &&
            rectHeight >= minHeight &&
            rectHeight <= maxHeight &&
            aspectRatio >= 0.5 &&
            aspectRatio <= 50; // Reasonable aspect ratios

          if (isValidField) {
            // Check if this rectangle overlaps significantly with existing ones
            const overlaps = rectangles.some((existing) =>
              this.rectanglesOverlap(
                { x, y, width: rectWidth, height: rectHeight },
                existing,
                0.5 // 50% overlap threshold
              )
            );

            if (!overlaps) {
              rectangles.push({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                page: 1, // Will be set by caller
              });
            }
          }
        }
      }
    }

    // Post-processing: merge nearby rectangles that likely belong to the same field
    return this.mergeNearbyRectangles(rectangles);
  }

  /**
   * Check if there's a horizontal line at the given position with improved detection
   */
  private hasHorizontalLine(
    edges: Uint8ClampedArray,
    width: number,
    x: number,
    y: number,
    length: number
  ): boolean {
    let edgeCount = 0;
    const threshold = length * 0.25; // Reduced threshold for better detection (25%)
    const tolerance = 2; // Allow slight vertical drift

    for (let i = 0; i < length && x + i < width; i++) {
      // Check a small vertical range to account for line thickness
      let hasEdgeInRange = false;
      for (let dy = -tolerance; dy <= tolerance; dy++) {
        const checkY = y + dy;
        if (checkY >= 0 && checkY < edges.length / width) {
          if (edges[checkY * width + x + i] > 128) {
            hasEdgeInRange = true;
            break;
          }
        }
      }
      if (hasEdgeInRange) {
        edgeCount++;
      }
    }

    return edgeCount >= threshold;
  }

  /**
   * Check if there's a vertical line at the given position with improved detection
   */
  private hasVerticalLine(
    edges: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    length: number
  ): boolean {
    let edgeCount = 0;
    const threshold = length * 0.25; // Reduced threshold for better detection (25%)
    const tolerance = 2; // Allow slight horizontal drift

    for (let i = 0; i < length && y + i < height; i++) {
      // Check a small horizontal range to account for line thickness
      let hasEdgeInRange = false;
      for (let dx = -tolerance; dx <= tolerance; dx++) {
        const checkX = x + dx;
        if (checkX >= 0 && checkX < width) {
          if (edges[(y + i) * width + checkX] > 128) {
            hasEdgeInRange = true;
            break;
          }
        }
      }
      if (hasEdgeInRange) {
        edgeCount++;
      }
    }

    return edgeCount >= threshold;
  }

  /**
   * Check if two rectangles overlap with configurable threshold
   */
  private rectanglesOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number },
    threshold: number = 0.5
  ): boolean {
    // Calculate overlap area
    const xOverlap = Math.max(
      0,
      Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x)
    );
    const yOverlap = Math.max(
      0,
      Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y)
    );
    const overlapArea = xOverlap * yOverlap;

    // Calculate minimum area of the two rectangles
    const area1 = rect1.width * rect1.height;
    const area2 = rect2.width * rect2.height;
    const minArea = Math.min(area1, area2);

    // Check if overlap exceeds threshold
    return overlapArea / minArea > threshold;
  }

  /**
   * Merge nearby rectangles that likely belong to the same field
   */
  private mergeNearbyRectangles(rectangles: DetectedRectangle[]): DetectedRectangle[] {
    if (rectangles.length === 0) return rectangles;

    const merged: DetectedRectangle[] = [];
    const processed = new Set<number>();
    const proximityThreshold = 15; // pixels

    for (let i = 0; i < rectangles.length; i++) {
      if (processed.has(i)) continue;

      const rect1 = rectangles[i];
      const toMerge = [rect1];
      processed.add(i);

      // Find nearby rectangles
      for (let j = i + 1; j < rectangles.length; j++) {
        if (processed.has(j)) continue;

        const rect2 = rectangles[j];
        const distance = this.calculateRectangleDistance(rect1, rect2);

        if (distance < proximityThreshold) {
          toMerge.push(rect2);
          processed.add(j);
        }
      }

      // Merge if multiple rectangles found
      if (toMerge.length > 1) {
        merged.push(this.mergeBoundingBox(toMerge));
      } else {
        merged.push(rect1);
      }
    }

    return merged;
  }

  /**
   * Calculate minimum distance between two rectangles
   */
  private calculateRectangleDistance(rect1: DetectedRectangle, rect2: DetectedRectangle): number {
    const left = Math.max(rect1.x, rect2.x);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const top = Math.max(rect1.y, rect2.y);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    const dx = left > right ? left - right : 0;
    const dy = top > bottom ? top - bottom : 0;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Create bounding box around multiple rectangles
   */
  private mergeBoundingBox(rectangles: DetectedRectangle[]): DetectedRectangle {
    const minX = Math.min(...rectangles.map((r) => r.x));
    const minY = Math.min(...rectangles.map((r) => r.y));
    const maxX = Math.max(...rectangles.map((r) => r.x + r.width));
    const maxY = Math.max(...rectangles.map((r) => r.y + r.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      page: rectangles[0].page,
    };
  }

  /**
   * Perform OCR on the canvas to detect text with enhanced preprocessing
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async detectTextWithOCR(canvas: any, pageNum: number): Promise<DetectedText[]> {
    try {
      // Preprocess canvas for better OCR results
      const preprocessedCanvas = this.preprocessForOCR(canvas);

      const result = await Tesseract.recognize(preprocessedCanvas, 'pol', {
        logger: (m) => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            // eslint-disable-next-line no-console
            console.log(`OCR Progress (Page ${pageNum}): ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const texts: DetectedText[] = [];

      if (result.data.words) {
        for (const word of result.data.words) {
          // Filter out very low confidence words
          if (word.confidence > 40) {
            // Lower threshold to catch more text
            texts.push({
              text: word.text,
              x: word.bbox.x0 / 2, // Scale back from 2x rendering
              y: word.bbox.y0 / 2,
              width: (word.bbox.x1 - word.bbox.x0) / 2,
              height: (word.bbox.y1 - word.bbox.y0) / 2,
              confidence: word.confidence / 100,
            });
          }
        }
      }

      return texts;
    } catch (error) {
      console.error(`Error performing OCR on page ${pageNum}:`, error);
      return [];
    }
  }

  /**
   * Preprocess canvas for better OCR results
   * Applies contrast enhancement and binarization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private preprocessForOCR(canvas: any): any {
    const context = canvas.getContext('2d');
    if (!context) return canvas;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Step 1: Enhance contrast
    const factor = 1.5; // Contrast factor
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128)); // R
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
    }

    // Step 2: Apply adaptive binarization for better text clarity
    const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayscale[i / 4] = gray;
    }

    // Calculate local threshold (Otsu's method simplified)
    const threshold = this.calculateOtsuThreshold(grayscale);

    // Apply threshold
    for (let i = 0; i < data.length; i += 4) {
      const gray = grayscale[i / 4];
      const binary = gray > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = binary;
    }

    context.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Calculate Otsu's threshold for binarization
   */
  private calculateOtsuThreshold(grayscale: Uint8ClampedArray): number {
    const histogram = new Array(256).fill(0);

    // Build histogram
    for (let i = 0; i < grayscale.length; i++) {
      histogram[Math.floor(grayscale[i])]++;
    }

    const total = grayscale.length;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;

      wF = total - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;

      const variance = wB * wF * (mB - mF) * (mB - mF);

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }

    return threshold;
  }

  /**
   * Match detected text to rectangles to identify form fields with enhanced spatial reasoning
   */
  private matchTextToRectangles(
    texts: DetectedText[],
    rectangles: DetectedRectangle[],
    pageNum: number,
    pageHeight: number
  ): DetectedField[] {
    const fields: DetectedField[] = [];
    const maxDistance = 150; // Increased maximum distance for better matching
    const matched = new Set<string>(); // Track matched rectangles

    for (const rect of rectangles) {
      // Look for text near this rectangle with improved spatial reasoning
      let bestMatch: { text: DetectedText; score: number } | null = null;

      for (const text of texts) {
        if (text.confidence < 0.4) continue; // Filter very low confidence

        // Calculate multiple spatial relationships
        const distance = this.calculateDistance({ x: text.x, y: text.y }, { x: rect.x, y: rect.y });

        if (distance > maxDistance) continue;

        // Enhanced spatial analysis
        const isAbove = text.y < rect.y && text.y > rect.y - maxDistance;
        const isLeft =
          text.x < rect.x && text.x > rect.x - maxDistance * 2 && Math.abs(text.y - rect.y) < 50;
        const isNearTopLeft =
          text.x < rect.x + 20 &&
          text.y < rect.y + 20 &&
          text.x > rect.x - maxDistance &&
          text.y > rect.y - maxDistance;

        // Calculate alignment score
        const horizontalAlignment = Math.abs(text.x - rect.x) < 30 ? 1 : 0;
        const verticalAlignment = Math.abs(text.y - rect.y) < 10 ? 1 : 0;

        // Calculate proximity score (closer is better)
        const proximityScore = 1 - distance / maxDistance;

        // Calculate total match score
        let score = proximityScore * 0.4 + text.confidence * 0.3;

        if (isAbove)
          score += 0.3; // Strong preference for labels above
        else if (isLeft)
          score += 0.2; // Medium preference for labels to the left
        else if (isNearTopLeft) score += 0.15; // Weak preference for nearby

        score += horizontalAlignment * 0.05 + verticalAlignment * 0.05;

        // Update best match if this is better
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { text, score };
        }
      }

      // Generate field information
      const fieldKey = `${rect.x}_${rect.y}_${rect.width}_${rect.height}`;
      if (matched.has(fieldKey)) continue;
      matched.add(fieldKey);

      const fieldName = bestMatch
        ? this.generateFieldName(bestMatch.text.text)
        : `field_${pageNum}_${Math.round(rect.x)}_${Math.round(rect.y)}`;

      const label = bestMatch ? bestMatch.text.text : '';
      const confidence = bestMatch ? Math.min(bestMatch.score, bestMatch.text.confidence) : 0.5;

      // Determine field type with improved heuristics
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
        confidence: confidence,
        type: fieldType,
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
    let name = label
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (char) => {
        const map: Record<string, string> = {
          ą: 'a',
          ć: 'c',
          ę: 'e',
          ł: 'l',
          ń: 'n',
          ó: 'o',
          ś: 's',
          ź: 'z',
          ż: 'z',
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return name || 'unnamed_field';
  }

  /**
   * Determine field type based on size, shape, and label with improved heuristics
   */
  private determineFieldType(
    rect: DetectedRectangle,
    label: string
  ): 'text' | 'checkbox' | 'signature' {
    const area = rect.width * rect.height;
    const aspectRatio = rect.width / rect.height;
    const labelLower = label.toLowerCase();

    // Enhanced checkbox detection
    // Small square boxes with aspect ratio close to 1:1
    if (rect.width < 35 && rect.height < 35 && aspectRatio > 0.7 && aspectRatio < 1.4) {
      return 'checkbox';
    }

    // Enhanced signature field detection
    // Large boxes with signature-related keywords
    const signatureKeywords = ['podpis', 'signature', 'sign', 'pieczęć', 'stamp'];
    const hasSignatureKeyword = signatureKeywords.some((keyword) => labelLower.includes(keyword));

    if (hasSignatureKeyword && area > 4000) {
      return 'signature';
    }

    // Very large rectangular boxes are likely signatures
    if (area > 8000 && aspectRatio > 2) {
      return 'signature';
    }

    // Date fields - typically small with date keywords
    const dateKeywords = ['data', 'date', 'dzień', 'miesiac', 'rok'];
    const hasDateKeyword = dateKeywords.some((keyword) => labelLower.includes(keyword));
    if (hasDateKeyword && rect.width < 150 && rect.height < 40) {
      return 'text';
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
        confidence: field.confidence,
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
        pageSize: detectionResult.pageSize,
        detectionStats: {
          totalRectangles: detectionResult.rectangles.length,
          totalTexts: detectionResult.texts.length,
          matchedFields: detectionResult.fields.length,
          avgConfidence:
            detectionResult.fields.reduce((sum, f) => sum + f.confidence, 0) /
            Math.max(detectionResult.fields.length, 1),
        },
      },
    };
  }

  /**
   * Create visual debug canvas showing detected elements
   * Useful for troubleshooting and validating detection results
   */

  createDebugVisualization(
    canvas: any,
    rectangles: DetectedRectangle[],
    texts: DetectedText[],
    fields: DetectedField[]
  ): any {
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = canvas.width;
    debugCanvas.height = canvas.height;
    const ctx = debugCanvas.getContext('2d');

    if (!ctx) return debugCanvas;

    // Draw original image
    ctx.drawImage(canvas, 0, 0);

    // Draw detected rectangles in blue
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.lineWidth = 2;
    for (const rect of rectangles) {
      ctx.strokeRect(rect.x * 2, rect.y * 2, rect.width * 2, rect.height * 2);
    }

    // Draw detected text positions in green
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    for (const text of texts) {
      ctx.fillRect(text.x * 2, text.y * 2, text.width * 2, text.height * 2);
    }

    // Draw matched fields in red
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';

    for (const field of fields) {
      const x = field.x * 2;
      const y = (canvas.height / 2 - field.y - field.height) * 2; // Convert from PDF coords
      ctx.strokeRect(x, y, field.width * 2, field.height * 2);
      ctx.fillText(`${field.name} (${(field.confidence * 100).toFixed(0)}%)`, x, y - 5);
    }

    return debugCanvas;
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
