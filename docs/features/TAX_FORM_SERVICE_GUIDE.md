# Tax Form Service Implementation Guide

## Overview

The Tax Form Service provides a template-based PDF filling system for Polish tax forms and administrative documents. It supports:

- Loading official PDF templates by form type and year
- Field mapping configuration via JSON files
- Automatic calculations (e.g., tax deductions, totals)
- Coordinate-based text placement using pdf-lib
- Version-specific form support

## Architecture

### Components

1. **TaxFormService** (`src/utils/taxFormService.ts`)
   - Core service for template-based PDF filling
   - Handles template loading, mapping, and calculations
   - Uses pdf-lib for PDF manipulation

2. **PDF Templates** (`src/assets/pdf-templates/`)
   - Organized by form type and year
   - Official government-issued PDF forms
   - Separate mapping.json for each form type

3. **AuthorizationFormGenerator** (`src/utils/authorizationFormGenerator.ts`)
   - Integrates TaxFormService for supported forms
   - Falls back to jsPDF for forms without templates
   - Maintains backward compatibility

### Data Flow

```
User Input
    ↓
AuthorizationFormGenerator
    ↓
TaxFormService.fillForm()
    ↓
├─→ Load PDF Template
├─→ Load Field Mappings
├─→ Process Calculations
└─→ Fill PDF with Data
    ↓
Return Filled PDF Blob
```

## Implementation Details

### TaxFormService API

#### Main Methods

```typescript
class TaxFormService {
  // Fill a form and return PDF bytes
  async fillForm(formType: string, year: string, formData: TaxFormData): Promise<Uint8Array>
  
  // Fill a form and return as Blob (for download)
  async fillFormAsBlob(formType: string, year: string, formData: TaxFormData): Promise<Blob>
  
  // Load field mappings for a form
  async loadMappings(formType: string, year?: string): Promise<FormMapping>
}
```

#### Data Types

```typescript
interface FieldMapping {
  pdfField: string;  // PDF field name (reference)
  page: number;      // Page number (1-based)
  x?: number;        // X coordinate (from left)
  y?: number;        // Y coordinate (from bottom)
}

interface FormMapping {
  version: string;
  fields: Record<string, FieldMapping>;
  calculations: Record<string, string>;
}

interface TaxFormData {
  [key: string]: any;
}
```

### Integration with AuthorizationFormGenerator

The generator now attempts template-based filling for supported forms:

```typescript
async generateForm(data: AuthorizationFormData): Promise<Blob> {
  // Try template-based filling for PIT-37
  if (data.formType === 'PIT-37') {
    try {
      return await this.generatePIT37FromTemplate(data);
    } catch (error) {
      console.log('Template not available, falling back to jsPDF');
      // Falls through to jsPDF generation
    }
  }
  
  // ... existing jsPDF generation
}
```

### Form-Specific Calculations

#### PIT-37 (Personal Income Tax Return)

Automatic calculations performed:

1. **Total Income**
   ```
   totalIncome = employmentIncome + civilContractIncome
   ```

2. **Tax Deductions**
   ```
   totalTaxDeduction = childDeduction × numberOfChildren
   ```
   Standard child deduction: 1112.04 PLN per child

3. **Tax Base**
   ```
   taxBase = totalIncome - totalTaxDeduction
   ```

4. **Tax Due** (simplified 17% rate)
   ```
   taxDue = taxBase × 0.17
   ```

5. **Tax to Pay/Refund**
   ```
   taxToPay = taxDue - taxPaid
   ```

### Template Loading Strategy

The service uses a fallback strategy for template loading:

1. **Primary**: Assets directory
   ```
   /src/assets/pdf-templates/{formType}/{year}/{formType}_{year}.pdf
   ```

2. **Fallback**: Public directory (for backward compatibility)
   ```
   /upl-1_06-08-2.pdf  (for UPL-1)
   ```

This ensures existing functionality continues to work while supporting the new structure.

## Usage Examples

### Example 1: Generate PIT-37 with Child Deductions

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();

const formData = {
  client: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    pesel: '12345678901',
    nip: '1234567890',
    address: 'ul. Przykładowa 1',
    city: 'Warszawa',
    postalCode: '00-001'
  },
  employee: { /* ... */ },
  formType: 'PIT-37',
  additionalData: {
    year: '2023',
    taxOffice: 'US Warszawa Śródmieście',
    employmentIncome: 60000,
    civilContractIncome: 15000,
    numberOfChildren: 2,
    childDeduction: 1112.04,
    taxPaid: 8500
  }
};

// Generate and download
await generator.downloadForm(formData);

// Or get as blob
const pdfBlob = await generator.generateForm(formData);
```

### Example 2: Direct TaxFormService Usage

```typescript
import { TaxFormService } from './utils/taxFormService';

const service = new TaxFormService();

const formData = {
  taxpayerName: 'Jan Kowalski',
  taxpayerId: '12345678901',
  taxpayerNIP: '1234567890',
  taxpayerAddress: 'ul. Przykładowa 1',
  taxpayerCity: 'Warszawa',
  taxpayerPostalCode: '00-001',
  taxOffice: 'US Warszawa Śródmieście',
  employmentIncome: 60000,
  civilContractIncome: 15000,
  numberOfChildren: 2,
  childDeduction: 1112.04,
  taxPaid: 8500
};

const pdfBlob = await service.fillFormAsBlob('PIT-37', '2023', formData);

// Download
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'PIT-37_2023.pdf';
link.click();
URL.revokeObjectURL(url);
```

### Example 3: Load and Inspect Mappings

```typescript
import { TaxFormService } from './utils/taxFormService';

