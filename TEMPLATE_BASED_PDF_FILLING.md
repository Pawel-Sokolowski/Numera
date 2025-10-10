# Template-Based PDF Filling Implementation

## Overview

The system uses **template-based PDF filling exclusively**. This means:

✅ **Use official PDF files** - Place official PDF forms in `/public/pdf-templates/`  
✅ **Fill with data** - The system fills existing forms with your client/employee data using pdf-lib  
✅ **OCR/Form field filling** - Data is written to official PDF form fields or specific coordinates  
❌ **No programmatic generation** - System cannot create PDFs from scratch - all generation code has been removed

**Note:** All legacy PDF generation code (jsPDF methods, pdfmake library) has been completely removed as of Version 1.3.0.  

## How It Works

### 1. Official PDF Templates Required

All forms now require official PDF templates to be placed in the correct directory:

```
/public/pdf-templates/{FORM-TYPE}/{YEAR}/{FORM-TYPE}_{YEAR}.pdf
```

**Example:**
```
/public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
/public/pdf-templates/PEL/2023/PEL_2023.pdf
/public/pdf-templates/PIT-37/2023/PIT-37_2023.pdf
```

### 2. Data Filling with pdf-lib

The system uses **pdf-lib** to:
- Load the official PDF template
- Draw text at specific coordinates
- Fill form fields with client/employee data
- Save the filled PDF

### 3. No Fallback to Generation

If a template is missing, you'll get a clear error message:

```
Form type VAT-7 requires an official PDF template.

Please add the official VAT-7 PDF template to: /public/pdf-templates/VAT-7/

Download the official template from the appropriate government website 
and place it in the correct directory.
```

## Available Templates

The repository includes **21 official PDF templates** sourced from the `PDFFile` folder:

- ✅ UPL-1 (Tax office authorization)
- ✅ PEL (ZUS authorization)
- ✅ PIT-R (Business tax return)
- ✅ ZAW-FA (Tax form selection)
- ✅ IFT-1, PIT-2, PIT-OP
- ✅ OPD-1, OPL-1, OPO-1, OPS-1
- ✅ PPD-1, PPO-1, PPS-1
- ✅ UPL-1P

**Source:** Official PDF forms are stored in the `PDFFile` folder at the repository root, then organized into `/public/pdf-templates/` for application use.

## What Changed

### Before (❌ Unwanted Behavior - Versions 1.0-1.1)

1. **UPL-1:** Tried pdf-lib → fell back to pdfmake (generated from scratch)
2. **PEL:** Used pdfmake first (generated from scratch)
3. **Other forms:** Generated with jsPDF (created from scratch)

**Problem:** System created new PDFs instead of filling official ones.

### Version 1.2.0 (⚠️ Partially Fixed)

1. **UPL-1:** Uses official template with pdf-lib ONLY
2. **PEL:** Uses official template with pdf-lib ONLY
3. **Other forms:** Use official templates with pdf-lib ONLY
4. **But:** Legacy generation code still present in codebase

### Current (✅ Fully Fixed - Version 1.3.0)

1. **All forms:** Use official templates with pdf-lib ONLY
2. **All legacy code:** Completely removed (1,620+ lines deleted)
3. **No fallbacks:** System will error if template is missing (intentional)
4. **Dependencies:** pdfmake and related libraries removed

**Result:** System exclusively fills official PDFs using OCR/form fields. No generation capabilities remain.

## Usage Example

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();

// This will ONLY work if official template exists
const blob = await generator.generateForm({
  client: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    nip: '1234567890',
    // ... other client data
  },
  employee: {
    firstName: 'Anna',
    lastName: 'Nowak',
    // ... other employee data
  },
  formType: 'UPL-1',
  additionalData: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    taxOffice: 'US Warszawa-Śródmieście'
  }
});

// Download the filled PDF
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'UPL-1_filled.pdf';
link.click();
```

## Adding New Form Templates

To add a new form:

1. **Download official PDF** from government website
2. **Add to PDFFile folder** (for archival/reference):
   ```bash
   cp official-form.pdf PDFFile/
   ```
3. **Create directory structure:**
   ```bash
   mkdir -p public/pdf-templates/FORM-NAME/2024
   ```
4. **Place PDF file:**
   ```bash
   cp PDFFile/official-form.pdf public/pdf-templates/FORM-NAME/2024/FORM-NAME_2024.pdf
   ```
5. **Configure field mappings** (optional):
   - Create `mapping.json` if needed for automatic field filling
   - See `public/pdf-templates/README.md` for details

## Verification

Run the verification script to check your setup:

```bash
npx tsx scripts/verifyTemplateBasedApproach.ts
```

This will:
- ✅ Check for available templates
- ✅ Verify build succeeds
- ✅ Confirm template-based approach is working

## Benefits

1. **Official Forms:** Always use government-approved forms
2. **Compliance:** Ensures forms meet official requirements
3. **Quality:** No "generated" PDFs with potential formatting issues
4. **Clarity:** Clear errors when templates are missing
5. **Simplicity:** One approach for all forms (template-based)

## Related Documentation

- [PDF Generation Guide](docs/guides/PDF_GENERATION_GUIDE.md)
- [Tax Form Service Guide](docs/features/TAX_FORM_SERVICE_GUIDE.md)
- [PDF Templates README](public/pdf-templates/README.md)

## Support

If you need to add a form template:
1. Find the official PDF on the government website
2. Place it in `/public/pdf-templates/{FORM-TYPE}/{YEAR}/`
3. Name it correctly: `{FORM-TYPE}_{YEAR}.pdf`
4. The system will automatically use it

No fallback to generation = You must provide the official template!
