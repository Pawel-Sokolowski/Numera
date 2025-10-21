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
  matchStrategy?: 'above' | 'left' | 'inside' | 'nearby' | 'none'; // How label was matched
  warnings?: string[]; // Warnings about detection quality
}

export interface DetectedRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  isFieldCandidate?: boolean; // Whether this looks like an actual input field
  area?: number; // Calculated area
  aspectRatio?: number; // Width/height ratio
  edgeDensity?: number; // Density of edges (helps distinguish decorative from fields)
}

export interface DetectedText {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FormStructure {
  tables: TableStructure[];
  sections: SectionStructure[];
  hasGrid: boolean;
  fieldDensity: number; // Fields per square unit
}

export interface TableStructure {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  cells: DetectedRectangle[];
}

export interface SectionStructure {
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  fields: DetectedRectangle[];
}

export interface FieldDetectionResult {
  fields: DetectedField[];
  rectangles: DetectedRectangle[];
  texts: DetectedText[];
  pageCount: number;
  pageSize: { width: number; height: number };
  structure?: FormStructure;
}

export class PdfFieldDetector {
  private workerSrc: string;

  constructor() {
    // Set up PDF.js worker - use local worker file instead of CDN
    // The worker file is copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs to public/
    this.workerSrc = new URL('/pdf.worker.min.mjs', window.location.origin).href;
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

        // Analyze form structure for better context
        const structure = this.analyzeFormStructure(rectangles, texts, pageSize);

        // Match texts to rectangles to identify fields
        const fields = this.matchTextToRectangles(
          texts,
          rectangles,
          pageNum,
          pageSize.height,
          structure
        );
        allFields.push(...fields);
      }

      // Analyze overall form structure across all pages
      const overallStructure = this.analyzeFormStructure(allRectangles, allTexts, pageSize);

