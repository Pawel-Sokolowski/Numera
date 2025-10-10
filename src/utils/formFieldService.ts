import { PdfFieldDetector, FieldDetectionResult } from './pdfFieldDetector';
import { FormMapping } from './taxFormService';

/**
 * Form Field Service
 * 
 * Manages automatic form field detection and mapping generation for Polish tax forms.
 * Provides utilities to detect fields, save mappings, and update existing forms.
 */

export interface FormFieldMetadata {
  formType: string;
  version: string;
  lastDetected?: Date;
  fieldCount: number;
  confidence: number;
}

export class FormFieldService {
  private detector: PdfFieldDetector;

  constructor() {
    this.detector = new PdfFieldDetector();
  }

  /**
   * Detect fields from a PDF file and generate mapping
   * @param pdfFile PDF file as ArrayBuffer or File
   * @param formType Form type identifier (e.g., 'UPL-1', 'PEL')
   * @param version Form version (e.g., '2023')
   * @returns Generated mapping object
   */
  async detectAndGenerateMapping(
    pdfFile: ArrayBuffer | File,
    formType: string,
    version: string = '2023'
  ): Promise<{ mapping: object; metadata: FormFieldMetadata }> {
    // Convert File to ArrayBuffer if needed
    const arrayBuffer = pdfFile instanceof ArrayBuffer 
      ? pdfFile 
      : await pdfFile.arrayBuffer();

    // Detect fields
    const detectionResult = await this.detector.detectFields(arrayBuffer);
    
    // Generate mapping
    const mapping = this.detector.generateMapping(detectionResult, version);
    
    // Calculate average confidence
    const avgConfidence = detectionResult.fields.reduce((sum, field) => sum + field.confidence, 0) 
      / Math.max(detectionResult.fields.length, 1);

    const metadata: FormFieldMetadata = {
      formType,
      version,
      lastDetected: new Date(),
      fieldCount: detectionResult.fields.length,
      confidence: avgConfidence
    };

    return { mapping, metadata };
  }

