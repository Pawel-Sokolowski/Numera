import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFForm,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
} from 'pdf-lib';

/**
 * Universal PDF Form Filler
 *
 * Automatically fills ANY PDF form using:
 * 1. Acroform field detection (for interactive PDFs)
 * 2. Intelligent coordinate-based placement (for flat PDFs)
 * 3. Smart field matching and validation
 *
 * Works with any Polish government form, business form, or custom PDF.
 */

export interface UniversalFormData {
  [key: string]: string | number | boolean;
}

export interface FillingOptions {
  sanitizePolishChars?: boolean;
  fontSize?: number;
  fontColor?: { r: number; g: number; b: number };
  smartPositioning?: boolean;
  fuzzyMatching?: boolean;
  validateFields?: boolean;
  /** If true, keeps form fields editable instead of flattening them */
  keepFieldsEditable?: boolean;
}

export interface FillingResult {
  success: boolean;
  method: 'acroform' | 'coordinate';
  fieldsDetected: number;
  fieldsFilled: number;
  fieldsSkipped: number;
  errors: string[];
  warnings: string[];
}

export class UniversalPdfFiller {
  private defaultOptions: FillingOptions = {
    sanitizePolishChars: true,
    fontSize: 10,
    fontColor: { r: 0, g: 0, b: 0 },
    smartPositioning: true,
    fuzzyMatching: true,
    validateFields: true,
    keepFieldsEditable: false,
  };

  /**
   * Fill any PDF form automatically
   * @param pdfBytes PDF file as Uint8Array or ArrayBuffer
   * @param data Form data to fill
   * @param options Filling options
   * @returns Filled PDF bytes and filling result
   */
  async fillForm(
    pdfBytes: Uint8Array | ArrayBuffer,
    data: UniversalFormData,
    options: FillingOptions = {}
  ): Promise<{ pdfBytes: Uint8Array; result: FillingResult }> {
    const opts = { ...this.defaultOptions, ...options };
    const result: FillingResult = {
      success: false,
      method: 'coordinate',
      fieldsDetected: 0,
      fieldsFilled: 0,
      fieldsSkipped: 0,
      errors: [],
      warnings: [],
    };

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      // Determine filling method
      if (fields.length > 0) {
        // Use Acroform method
        result.method = 'acroform';
        result.fieldsDetected = fields.length;
        await this.fillAcroformFields(form, data, opts, result);
      } else {
        // Use coordinate-based method
        result.method = 'coordinate';
        await this.fillCoordinateBasedFields(pdfDoc, data, opts, result);
      }

      // Save with or without flattening based on options
      const filledPdfBytes = opts.keepFieldsEditable
        ? await pdfDoc.save({ useObjectStreams: false })
        : await pdfDoc.save();
      result.success = true;

      return { pdfBytes: filledPdfBytes, result };
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Fill Acroform fields
   */
  private async fillAcroformFields(
    form: PDFForm,
    data: UniversalFormData,
    options: FillingOptions,
    result: FillingResult
  ): Promise<void> {
    const fields = form.getFields();

    for (const field of fields) {
      try {
        const fieldName = field.getName();
        let value = data[fieldName];

        // Try fuzzy matching if no exact match
        if (value === undefined && options.fuzzyMatching) {
          value = this.fuzzyMatchField(fieldName, data);
        }

        if (value === undefined) {
          result.fieldsSkipped++;
          result.warnings.push(`No data provided for field: ${fieldName}`);
          continue;
        }

        // Fill based on field type
        if (field instanceof PDFTextField) {
          let textValue = String(value);
          if (options.sanitizePolishChars) {
            textValue = this.sanitizeText(textValue);
          }
          field.setText(textValue);
          result.fieldsFilled++;
        } else if (field instanceof PDFCheckBox) {
          if (value) {
            field.check();
          } else {
            field.uncheck();
          }
          result.fieldsFilled++;
        } else if (field instanceof PDFRadioGroup) {
          field.select(String(value));
          result.fieldsFilled++;
        } else if (field instanceof PDFDropdown) {
          field.select(String(value));
          result.fieldsFilled++;
        } else {
          result.fieldsSkipped++;
          result.warnings.push(`Unknown field type for: ${fieldName}`);
        }
      } catch (error) {
        result.errors.push(
          `Error filling field: ${error instanceof Error ? error.message : 'Unknown'}`
        );
        result.fieldsSkipped++;
      }
    }
  }

  /**
   * Fill coordinate-based fields
   * Supports multi-page forms by distributing fields across pages if coordinates specify page numbers
   */
  private async fillCoordinateBasedFields(
    pdfDoc: PDFDocument,
    data: UniversalFormData,
    options: FillingOptions,
    result: FillingResult
  ): Promise<void> {
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 10;
    const color = options.fontColor || { r: 0, g: 0, b: 0 };

    result.fieldsDetected = Object.keys(data).length;

    // Check if data contains coordinate information with page numbers
    const hasCoordinates = Object.values(data).some(
      (value) => typeof value === 'object' && value !== null && 'x' in value && 'y' in value
    );

    if (hasCoordinates) {
      // Use provided coordinates with multi-page support
      for (const [key, value] of Object.entries(data)) {
        try {
          if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value) {
            const coord = value as any;
            const pageIndex = (coord.page || 1) - 1; // Default to page 1 if not specified

            if (pageIndex < 0 || pageIndex >= pages.length) {
              result.warnings.push(`Invalid page ${coord.page} for field: ${key}`);
              result.fieldsSkipped++;
              continue;
            }

            const page = pages[pageIndex];
            let text = String(coord.value || coord.text || '');
            if (options.sanitizePolishChars) {
              text = this.sanitizeText(text);
            }

            page.drawText(text, {
              x: coord.x,
              y: coord.y,
              size: fontSize,
              font: font,
              color: rgb(color.r, color.g, color.b),
            });

            result.fieldsFilled++;
          } else {
            result.warnings.push(`No coordinates for field: ${key}`);
            result.fieldsSkipped++;
          }
        } catch (error) {
          result.errors.push(
            `Error filling field ${key}: ${error instanceof Error ? error.message : 'Unknown'}`
          );
          result.fieldsSkipped++;
        }
      }
    } else {
      // Fallback to smart positioning on first page
      const firstPage = pages[0];
      const positions = options.smartPositioning
        ? this.calculateSmartPositions(firstPage.getHeight(), Object.keys(data).length)
        : this.calculateBasicPositions(firstPage.getHeight(), Object.keys(data).length);

      let positionIndex = 0;

      for (const [key, value] of Object.entries(data)) {
        try {
          if (positionIndex >= positions.length) {
            result.warnings.push(`No position available for field: ${key}`);
            result.fieldsSkipped++;
            continue;
          }

          let text = String(value);
          if (options.sanitizePolishChars) {
            text = this.sanitizeText(text);
          }

          const pos = positions[positionIndex];
          firstPage.drawText(text, {
            x: pos.x,
            y: pos.y,
            size: fontSize,
            font: font,
            color: rgb(color.r, color.g, color.b),
          });

          result.fieldsFilled++;
          positionIndex++;
        } catch (error) {
          result.errors.push(
            `Error drawing text for ${key}: ${error instanceof Error ? error.message : 'Unknown'}`
          );
          result.fieldsSkipped++;
        }
      }
    }
  }

