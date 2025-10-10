# PDF Template Implementation Summary

## Overview

This document summarizes the implementation of the PDF template structure and Tax Form Service for the Management App.

## What Was Implemented

### 1. Folder Structure

Created a complete folder structure for PDF templates:

```
src/assets/pdf-templates/
├── README.md                      # Complete usage documentation
├── PIT-37/
│   ├── 2022/
│   │   ├── README.md             # Instructions for 2022 template
│   │   └── (PIT-37_2022.pdf)     # Place official PDF here
│   ├── 2023/
│   │   ├── README.md             # Instructions for 2023 template
│   │   └── (PIT-37_2023.pdf)     # Place official PDF here
│   └── mapping.json               # Field coordinates & calculations
└── UPL-1/
    ├── 2023/
    │   ├── README.md             # Instructions for 2023 template
    │   └── (UPL-1_2023.pdf)      # Can copy from /public/
    └── mapping.json               # Field coordinates
```

### 2. TaxFormService Class

**File:** `src/utils/taxFormService.ts`

**Features:**
- Load PDF templates by form type and year
- Load field mappings from JSON files
- Process form-specific calculations
- Fill PDFs using coordinate-based text placement
- Cache mappings for performance
- Generate downloadable PDF blobs

**Key Methods:**
```typescript
async fillForm(formType: string, year: string, formData: TaxFormData): Promise<Uint8Array>
async fillFormAsBlob(formType: string, year: string, formData: TaxFormData): Promise<Blob>
async loadMappings(formType: string, year?: string): Promise<FormMapping>
```

### 3. Integration with AuthorizationFormGenerator

**File:** `src/utils/authorizationFormGenerator.ts`

**Changes:**
- Added import for TaxFormService
- Updated `generateForm()` to try template-based filling for PIT-37
- Added `generatePIT37FromTemplate()` method
- Maintains backward compatibility with fallback to jsPDF

**Flow:**
1. Try template-based filling (TaxFormService)
2. If template not found, fall back to jsPDF generation
3. Existing functionality preserved

### 4. Field Mappings

**PIT-37 mapping.json** - Includes:
- Taxpayer information fields
- Income fields (employment, civil contracts)
- Deduction fields (children)
- Tax calculation fields
- Automatic calculations for:
  - Total income
  - Tax deductions (children × 1112.04 PLN)
  - Tax base
  - Tax due (17% rate)
  - Tax to pay/refund

**UPL-1 mapping.json** - Includes:
- Principal (Mocodawca) information
- Attorney (Pełnomocnik) information
- Scope of authorization (6 items)
- Dates and validity period
- Signature locations

### 5. Documentation

Created three comprehensive documentation files:

1. **TAX_FORM_SERVICE_GUIDE.md** (11KB)
   - Complete implementation guide
   - Architecture and data flow
   - API documentation
   - Usage examples
   - Adding new forms
   - Testing and troubleshooting

2. **src/assets/pdf-templates/README.md** (5.5KB)
   - Directory structure explanation
   - Mapping file format
   - Coordinate system details
   - Adding new templates
   - Troubleshooting tips

3. **src/utils/taxFormService.example.ts** (11KB)
   - 9 comprehensive usage examples
   - Direct service usage
   - Generator integration
   - Error handling
   - Batch generation
   - UI integration patterns

## How It Works

### Template Loading Strategy

1. **Primary:** Assets directory
   ```
   /src/assets/pdf-templates/{formType}/{year}/{formType}_{year}.pdf
   ```

2. **Fallback:** Public directory (backward compatibility)
   ```
   /upl-1_06-08-2.pdf (for UPL-1)
   ```

### Calculation Engine

**PIT-37 Calculations:**
```javascript
totalIncome = employmentIncome + civilContractIncome
totalTaxDeduction = childDeduction × numberOfChildren
taxBase = totalIncome - totalTaxDeduction
taxDue = taxBase × 0.17
taxToPay = taxDue - taxPaid
```

### Coordinate System

- Origin: Bottom-left corner (0, 0)
- X-axis: Left to right (0 to 595 for A4)
- Y-axis: Bottom to top (0 to 842 for A4)
- Standard A4: 595 × 842 points

