import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Tax Form Service
 * 
 * Handles loading and filling of tax form PDF templates with field mappings.
 * Supports version-specific forms and form-specific calculations.
 */

export interface FieldMapping {
  pdfField: string;
  page: number;
  x?: number;
  y?: number;
}

export interface FormMapping {
  version: string;
  fields: Record<string, FieldMapping>;
  calculations: Record<string, string>;
}

export interface TaxFormData {
  [key: string]: any;
}

export class TaxFormService {
  private mappingCache: Map<string, FormMapping> = new Map();

  /**
   * Fill a tax form with provided data
   * @param formType Type of form (e.g., 'PIT-37', 'UPL-1')
   * @param year Year of the form (e.g., '2023')
   * @param formData Data to fill into the form
   * @returns PDF bytes as Uint8Array
   */
  async fillForm(formType: string, year: string, formData: TaxFormData): Promise<Uint8Array> {
    // Load the correct PDF template based on type and year
    const pdfTemplate = await this.loadPdfTemplate(formType, year);
    
    // Load the field mappings
    const mappings = await this.loadMappings(formType, year);
    
    // Process special calculations (like tax deductions for children)
    const processedData = this.processFormSpecificCalculations(formType, formData, mappings);
    
    // Fill the form
    return await this.fillPdfForm(pdfTemplate, processedData, mappings);
  }

  /**
   * Load PDF template from assets or public directory
   */
  private async loadPdfTemplate(formType: string, year: string): Promise<PDFDocument> {
    // Load from public directory (static assets)
    const publicPath = `/pdf-templates/${formType}/${year}/${formType}_${year}.pdf`;
    
    // Fallback to root public directory for backward compatibility (UPL-1)
    const fallbackPath = formType === 'UPL-1' ? '/upl-1_06-08-2.pdf' : null;
    
    try {
      // Try to fetch from pdf-templates directory
      const response = await fetch(publicPath);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return await PDFDocument.load(arrayBuffer);
      }
    } catch (error) {
      console.log(`Template not found: ${publicPath}`);
    }

