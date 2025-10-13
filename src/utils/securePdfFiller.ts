import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Secure PDF Form Filler
 * 
 * A secure, template-based PDF form filling utility that:
 * - Validates all inputs before processing
 * - Sanitizes text to prevent injection attacks
 * - Uses official PDF templates only
 * - Provides comprehensive error handling
 * - Supports multiple form types with field mappings
 */

export interface SecureFormData {
  [key: string]: any;
}

export interface FieldMapping {
  x: number;
  y: number;
  page: number;
  width?: number;
  height?: number;
  maxLength?: number;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean';
}

export interface FormTemplate {
  formType: string;
  year: string;
  fields: Record<string, FieldMapping>;
  templatePath: string;
  pageCount: number;
}

export class SecurePdfFiller {
  private templates: Map<string, FormTemplate> = new Map();
  private readonly MAX_TEXT_LENGTH = 500;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize form templates with secure field mappings
   */
  private initializeTemplates(): void {
    // UPL-1 Template
    this.templates.set('UPL-1_2023', {
      formType: 'UPL-1',
      year: '2023',
      templatePath: '/pdf-templates/UPL-1/2023/UPL-1_2023.pdf',
      pageCount: 1,
      fields: {
        principalName: { x: 150, y: 720, page: 1, maxLength: 100, required: true, type: 'text' },
        principalNIP: { x: 150, y: 695, page: 1, maxLength: 10, required: true, type: 'text' },
        principalREGON: { x: 150, y: 670, page: 1, maxLength: 14, type: 'text' },
        principalAddress: { x: 150, y: 645, page: 1, maxLength: 100, required: true, type: 'text' },
        principalCity: { x: 150, y: 620, page: 1, maxLength: 50, required: true, type: 'text' },
        attorneyName: { x: 150, y: 560, page: 1, maxLength: 100, required: true, type: 'text' },
        attorneyPESEL: { x: 150, y: 535, page: 1, maxLength: 11, required: true, type: 'text' },
        attorneyAddress: { x: 150, y: 510, page: 1, maxLength: 100, required: true, type: 'text' },
        attorneyCity: { x: 350, y: 485, page: 1, maxLength: 50, required: true, type: 'text' },
        scope1: { x: 50, y: 420, page: 1, maxLength: 80, type: 'text' },
        scope2: { x: 50, y: 400, page: 1, maxLength: 80, type: 'text' },
        scope3: { x: 50, y: 380, page: 1, maxLength: 80, type: 'text' },
        startDate: { x: 150, y: 270, page: 1, maxLength: 10, type: 'date' },
        endDate: { x: 350, y: 270, page: 1, maxLength: 10, type: 'date' },
        issueDate: { x: 150, y: 180, page: 1, maxLength: 10, type: 'date' },
        issuePlace: { x: 350, y: 180, page: 1, maxLength: 50, type: 'text' }
      }
    });

    // PEL Template (ZUS Authorization)
    this.templates.set('PEL_2023', {
      formType: 'PEL',
      year: '2023',
      templatePath: '/pdf-templates/PEL/2023/PEL_2023.pdf',
      pageCount: 1,
      fields: {
        principalName: { x: 150, y: 720, page: 1, maxLength: 100, required: true, type: 'text' },
        principalPESEL: { x: 150, y: 695, page: 1, maxLength: 11, required: true, type: 'text' },
        principalAddress: { x: 150, y: 670, page: 1, maxLength: 100, required: true, type: 'text' },
        attorneyName: { x: 150, y: 560, page: 1, maxLength: 100, required: true, type: 'text' },
        attorneyPESEL: { x: 150, y: 535, page: 1, maxLength: 11, required: true, type: 'text' },
        attorneyAddress: { x: 150, y: 510, page: 1, maxLength: 100, required: true, type: 'text' },
        issueDate: { x: 150, y: 180, page: 1, maxLength: 10, type: 'date' },
        issuePlace: { x: 350, y: 180, page: 1, maxLength: 50, type: 'text' }
      }
    });
  }