const service = new TaxFormService();

const mappings = await service.loadMappings('PIT-37', '2023');

console.log('Fields:', Object.keys(mappings.fields));
console.log('Calculations:', mappings.calculations);
```

## Configuration

### Field Mapping Configuration

Edit the mapping.json file for each form type:

```json
{
  "version": "2023",
  "fields": {
    "fieldName": {
      "pdfField": "pdf_field_name",
      "page": 1,
      "x": 150,
      "y": 720
    }
  },
  "calculations": {
    "computedField": "field1 + field2"
  }
}
```

### Coordinate Determination

To find correct coordinates for fields:

1. **Use a PDF editor** with coordinate display
2. **Trial and error method**:
   - Start with estimated coordinates
   - Generate test PDF
   - Adjust coordinates based on result
   - Repeat until correct
3. **Remember**: Y coordinates are from bottom (PDF standard)

### Font and Text Sizing

Current implementation uses:
- Font: Helvetica (StandardFonts.Helvetica)
- Size: 10pt
- Color: Black (rgb(0, 0, 0))

To customize, modify `TaxFormService.fillPdfForm()`.

## Adding New Forms

### Step-by-Step Process

1. **Create Directory Structure**
   ```bash
   mkdir -p src/assets/pdf-templates/NEW-FORM/2023
   ```

2. **Add PDF Template**
   Place official PDF:
   ```
   src/assets/pdf-templates/NEW-FORM/2023/NEW-FORM_2023.pdf
   ```

3. **Create mapping.json**
   ```json
   {
     "version": "2023",
     "fields": {
       "field1": { "pdfField": "field1", "page": 1, "x": 100, "y": 700 }
     },
     "calculations": {}
   }
   ```

4. **Add to AuthorizationFormGenerator**
   ```typescript
   if (data.formType === 'NEW-FORM') {
     try {
       return await this.generateNewFormFromTemplate(data);
     } catch (error) {
       // Fallback
     }
   }
   ```

5. **Implement Template Method**
   ```typescript
   private async generateNewFormFromTemplate(data: AuthorizationFormData): Promise<Blob> {
     const formData = {
       // Map client data to form fields
     };
     const taxFormService = new TaxFormService();
     return await taxFormService.fillFormAsBlob('NEW-FORM', year, formData);
   }
   ```

6. **Add Calculations (if needed)**
   Update `TaxFormService.processFormSpecificCalculations()`.

## Testing

### Manual Testing

1. **Generate Test Form**
   ```typescript
   // In browser console or test script
   const generator = new AuthorizationFormGenerator();
   const blob = await generator.generateForm(testData);
   const url = URL.createObjectURL(blob);
   window.open(url);
   ```

2. **Verify Output**
   - Check that all fields are filled correctly
   - Verify text alignment and positioning
   - Confirm calculations are accurate
   - Ensure text is readable (no overlap)

3. **Test Edge Cases**
   - Missing optional fields
   - Very long text values
   - Special characters (Polish characters)
   - Negative numbers
   - Zero values

### Automated Testing (Future)

Consider adding:
- Unit tests for calculation logic
- Integration tests for PDF generation
- Snapshot tests for consistent output
- Validation tests for field mappings

## Troubleshooting

### Common Issues

1. **Template Not Found**
   - Error: "PDF template not found for FORM-TYPE YEAR"
   - Solution: Verify PDF file exists and name matches pattern

2. **Mapping Not Found**
   - Error: "Failed to load mappings for FORM-TYPE"
   - Solution: Check mapping.json exists and is valid JSON

3. **Text Not Visible**
   - Possible causes:
     - Coordinates outside page bounds
     - Text color matches background
     - Font size too small
   - Solution: Adjust coordinates and verify settings

4. **Calculation Errors**
   - Check field names match exactly
   - Verify all required input fields are provided
   - Review calculation logic in service

5. **Polish Characters Not Displaying**
   - Current implementation sanitizes Polish characters
   - Future: Embed fonts with full Unicode support

## Performance Considerations

### Caching

- Field mappings are cached in memory after first load
- Cache key: `${formType}-${year}`
- Reduces repeated file reads

### PDF Loading

- Templates loaded on-demand
- Fetched via browser's fetch API
- Cached by browser automatically

### Optimization Tips

1. **Minimize mapping file size**: Remove unused fields
2. **Reuse TaxFormService instance**: Keeps mapping cache
3. **Pre-load templates**: Fetch during app initialization
4. **Compress PDFs**: Use optimized PDF files

## Future Enhancements

### Planned Features

1. **OCR-based coordinate detection**
   - Automatically detect field positions
   - Reduce manual configuration

2. **Visual mapping editor**
   - Web-based tool for adjusting coordinates
   - Live preview of filled forms

3. **Advanced font support**
   - Embed fonts with Polish character support
   - Custom font selection per field

4. **Form validation**
   - Validate input data against field definitions
   - Type checking and range validation

5. **Multi-page support enhancements**
   - Better handling of forms spanning multiple pages
   - Page break detection

6. **Conditional fields**
   - Show/hide fields based on data
   - Conditional calculations

7. **Digital signatures**
   - Add signature fields
   - Integrate with eSignature services

## Related Documentation

- [PDF Templates README](src/assets/pdf-templates/README.md) - Template structure and usage
- [UPL-1 Coordinate Guide](UPL1_COORDINATE_GUIDE.md) - Detailed UPL-1 implementation
- [Form and Payment Integration Guide](FORM_AND_PAYMENT_INTEGRATION_GUIDE.md) - Overall form system

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for specific errors
3. Verify template files and mappings are correct
4. Test with minimal data to isolate issues