    // Try fallback path for backward compatibility
    if (fallbackPath) {
      try {
        const response = await fetch(fallbackPath);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          return await PDFDocument.load(arrayBuffer);
        }
      } catch (error) {
        console.error(`Template not found at fallback: ${fallbackPath}`);
      }
    }

    throw new Error(`PDF template not found for ${formType} ${year}`);
  }

  /**
   * Load field mappings from JSON file
   */
  async loadMappings(formType: string, year?: string): Promise<FormMapping> {
    const cacheKey = `${formType}-${year || 'default'}`;
    
    // Check cache first
    if (this.mappingCache.has(cacheKey)) {
      return this.mappingCache.get(cacheKey)!;
    }

    const mappingPath = `/pdf-templates/${formType}/mapping.json`;
    
    try {
      const response = await fetch(mappingPath);
      if (!response.ok) {
        throw new Error(`Mapping file not found: ${mappingPath}`);
      }
      
      const mapping: FormMapping = await response.json();
      
      // Cache the mapping
      this.mappingCache.set(cacheKey, mapping);
      
      return mapping;
    } catch (error) {
      console.error(`Error loading mappings for ${formType}:`, error);
      throw new Error(`Failed to load mappings for ${formType}`);
    }
  }

  /**
   * Process form-specific calculations
   */
  private processFormSpecificCalculations(
    formType: string, 
    data: TaxFormData, 
    mappings: FormMapping
  ): TaxFormData {
    const processedData = { ...data };

    // Handle form-specific logic
    if (formType === 'PIT-37') {
      processedData.calculatedFields = this.processPIT37Calculations(data, mappings);
    } else if (formType === 'PIT-R') {
      processedData.calculatedFields = this.processPITRCalculations(data, mappings);
    } else {
      // All other forms don't require calculations, just pass through
      // Including: UPL-1, PEL, ZAW-FA, PIT-2, PIT-OP, IFT-1, UPL-1P, and declaration forms
      processedData.calculatedFields = {};
    }

    return processedData;
  }

  /**
   * Process PIT-37 specific calculations
   */
  private processPIT37Calculations(data: TaxFormData, mappings: FormMapping): Record<string, number> {
    const calculated: Record<string, number> = {};

    // Calculate total income
    if (data.employmentIncome !== undefined && data.civilContractIncome !== undefined) {
      calculated.totalIncome = (data.employmentIncome || 0) + (data.civilContractIncome || 0);
    }

    // Calculate child deductions
    if (data.childDeduction !== undefined && data.numberOfChildren !== undefined) {
      calculated.totalTaxDeduction = (data.childDeduction || 0) * (data.numberOfChildren || 0);
    }

    // Calculate tax base
    if (calculated.totalIncome !== undefined && calculated.totalTaxDeduction !== undefined) {
      calculated.taxBase = calculated.totalIncome - calculated.totalTaxDeduction;
    }

    // Calculate tax due (simplified 17% rate)
    if (calculated.taxBase !== undefined) {
      calculated.taxDue = calculated.taxBase * 0.17;
    }

    // Calculate tax to pay/refund
    if (calculated.taxDue !== undefined && data.taxPaid !== undefined) {
      calculated.taxToPay = calculated.taxDue - (data.taxPaid || 0);
    }

    return calculated;
  }

  /**
   * Process PIT-R specific calculations (for business income)
   */
  private processPITRCalculations(data: TaxFormData, mappings: FormMapping): Record<string, number> {
    const calculated: Record<string, number> = {};

    // Calculate tax base (income - costs)
    if (data.businessIncome !== undefined && data.businessCosts !== undefined) {
      calculated.taxBase = (data.businessIncome || 0) - (data.businessCosts || 0);
    }

    // Calculate tax due (17% rate for business income)
    if (calculated.taxBase !== undefined) {
      calculated.taxDue = calculated.taxBase * 0.17;
    }

    // Calculate tax to pay/refund
    if (calculated.taxDue !== undefined && data.taxPaid !== undefined) {
      calculated.taxToPay = calculated.taxDue - (data.taxPaid || 0);
    }

    return calculated;
  }

  /**
   * Fill PDF form using mappings and processed data
   */
  private async fillPdfForm(
    pdfDoc: PDFDocument,
    data: TaxFormData,
    mappings: FormMapping
  ): Promise<Uint8Array> {
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // Merge calculated fields with input data
    const allData = {
      ...data,
      ...(data.calculatedFields || {})
    };

    // Iterate through field mappings and fill the form
    for (const [fieldName, fieldMapping] of Object.entries(mappings.fields)) {
      const value = allData[fieldName];
      
      if (value !== undefined && value !== null) {
        const pageIndex = fieldMapping.page - 1; // Convert to 0-based index
        
        if (pageIndex < 0 || pageIndex >= pages.length) {
          console.warn(`Invalid page index ${fieldMapping.page} for field ${fieldName}`);
          continue;
        }

        const page = pages[pageIndex];
        const textValue = this.formatFieldValue(value);

        // Use coordinates if provided
        if (fieldMapping.x !== undefined && fieldMapping.y !== undefined) {
          page.drawText(textValue, {
            x: fieldMapping.x,
            y: fieldMapping.y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      }
    }

    return await pdfDoc.save();
  }

  /**
   * Format field value for display
   */
  private formatFieldValue(value: any): string {
    if (typeof value === 'number') {
      // Format numbers with 2 decimal places
      return value.toFixed(2);
    } else if (typeof value === 'boolean') {
      return value ? 'X' : '';
    } else {
      return String(value);
    }
  }

  /**
   * Generate a Blob from the filled PDF (for browser download)
   */
  async fillFormAsBlob(formType: string, year: string, formData: TaxFormData): Promise<Blob> {
    const pdfBytes = await this.fillForm(formType, year, formData);
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Sanitize text to handle Polish characters
   * Basic implementation - can be enhanced with proper font embedding
   */
  private sanitizeText(text: string): string {
    const polishMap: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
      'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
      'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };

    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, char => polishMap[char] || char);
  }
}