  /**
   * Fill a PDF form with validated and sanitized data
   */
  async fillForm(formType: string, year: string, data: SecureFormData): Promise<Uint8Array> {
    try {
      // Validate inputs
      this.validateInputs(formType, year, data);

      // Get template
      const templateKey = `${formType}_${year}`;
      const template = this.templates.get(templateKey);
      
      if (!template) {
        throw new Error(`Template not found for ${formType} ${year}. Available templates: ${Array.from(this.templates.keys()).join(', ')}`);
      }

      // Load PDF template
      const pdfDoc = await this.loadPdfTemplate(template.templatePath);

      // Validate and sanitize data
      const sanitizedData = this.sanitizeFormData(data, template);

      // Fill the form
      return await this.fillPdfDocument(pdfDoc, sanitizedData, template);

    } catch (error) {
      console.error('PDF filling error:', error);
      throw new Error(`Failed to fill PDF form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate input parameters
   */
  private validateInputs(formType: string, year: string, data: SecureFormData): void {
    if (!formType || typeof formType !== 'string') {
      throw new Error('Form type is required and must be a string');
    }

    if (!year || typeof year !== 'string' || !/^\d{4}$/.test(year)) {
      throw new Error('Year is required and must be a 4-digit string');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Form data is required and must be an object');
    }

    // Check for potentially dangerous properties
    const dangerousProps = ['__proto__', 'constructor', 'prototype'];
    for (const prop of dangerousProps) {
      if (prop in data) {
        throw new Error(`Invalid property: ${prop}`);
      }
    }
  }

  /**
   * Load PDF template from public directory
   */
  private async loadPdfTemplate(templatePath: string): Promise<PDFDocument> {
    try {
      const response = await fetch(templatePath);
      
      if (!response.ok) {
        throw new Error(`Failed to load PDF template: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Check file size
      if (arrayBuffer.byteLength > this.MAX_FILE_SIZE) {
        throw new Error(`PDF template too large: ${arrayBuffer.byteLength} bytes (max: ${this.MAX_FILE_SIZE})`);
      }

      return await PDFDocument.load(arrayBuffer);

    } catch (error) {
      throw new Error(`Failed to load PDF template from ${templatePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sanitize form data according to template requirements
   */
  private sanitizeFormData(data: SecureFormData, template: FormTemplate): SecureFormData {
    const sanitized: SecureFormData = {};

    for (const [fieldName, mapping] of Object.entries(template.fields)) {
      const value = data[fieldName];

      // Check required fields
      if (mapping.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Required field '${fieldName}' is missing`);
      }

      // Skip empty optional fields
      if (!mapping.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Sanitize and validate field value
      const sanitizedValue = this.sanitizeFieldValue(value, mapping);
      sanitized[fieldName] = sanitizedValue;
    }

    return sanitized;
  }

  /**
   * Sanitize individual field value
   */
  private sanitizeFieldValue(value: any, mapping: FieldMapping): string {
    let stringValue = String(value);

    // Remove control characters and dangerous content
    stringValue = stringValue.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    stringValue = stringValue.replace(/[<>'"&]/g, '');

    // Truncate if too long
    if (mapping.maxLength && stringValue.length > mapping.maxLength) {
      stringValue = stringValue.substring(0, mapping.maxLength);
    }

    // Validate based on type
    switch (mapping.type) {
      case 'number':
        if (!/^\d+(\.\d+)?$/.test(stringValue)) {
          throw new Error(`Field must be a valid number`);
        }
        break;
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
          throw new Error(`Field must be a valid date (YYYY-MM-DD)`);
        }
        break;
      case 'text':
        // Basic text validation - no special characters
        if (stringValue.length > this.MAX_TEXT_LENGTH) {
          throw new Error(`Text field too long (max: ${this.MAX_TEXT_LENGTH} characters)`);
        }
        break;
    }

    return stringValue;
  }

  /**
   * Fill PDF document with sanitized data
   */
  private async fillPdfDocument(
    pdfDoc: PDFDocument, 
    data: SecureFormData, 
    template: FormTemplate
  ): Promise<Uint8Array> {
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // Fill each field
    for (const [fieldName, value] of Object.entries(data)) {
      const mapping = template.fields[fieldName];
      
      if (!mapping) {
        console.warn(`No mapping found for field: ${fieldName}`);
        continue;
      }

      const pageIndex = mapping.page - 1;
      
      if (pageIndex < 0 || pageIndex >= pages.length) {
        console.warn(`Invalid page index for field ${fieldName}: ${mapping.page}`);
        continue;
      }

      const page = pages[pageIndex];
      
      // Format value for display
      const displayValue = this.formatDisplayValue(value, mapping);
      
      // Draw text at specified coordinates
      page.drawText(displayValue, {
        x: mapping.x,
        y: mapping.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    return await pdfDoc.save();
  }

  /**
   * Format value for display in PDF
   */
  private formatDisplayValue(value: string, mapping: FieldMapping): string {
    switch (mapping.type) {
      case 'date':
        // Convert YYYY-MM-DD to DD.MM.YYYY for Polish forms
        const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateMatch) {
          return `${dateMatch[3]}.${dateMatch[2]}.${dateMatch[1]}`;
        }
        return value;
      default:
        return value;
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): Array<{ formType: string; year: string; templatePath: string }> {
    return Array.from(this.templates.values()).map(template => ({
      formType: template.formType,
      year: template.year,
      templatePath: template.templatePath
    }));
  }

  /**
   * Validate template exists
   */
  hasTemplate(formType: string, year: string): boolean {
    const templateKey = `${formType}_${year}`;
    return this.templates.has(templateKey);
  }
}

// Export singleton instance
export const securePdfFiller = new SecurePdfFiller();