## Usage Examples

### Example 1: Generate PIT-37 with Child Deductions

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();

await generator.downloadForm({
  client: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    pesel: '12345678901',
    nip: '1234567890',
    address: 'ul. Przykładowa 1',
    city: 'Warszawa',
    postalCode: '00-001',
    // ... other fields
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
});
```

### Example 2: Direct TaxFormService Usage

```typescript
import { TaxFormService } from './utils/taxFormService';

const service = new TaxFormService();

const formData = {
  taxpayerName: 'Jan Kowalski',
  taxpayerId: '12345678901',
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

## Next Steps

### To Use This Implementation:

1. **Add PDF Templates**
   - Download official PIT-37 forms for 2022 and 2023
   - Place them in the appropriate directories
   - Copy UPL-1 template from public directory if needed

2. **Adjust Coordinates** (if needed)
   - Open the official PDF
   - Identify field positions
   - Update mapping.json with correct coordinates
   - Test and iterate

3. **Add More Forms**
   - Follow the pattern for PIT-37
   - Create directory structure
   - Add mapping.json
   - Implement in AuthorizationFormGenerator

### Adding New Form Types:

1. Create directory: `src/assets/pdf-templates/FORM-NAME/`
2. Create year subdirectories with README files
3. Create mapping.json with field definitions
4. Add PDF templates
5. Update AuthorizationFormGenerator to use template
6. Add form-specific calculations if needed

## Key Benefits

✅ **Official Forms** - Uses actual government-issued PDFs  
✅ **Accurate Layout** - No need to recreate forms from scratch  
✅ **Version Support** - Easy to support multiple years  
✅ **Maintainability** - Separate templates from code  
✅ **Flexibility** - Field mappings can be updated without code changes  
✅ **Calculations** - Automatic tax calculations for PIT-37  
✅ **Backward Compatible** - Existing functionality preserved  
✅ **Fallback Support** - Falls back to jsPDF if template unavailable  

## Technical Details

- **Library:** pdf-lib for PDF manipulation
- **Font:** Helvetica (StandardFonts.Helvetica)
- **Font Size:** 10pt
- **Color:** Black (rgb(0, 0, 0))
- **Caching:** Mapping files cached after first load
- **Performance:** Minimal overhead, efficient PDF generation

## Files Changed/Created

```
Modified:
- src/utils/authorizationFormGenerator.ts (added TaxFormService integration)

Created:
- src/utils/taxFormService.ts (new service)
- src/utils/taxFormService.example.ts (usage examples)
- src/assets/pdf-templates/ (complete directory structure)
- src/assets/pdf-templates/README.md
- src/assets/pdf-templates/PIT-37/mapping.json
- src/assets/pdf-templates/PIT-37/2022/README.md
- src/assets/pdf-templates/PIT-37/2023/README.md
- src/assets/pdf-templates/UPL-1/mapping.json
- src/assets/pdf-templates/UPL-1/2023/README.md
- TAX_FORM_SERVICE_GUIDE.md
- PDF_TEMPLATE_IMPLEMENTATION_SUMMARY.md (this file)
```

## Build Status

✅ **All builds successful**  
✅ **No breaking changes**  
✅ **Backward compatible**  

## Related Documentation

- [TAX_FORM_SERVICE_GUIDE.md](TAX_FORM_SERVICE_GUIDE.md) - Complete implementation guide
- [src/assets/pdf-templates/README.md](src/assets/pdf-templates/README.md) - Template usage
- [src/utils/taxFormService.example.ts](src/utils/taxFormService.example.ts) - Code examples
- [UPL1_COORDINATE_GUIDE.md](UPL1_COORDINATE_GUIDE.md) - UPL-1 specific details
- [FORM_AND_PAYMENT_INTEGRATION_GUIDE.md](FORM_AND_PAYMENT_INTEGRATION_GUIDE.md) - Overall system

## Support

For questions or issues:
1. Check the documentation files listed above
2. Review the example files
3. Check console logs for specific errors
4. Verify template files and mappings are correct

---

**Implementation Date:** 2024  
**Status:** Complete and Ready for Use  
**Build:** ✅ Successful