      return {
        fields: allFields,
        rectangles: allRectangles,
        texts: allTexts,
        pageCount,
        pageSize,
        structure: overallStructure,
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
   * Enhanced to better distinguish actual input fields from decorative lines
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
          const area = rectWidth * rectHeight;

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
              // Calculate edge density to help distinguish fields from decorative boxes
              const edgeDensity = this.calculateEdgeDensity(
                edges,
                width,
                x,
                y,
                rectWidth,
                rectHeight
              );

              // Determine if this is likely a field candidate vs decorative box
              const isFieldCandidate = this.isLikelyInputField(
                rectWidth,
                rectHeight,
                aspectRatio,
                edgeDensity
              );

              rectangles.push({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                page: 1, // Will be set by caller
                area,
                aspectRatio,
                edgeDensity,
                isFieldCandidate,
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
   * Calculate edge density within a rectangle to help distinguish actual fields from decorative boxes
   * Input fields typically have cleaner edges (lower density inside, higher density on borders)
   */
  private calculateEdgeDensity(
    edges: Uint8ClampedArray,
    width: number,
    x: number,
    y: number,
    rectWidth: number,
    rectHeight: number
  ): number {
    let edgePixels = 0;
    let totalPixels = 0;

    // Sample the interior of the rectangle (skip borders)
    const margin = 2;
    for (let dy = margin; dy < rectHeight - margin; dy++) {
      for (let dx = margin; dx < rectWidth - margin; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < width && py >= 0 && py < edges.length / width) {
          totalPixels++;
          if (edges[py * width + px] > 128) {
            edgePixels++;
          }
        }
      }
    }

    return totalPixels > 0 ? edgePixels / totalPixels : 0;
  }

  /**
   * Determine if a rectangle is likely an actual input field vs decorative element
   * Uses multiple heuristics to filter out decorative lines and focus on input boxes
   */
  private isLikelyInputField(
    width: number,
    height: number,
    aspectRatio: number,
    edgeDensity: number
  ): boolean {
    const area = width * height;

    // Very small boxes are likely checkboxes or decorative - keep them as candidates
    if (width < 35 && height < 35) {
      return aspectRatio > 0.6 && aspectRatio < 1.6; // Square-ish for checkboxes
    }

    // Very thin rectangles are likely decorative lines
    if (height < 10 || width < 30) {
      return false;
    }

    // Very large boxes might be decorative borders, but could also be large text areas
    // Keep them if they have reasonable aspect ratio
    if (area > 15000) {
      return aspectRatio < 15; // Not extremely wide
    }

    // Interior edge density check - input fields should have clean interiors
    // High edge density inside suggests decorative patterns or filled areas
    if (edgeDensity > 0.3) {
      return false; // Too much noise inside
    }

    // Standard fields - use reasonable dimensions and aspect ratio
    const isGoodSize = area >= 600 && area <= 10000;
    const isGoodRatio = aspectRatio >= 0.8 && aspectRatio <= 40;

    return isGoodSize && isGoodRatio;
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
          if (word.confidence > 30) {
            // Lowered threshold from 40 to 30 to catch more text
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
   * Analyze form structure to detect tables, sections, and patterns
   * This helps improve field matching by understanding the layout context
   */
  private analyzeFormStructure(
    rectangles: DetectedRectangle[],
    texts: DetectedText[],
    pageSize: { width: number; height: number }
  ): FormStructure {
    const tables = this.detectTables(rectangles);
    const sections = this.detectSections(rectangles, texts, pageSize);
    const hasGrid = this.detectGridPattern(rectangles);
    const fieldDensity = rectangles.length / ((pageSize.width * pageSize.height) / 10000);

    return {
      tables,
      sections,
      hasGrid,
      fieldDensity,
    };
  }

  /**
   * Detect table structures in the form
   * Tables are identified by aligned rectangles in rows and columns
   */
  private detectTables(rectangles: DetectedRectangle[]): TableStructure[] {
    const tables: TableStructure[] = [];
    const alignmentThreshold = 10; // pixels

    // Group rectangles by vertical position (rows)
    const rows = this.groupByAlignment(rectangles, 'y', alignmentThreshold);

    // For each row group, check if it forms part of a table
    for (let i = 0; i < rows.length; i++) {
      const currentRow = rows[i];
      if (currentRow.length < 2) continue; // Need at least 2 fields for a table

      // Look for adjacent rows with similar structure
      const tableRows: DetectedRectangle[][] = [currentRow];
      for (let j = i + 1; j < rows.length; j++) {
        const nextRow = rows[j];

        // Check if rows are aligned horizontally and have similar field count
        if (
          Math.abs(currentRow.length - nextRow.length) <= 1 &&
          this.rowsAreAligned(currentRow, nextRow, alignmentThreshold)
        ) {
          tableRows.push(nextRow);
        } else {
          break;
        }
      }

      // If we found multiple rows that form a table
      if (tableRows.length >= 2) {
        const allCells = tableRows.flat();
        const minX = Math.min(...allCells.map((r) => r.x));
        const minY = Math.min(...allCells.map((r) => r.y));
        const maxX = Math.max(...allCells.map((r) => r.x + r.width));
        const maxY = Math.max(...allCells.map((r) => r.y + r.height));

        tables.push({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          rows: tableRows.length,
          columns: Math.max(...tableRows.map((row) => row.length)),
          cells: allCells,
        });

        i += tableRows.length - 1; // Skip rows we've already processed
      }
    }

    return tables;
  }

  /**
   * Detect form sections (groups of related fields)
   */
  private detectSections(
    rectangles: DetectedRectangle[],
    texts: DetectedText[],
    _pageSize: { width: number; height: number }
  ): SectionStructure[] {
    const sections: SectionStructure[] = [];
    const sectionGap = 40; // Minimum gap between sections

    // Sort rectangles by Y position
    const sortedRects = [...rectangles].sort((a, b) => a.y - b.y);

    let currentSection: DetectedRectangle[] = [];
    let lastY = -1;

    for (const rect of sortedRects) {
      // Check if this starts a new section (large gap)
      if (lastY >= 0 && rect.y - lastY > sectionGap) {
        if (currentSection.length > 0) {
          const minX = Math.min(...currentSection.map((r) => r.x));
          const minY = Math.min(...currentSection.map((r) => r.y));
          const maxX = Math.max(...currentSection.map((r) => r.x + r.width));
          const maxY = Math.max(...currentSection.map((r) => r.y + r.height));

          // Look for section title (text above the section)
          const title = this.findSectionTitle(texts, minX, minY, maxX);

          sections.push({
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            title,
            fields: currentSection,
          });

          currentSection = [];
        }
      }

      currentSection.push(rect);
      lastY = rect.y + rect.height;
    }

    // Add final section
    if (currentSection.length > 0) {
      const minX = Math.min(...currentSection.map((r) => r.x));
      const minY = Math.min(...currentSection.map((r) => r.y));
      const maxX = Math.max(...currentSection.map((r) => r.x + r.width));
      const maxY = Math.max(...currentSection.map((r) => r.y + r.height));

      const title = this.findSectionTitle(texts, minX, minY, maxX);

      sections.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        title,
        fields: currentSection,
      });
    }

    return sections;
  }

  /**
   * Find section title (heading text above a section)
   */
  private findSectionTitle(
    texts: DetectedText[],
    sectionX: number,
    sectionY: number,
    sectionMaxX: number
  ): string | undefined {
    const titleCandidates = texts.filter((text) => {
      return (
        text.y < sectionY &&
        text.y > sectionY - 40 &&
        text.x >= sectionX - 20 &&
        text.x <= sectionMaxX + 20
      );
    });

    if (titleCandidates.length === 0) return undefined;

    // Return the text closest to the section
    const closest = titleCandidates.reduce((prev, current) =>
      Math.abs(current.y - sectionY) < Math.abs(prev.y - sectionY) ? current : prev
    );

    return closest.text;
  }

  /**
   * Detect grid pattern in the form layout
   */
  private detectGridPattern(rectangles: DetectedRectangle[]): boolean {
    if (rectangles.length < 4) return false;

    const alignmentThreshold = 10;

    // Count rectangles that are aligned horizontally and vertically
    const horizontalGroups = this.groupByAlignment(rectangles, 'y', alignmentThreshold);
    const verticalGroups = this.groupByAlignment(rectangles, 'x', alignmentThreshold);

    // A grid has multiple rows and columns
    return horizontalGroups.length >= 2 && verticalGroups.length >= 2;
  }

  /**
   * Group rectangles by alignment (horizontal or vertical)
   */
  private groupByAlignment(
    rectangles: DetectedRectangle[],
    axis: 'x' | 'y',
    threshold: number
  ): DetectedRectangle[][] {
    const groups: DetectedRectangle[][] = [];
    const sorted = [...rectangles].sort((a, b) => a[axis] - b[axis]);

    let currentGroup: DetectedRectangle[] = [];
    let currentValue = -1;

    for (const rect of sorted) {
      const value = rect[axis];

      if (currentValue < 0 || Math.abs(value - currentValue) <= threshold) {
        currentGroup.push(rect);
        currentValue = value;
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [rect];
        currentValue = value;
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Check if two rows of rectangles are aligned (same column structure)
   */
  private rowsAreAligned(
    row1: DetectedRectangle[],
    row2: DetectedRectangle[],
    threshold: number
  ): boolean {
    if (row1.length !== row2.length) return false;

    // Sort by x position
    const sorted1 = [...row1].sort((a, b) => a.x - b.x);
    const sorted2 = [...row2].sort((a, b) => a.x - b.x);

    // Check if x positions are aligned
    for (let i = 0; i < sorted1.length; i++) {
      if (Math.abs(sorted1[i].x - sorted2[i].x) > threshold) {
        return false;
      }
    }

    return true;
  }

  /**
   * Match detected text to rectangles to identify form fields with enhanced spatial reasoning
   * Implements multiple matching strategies: above, left, inside, and nearby
   */
  private matchTextToRectangles(
    texts: DetectedText[],
    rectangles: DetectedRectangle[],
    pageNum: number,
    pageHeight: number,
    structure?: FormStructure
  ): DetectedField[] {
    const fields: DetectedField[] = [];
    const maxDistance = 200; // Increased maximum distance from 150px to 200px for better matching
    const matched = new Set<string>(); // Track matched rectangles

    // Filter rectangles to prefer field candidates
    const sortedRectangles = rectangles.sort((a, b) => {
      const scoreA = (a.isFieldCandidate ? 1 : 0) + (a.area || 0) / 10000;
      const scoreB = (b.isFieldCandidate ? 1 : 0) + (b.area || 0) / 10000;
      return scoreB - scoreA;
    });

    for (const rect of sortedRectangles) {
      // Look for text near this rectangle with improved spatial reasoning
      let bestMatch: { text: DetectedText; score: number; strategy: string } | null = null;

      for (const text of texts) {
        if (text.confidence < 0.3) continue; // Filter very low confidence (lowered from 0.4 to 0.3)

        // Calculate multiple spatial relationships
        const distance = this.calculateDistance({ x: text.x, y: text.y }, { x: rect.x, y: rect.y });

        if (distance > maxDistance) continue;

        // Multi-strategy matching approach
        const matchResult = this.evaluateTextRectangleMatch(text, rect, maxDistance);

        // Apply structure-based bonuses if available
        if (structure) {
          matchResult.score = this.applyStructureBonus(matchResult.score, text, rect, structure);
        }

        // Update best match if this is better
        if (!bestMatch || matchResult.score > bestMatch.score) {
          bestMatch = {
            text,
            score: matchResult.score,
            strategy: matchResult.strategy,
          };
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
      const matchStrategy = bestMatch?.strategy as
        | 'above'
        | 'left'
        | 'inside'
        | 'nearby'
        | 'none'
        | undefined;

      // Calculate final confidence with field candidate bonus
      let confidence = bestMatch ? Math.min(bestMatch.score, bestMatch.text.confidence) : 0.5;
      if (rect.isFieldCandidate) {
        confidence = Math.min(1.0, confidence * 1.1); // 10% bonus for field candidates
      }

      // Determine field type with improved heuristics
      const fieldType = this.determineFieldType(rect, label);

      // Generate warnings for low-confidence detections
      const warnings: string[] = [];
      if (confidence < 0.6) {
        warnings.push('Low confidence detection - manual review recommended');
      }
      if (!rect.isFieldCandidate) {
        warnings.push('May be decorative element rather than input field');
      }
      if (!bestMatch) {
        warnings.push('No label found - field name auto-generated');
      }

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
        matchStrategy: matchStrategy || 'none',
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    }

    return fields;
  }

  /**
   * Apply bonus to match score based on form structure context
   */
  private applyStructureBonus(
    baseScore: number,
    text: DetectedText,
    rect: DetectedRectangle,
    structure: FormStructure
  ): number {
    let bonus = 0;

    // Bonus for fields in table structures (table headers are reliable)
    for (const table of structure.tables) {
      if (this.isInTable(rect, table)) {
        // Check if text is in table header position
        const isHeader = text.y < table.y && text.y > table.y - 40;
        if (isHeader) {
          bonus += 0.1; // 10% bonus for table headers
        }
      }
    }

    // Bonus for fields in well-defined sections
    for (const section of structure.sections) {
      if (this.isInSection(rect, section)) {
        // If section has a title, fields are more reliable
        if (section.title) {
          bonus += 0.05; // 5% bonus for fields in titled sections
        }
      }
    }

    // Bonus for forms with grid pattern (more structured)
    if (structure.hasGrid) {
      bonus += 0.05; // 5% bonus for grid layouts
    }

    return Math.min(1.0, baseScore + bonus);
  }

  /**
   * Check if rectangle is within a table
   */
  private isInTable(rect: DetectedRectangle, table: TableStructure): boolean {
    return (
      rect.x >= table.x &&
      rect.x + rect.width <= table.x + table.width &&
      rect.y >= table.y &&
      rect.y + rect.height <= table.y + table.height
    );
  }

  /**
   * Check if rectangle is within a section
   */
  private isInSection(rect: DetectedRectangle, section: SectionStructure): boolean {
    return (
      rect.x >= section.x &&
      rect.x + rect.width <= section.x + section.width &&
      rect.y >= section.y &&
      rect.y + rect.height <= section.y + section.height
    );
  }

  /**
   * Evaluate text-to-rectangle match using multiple strategies
   * Returns score and strategy used
   */
  private evaluateTextRectangleMatch(
    text: DetectedText,
    rect: DetectedRectangle,
    maxDistance: number
  ): { score: number; strategy: string } {
    const distance = this.calculateDistance({ x: text.x, y: text.y }, { x: rect.x, y: rect.y });

    // Strategy 1: Label above field (most common in Polish forms)
    const isAbove = text.y < rect.y && text.y > rect.y - maxDistance;
    const aboveScore = isAbove
      ? 0.35 + (1 - Math.abs(text.x - rect.x) / 100) * 0.25 + (1 - distance / maxDistance) * 0.4
      : 0;

    // Strategy 2: Label to the left of field
    const isLeft =
      text.x < rect.x && text.x > rect.x - maxDistance * 2 && Math.abs(text.y - rect.y) < 50;
    const leftScore = isLeft
      ? 0.25 + (1 - Math.abs(text.y - rect.y) / 50) * 0.25 + (1 - distance / maxDistance) * 0.4
      : 0;

    // Strategy 3: Label inside field box (e.g., checkboxes with labels)
    const isInside =
      text.x >= rect.x &&
      text.x <= rect.x + rect.width &&
      text.y >= rect.y &&
      text.y <= rect.y + rect.height;
    const insideScore = isInside ? 0.3 + text.confidence * 0.5 : 0;

    // Strategy 4: Label in table header (above and within horizontal bounds)
    const isTableHeader =
      text.y < rect.y &&
      text.y > rect.y - 60 &&
      text.x >= rect.x - 10 &&
      text.x <= rect.x + rect.width + 10;
    const tableHeaderScore = isTableHeader
      ? 0.3 +
        (1 - Math.abs(text.x + text.width / 2 - (rect.x + rect.width / 2)) / rect.width) * 0.35
      : 0;

    // Strategy 5: Nearby (general proximity)
    const isNearby = distance < maxDistance;
    const nearbyScore = isNearby
      ? 0.2 + (1 - distance / maxDistance) * 0.35 + text.confidence * 0.25
      : 0;

    // Find best strategy
    const strategies = [
      { name: 'above', score: aboveScore },
      { name: 'left', score: leftScore },
      { name: 'inside', score: insideScore },
      { name: 'tableHeader', score: tableHeaderScore },
      { name: 'nearby', score: nearbyScore },
    ];

    const best = strategies.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    );

    return { score: best.score, strategy: best.name };
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
   * Enhanced to preserve date type information and common field patterns
   */
  private generateFieldName(label: string): string {
    const labelLower = label.toLowerCase();

    // Detect specific date types and use semantic names
    if (labelLower.includes('urodzeni') || labelLower.includes('ur.')) {
      return 'data_urodzenia';
    }
    if (labelLower.includes('wystawien') || labelLower.includes('wyst.')) {
      return 'data_wystawienia';
    }
    if (labelLower.includes('waznosc') || labelLower.includes('ważnosc')) {
      return 'data_waznosci';
    }
    if (labelLower.includes('rozpocz') || labelLower.includes('od dnia')) {
      return 'data_rozpoczecia';
    }
    if (labelLower.includes('zakonczeni') || labelLower.includes('do dnia')) {
      return 'data_zakonczenia';
    }

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
   * Enhanced to recognize Polish form patterns (PESEL, NIP, województwo, miasto, etc.)
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

    // Checkbox keywords in Polish forms
    const checkboxKeywords = ['tak', 'nie', 'yes', 'no', 'zaznacz', 'wybierz'];
    const hasCheckboxKeyword = checkboxKeywords.some((keyword) => labelLower.includes(keyword));
    if (hasCheckboxKeyword && rect.width < 40 && rect.height < 40) {
      return 'checkbox';
    }

    // Enhanced signature field detection
    // Large boxes with signature-related keywords
    const signatureKeywords = [
      'podpis',
      'signature',
      'sign',
      'pieczęć',
      'pieczec',
      'stamp',
      'data i podpis',
    ];
    const hasSignatureKeyword = signatureKeywords.some((keyword) => labelLower.includes(keyword));

    if (hasSignatureKeyword && area > 4000) {
      return 'signature';
    }

    // Very large rectangular boxes are likely signatures
    if (area > 8000 && aspectRatio > 2) {
      return 'signature';
    }

    // Polish-specific field patterns
    const polishFieldKeywords = {
      pesel: ['pesel'],
      nip: ['nip'],
      regon: ['regon'],
      wojewodztwo: ['województwo', 'wojewodztwo', 'woj.', 'woj'],
      miasto: ['miasto', 'miejscowość', 'miejscowosc'],
      ulica: ['ulica', 'ul.', 'ul'],
      kodPocztowy: ['kod pocztowy', 'kod', 'pocztowy'],
      telefon: ['telefon', 'tel.', 'tel', 'numer telefonu'],
      email: ['e-mail', 'email', 'adres e-mail'],
      // Date field types - distinguish between different date types
      dataUrodzenia: ['data urodzenia', 'urodzony', 'urodzona', 'data ur.', 'ur.'],
      dataWystawienia: ['data wystawienia', 'wystawiony', 'wystawiono', 'data wyst.'],
      dataWaznosci: ['data ważności', 'data waznosci', 'ważny', 'wazny', 'ważność', 'waznosc'],
      dataRozpoczecia: [
        'data rozpoczęcia',
        'data rozpoczecia',
        'rozpoczęcie',
        'rozpoczecie',
        'od dnia',
      ],
      dataZakonczenia: [
        'data zakończenia',
        'data zakonczenia',
        'zakończenie',
        'zakonczenie',
        'do dnia',
      ],
      data: ['data', 'date', 'dzień', 'dzien', 'miesiąc', 'miesiac', 'rok', 'r.'],
    };

    // Check for specific Polish field types
    for (const [fieldType, keywords] of Object.entries(polishFieldKeywords)) {
      if (keywords.some((keyword) => labelLower.includes(keyword))) {
        // PESEL, NIP, REGON are typically medium-width fields
        if (['pesel', 'nip', 'regon'].includes(fieldType)) {
          if (rect.width < 200 && rect.height < 35) {
            return 'text';
          }
        }
        // Date fields are typically small - distinguish between date types
        if (
          [
            'dataUrodzenia',
            'dataWystawienia',
            'dataWaznosci',
            'dataRozpoczecia',
            'dataZakonczenia',
            'data',
          ].includes(fieldType)
        ) {
          if (rect.width < 150 && rect.height < 40) {
            return 'text';
          }
        }
        // All other identified fields are text
        return 'text';
      }
    }

    // Everything else is a text field
    return 'text';
  }

  /**
   * Generate a mapping.json file from detected fields
   */

  generateMapping(detectionResult: FieldDetectionResult, formVersion: string = '2023'): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas: any,
    rectangles: DetectedRectangle[],
    texts: DetectedText[],
    fields: DetectedField[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