  /**
   * Detect fields from a PDF URL
   */
  async detectFromUrl(
    pdfUrl: string,
    formType: string,
    version: string = '2023'
  ): Promise<{ mapping: object; metadata: FormFieldMetadata }> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from ${pdfUrl}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return this.detectAndGenerateMapping(arrayBuffer, formType, version);
  }

  /**
   * Validate a mapping against the original PDF
   * Checks if coordinates are within page bounds and fields don't overlap
   */
  async validateMapping(
    pdfFile: ArrayBuffer | File,
    mapping: FormMapping
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Convert File to ArrayBuffer if needed
    const arrayBuffer = pdfFile instanceof ArrayBuffer 
      ? pdfFile 
      : await pdfFile.arrayBuffer();

    // Detect fields to get page dimensions
    const detectionResult = await this.detector.detectFields(arrayBuffer);
    const pageSize = detectionResult.pageSize;

    // Check each field
    for (const [fieldName, fieldMapping] of Object.entries(mapping.fields)) {
      if (!fieldMapping.x || !fieldMapping.y) {
        continue; // Skip fields without coordinates
      }

      // Check if coordinates are within page bounds
      if (fieldMapping.x < 0 || fieldMapping.x > pageSize.width) {
        errors.push(`Field "${fieldName}" has X coordinate (${fieldMapping.x}) outside page bounds (0-${pageSize.width})`);
      }

      if (fieldMapping.y < 0 || fieldMapping.y > pageSize.height) {
        errors.push(`Field "${fieldName}" has Y coordinate (${fieldMapping.y}) outside page bounds (0-${pageSize.height})`);
      }

      // Check page number
      if (fieldMapping.page < 1 || fieldMapping.page > detectionResult.pageCount) {
        errors.push(`Field "${fieldName}" references invalid page ${fieldMapping.page} (total pages: ${detectionResult.pageCount})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Merge detected fields with existing mapping
   * Useful for updating mappings with new detected fields while preserving manual adjustments
   */
  mergeWithExistingMapping(
    detectionResult: FieldDetectionResult,
    existingMapping: FormMapping,
    options: {
      overwriteExisting?: boolean;
      onlyAddNew?: boolean;
      minConfidence?: number;
    } = {}
  ): FormMapping {
    const {
      overwriteExisting = false,
      onlyAddNew = true,
      minConfidence = 0.5
    } = options;

    const mergedFields = { ...existingMapping.fields };

    // Add or update fields from detection result
    for (const field of detectionResult.fields) {
      // Skip low confidence fields
      if (field.confidence < minConfidence) {
        continue;
      }

      const fieldExists = field.name in mergedFields;

      if (!fieldExists) {
        // Add new field
        mergedFields[field.name] = {
          pdfField: field.name,
          page: field.page,
          x: field.x,
          y: field.y
        };
      } else if (overwriteExisting && !onlyAddNew) {
        // Update existing field
        mergedFields[field.name] = {
          ...mergedFields[field.name],
          x: field.x,
          y: field.y,
          page: field.page
        };
      }
    }

    return {
      ...existingMapping,
      fields: mergedFields
    };
  }

  /**
   * Compare two mappings and return differences
   */
  compareMappings(
    mapping1: FormMapping,
    mapping2: FormMapping
  ): {
    added: string[];
    removed: string[];
    modified: Array<{ field: string; changes: string[] }>;
  } {
    const fields1 = Object.keys(mapping1.fields);
    const fields2 = Object.keys(mapping2.fields);

    const added = fields2.filter(f => !fields1.includes(f));
    const removed = fields1.filter(f => !fields2.includes(f));
    const modified: Array<{ field: string; changes: string[] }> = [];

    // Check for modifications in common fields
    for (const field of fields1.filter(f => fields2.includes(f))) {
      const changes: string[] = [];
      const f1 = mapping1.fields[field];
      const f2 = mapping2.fields[field];

      if (f1.x !== f2.x) changes.push(`x: ${f1.x} → ${f2.x}`);
      if (f1.y !== f2.y) changes.push(`y: ${f1.y} → ${f2.y}`);
      if (f1.page !== f2.page) changes.push(`page: ${f1.page} → ${f2.page}`);

      if (changes.length > 0) {
        modified.push({ field, changes });
      }
    }

    return { added, removed, modified };
  }

  /**
   * Export mapping to JSON file
   */
  exportMappingToFile(mapping: object, formType: string, version: string = '2023'): void {
    const filename = `${formType}_${version}_mapping.json`;
    const content = JSON.stringify(mapping, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Import mapping from JSON file
   */
  async importMappingFromFile(file: File): Promise<FormMapping> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const mapping = JSON.parse(content) as FormMapping;
          resolve(mapping);
        } catch (error) {
          reject(new Error('Invalid mapping file format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Suggest field names based on Polish form conventions
   */
  suggestFieldName(label: string, context?: { formType?: string }): string {
    const labelLower = label.toLowerCase();
    
    // Common Polish form field patterns
    const patterns: Record<string, string> = {
      'nazwisko': 'lastName',
      'imię': 'firstName',
      'imie': 'firstName',
      'pesel': 'pesel',
      'nip': 'nip',
      'regon': 'regon',
      'adres': 'address',
      'ulica': 'street',
      'miasto': 'city',
      'kod pocztowy': 'postalCode',
      'telefon': 'phone',
      'email': 'email',
      'data': 'date',
      'podpis': 'signature',
      'mocodawca': 'principal',
      'pełnomocnik': 'attorney',
      'pelnomocnik': 'attorney',
      'zakres': 'scope',
      'urząd': 'office',
      'urzad': 'office',
    };

    for (const [pattern, fieldName] of Object.entries(patterns)) {
      if (labelLower.includes(pattern)) {
        return fieldName;
      }
    }

    // Default: sanitize the label
    return label.toLowerCase()
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
  }

  /**
   * Batch process multiple PDFs
   */
  async batchDetectFields(
    files: Array<{ file: File | ArrayBuffer; formType: string; version: string }>
  ): Promise<Array<{ formType: string; mapping: object; metadata: FormFieldMetadata; error?: string }>> {
    const results = [];

    for (const { file, formType, version } of files) {
      try {
        const result = await this.detectAndGenerateMapping(file, formType, version);
        results.push({
          formType,
          mapping: result.mapping,
          metadata: result.metadata
        });
      } catch (error) {
        results.push({
          formType,
          mapping: {},
          metadata: { formType, version, fieldCount: 0, confidence: 0 },
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}