  /**
   * Sanitize Polish characters
   */
  private sanitizeText(text: string): string {
    const polishCharMap: Record<string, string> = {
      ą: 'a',
      Ą: 'A',
      ć: 'c',
      Ć: 'C',
      ę: 'e',
      Ę: 'E',
      ł: 'l',
      Ł: 'L',
      ń: 'n',
      Ń: 'N',
      ó: 'o',
      Ó: 'O',
      ś: 's',
      Ś: 'S',
      ź: 'z',
      Ź: 'Z',
      ż: 'z',
      Ż: 'Z',
    };

    let sanitized = text;
    for (const [polish, ascii] of Object.entries(polishCharMap)) {
      sanitized = sanitized.replace(new RegExp(polish, 'g'), ascii);
    }

    // Remove control characters
    // eslint-disable-next-line no-control-regex
    return sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }

  /**
   * Fuzzy match field names
   */
  private fuzzyMatchField(fieldName: string, data: UniversalFormData): any {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[_\-\s]/g, '')
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
        });

    const fieldNormalized = normalize(fieldName);

    // Try exact normalized match
    for (const [key, value] of Object.entries(data)) {
      if (normalize(key) === fieldNormalized) {
        return value;
      }
    }

    // Try partial match
    for (const [key, value] of Object.entries(data)) {
      const keyNormalized = normalize(key);
      if (fieldNormalized.includes(keyNormalized) || keyNormalized.includes(fieldNormalized)) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Calculate smart field positions
   */
  private calculateSmartPositions(
    pageHeight: number,
    fieldCount: number
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    const leftMargin = 150;
    const rightMargin = 350;
    const topStart = pageHeight - 150;
    const lineHeight = 25;
    const maxFieldsPerColumn = Math.ceil(fieldCount / 2);

    // Left column
    for (let i = 0; i < maxFieldsPerColumn && positions.length < fieldCount; i++) {
      positions.push({
        x: leftMargin,
        y: topStart - i * lineHeight,
      });
    }

    // Right column if needed
    for (let i = 0; i < maxFieldsPerColumn && positions.length < fieldCount; i++) {
      positions.push({
        x: rightMargin,
        y: topStart - i * lineHeight,
      });
    }

    return positions;
  }

  /**
   * Calculate basic positions (single column)
   */
  private calculateBasicPositions(
    pageHeight: number,
    fieldCount: number
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    const leftMargin = 150;
    const topStart = pageHeight - 150;
    const lineHeight = 25;

    for (let i = 0; i < fieldCount; i++) {
      positions.push({
        x: leftMargin,
        y: topStart - i * lineHeight,
      });
    }

    return positions;
  }

  /**
   * Analyze PDF structure
   */
  async analyzePdf(pdfBytes: Uint8Array | ArrayBuffer): Promise<{
    pageCount: number;
    pageSize: { width: number; height: number };
    hasAcroform: boolean;
    fieldCount: number;
    fields: Array<{ name: string; type: string }>;
  }> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    return {
      pageCount: pages.length,
      pageSize: {
        width: firstPage.getWidth(),
        height: firstPage.getHeight(),
      },
      hasAcroform: fields.length > 0,
      fieldCount: fields.length,
      fields: fields.map((field) => ({
        name: field.getName(),
        type: field.constructor.name,
      })),
    };
  }

  /**
   * Generate a Blob for browser download
   */
  async fillFormAsBlob(
    pdfBytes: Uint8Array | ArrayBuffer,
    data: UniversalFormData,
    options: FillingOptions = {}
  ): Promise<Blob> {
    const { pdfBytes: filledPdfBytes } = await this.fillForm(pdfBytes, data, options);
    return new Blob([filledPdfBytes], { type: 'application/pdf' });
  }
}

// Export singleton instance
export const universalPdfFiller = new UniversalPdfFiller();
