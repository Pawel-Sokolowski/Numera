# PDF Generation Guide

This guide explains how to use the PDF generation system in the Management App.

## Overview

The application uses **template-based PDF filling** as the primary approach:
- **pdf-lib** - Template-based PDF filling for official forms (PRIMARY APPROACH)
- Official PDF templates are placed in `/public/pdf-templates/` directory
- Forms are filled with data, NOT generated from scratch

**Important:** This system does NOT generate PDFs programmatically. It fills existing official PDF templates with your data. You must provide the official PDF files in the correct directory structure.

## Quick Start

### Generating UPL-1 Forms

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();

const blob = await generator.generateForm({
  client: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    companyName: 'Example Sp. z o.o.',
    nip: '1234567890',
    address: {
      street: 'ul. Przykładowa 1',
      zipCode: '00-001',
      city: 'Warszawa'
    },
    status: 'aktualny',
    dateAdded: new Date().toISOString()
  },
  employee: {
    id: '1',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna@example.com',
    role: 'Księgowa'
  },
  formType: 'UPL-1',
  additionalData: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    taxOffice: 'Urząd Skarbowy Warszawa-Śródmieście'
  }
});

// Download the PDF
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'UPL-1.pdf';
link.click();
URL.revokeObjectURL(url);
```

### Generating PEL Forms

```typescript
const blob = await generator.generateForm({
  client: clientData,
  employee: employeeData,
  formType: 'PEL'
});
```

### Using pdf-lib Directly

If you need more control, you can use pdf-lib directly:

```typescript
import { UPL1PdfFiller } from './utils/upl1PdfFiller';

const filler = new UPL1PdfFiller('/pdf-templates/UPL-1/2023/UPL-1_2023.pdf');
const blob = await filler.fillFormAsBlob({
  client: clientData,
  employee: employeeData,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  scope: [
    'Reprezentowanie przed urzędami',
    'Składanie deklaracji podatkowych'
  ],
  taxOffice: 'US Warszawa-Śródmieście'
});
```

## Template Requirements

**All forms require official PDF templates:**

1. **Required:** Place official PDF templates in `/public/pdf-templates/{FORM-TYPE}/{YEAR}/`
2. **Example:** `/public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
3. **Source:** Download from official government websites (Ministry of Finance, ZUS, etc.)
4. **Error:** If template is missing, you'll get a clear error message with instructions

**No fallback to programmatic generation** - this ensures you always use official, compliant forms.

## Supported Form Types

All forms require official PDF templates to be placed in `/public/pdf-templates/`:

### Authorization Forms
- **UPL-1** - Tax office authorization (template-based with pdf-lib)
- **PEL** - ZUS authorization (template-based with pdf-lib)

### Tax Forms
- **PIT-36** - Business income tax return (template required)
- **PIT-37** - Personal income tax return (template required)
- **PIT-4R** - Flat tax return (template required)
- **PIT-11** - Income statement (template required)

### VAT Forms
- **VAT-7** - Monthly VAT declaration (template required)
- **VAT-7K** - Quarterly VAT declaration (template required)
- **VAT-R** - VAT registration (template required)
- **VAT-UE** - Intra-community transactions (template required)

### Other Forms
- **ZAW-FA** - Tax form selection (template required)
- **CIT-8** - Corporate income tax (template required)
- **ZUS-DRA** - Monthly settlement report (template required)
- **ZUS-RCA** - Individual monthly reports (template required)
- **JPK_VAT**, **JPK_FA**, **JPK_KR** - Standard audit files (template required)

## Testing

Run the test suite to verify PDF generation:

```bash
npx tsx scripts/testPdfMake.ts
```

This will generate test PDFs:
- `test-output-upl1-pdfmake.pdf`
- `test-output-pel-pdfmake.pdf`

## Polish Character Support

All three libraries support Polish characters, but with different approaches:

### pdfmake (Best)
- Uses Roboto font with full Unicode support
- Perfect rendering: ą, ć, ę, ł, ń, ó, ś, ź, ż
- No character conversion needed

### pdf-lib (Good)
- Uses Helvetica standard font
- Characters are sanitized (converted to ASCII equivalents)
- ą→a, ć→c, ę→e, etc.

### jsPDF (Good)
- Uses Helvetica standard font
- Similar to pdf-lib character handling

## Error Handling

The system provides clear error messages:

```typescript
try {
  const blob = await generator.generateForm(data);
} catch (error) {
  console.error('PDF generation failed:', error);
  // Error message includes:
  // - Which library failed
  // - Specific error reason
  // - Suggestions for fixes
}
```

## Browser Compatibility

All PDF libraries work in modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

### File Sizes
- **pdfmake PDFs:** ~30-40 KB (programmatically generated)
- **pdf-lib PDFs:** Varies based on template
- **jsPDF PDFs:** ~20-50 KB

### Generation Speed
- All libraries generate PDFs in < 1 second
- No server-side processing required
- All generation happens in the browser

## Troubleshooting

### PDF Not Generated

**Check 1:** Is the form type supported?
```typescript
const metadata = FORM_METADATA[formType];
console.log('Form supported:', metadata !== undefined);
```

**Check 2:** Are all required fields provided?
```typescript
const metadata = FORM_METADATA[formType];
console.log('Required fields:', metadata.requiredFields);
```

**Check 3:** Is pdfmake installed?
```bash
npm list pdfmake
```

### Polish Characters Not Displaying

If using pdf-lib and characters don't display:
- This is expected behavior (character sanitization)
- Switch to pdfmake for perfect Polish character support
- Or accept the ASCII conversion (ą→a)

### Template Not Found (pdf-lib)

If you see "Failed to load PDF template":
1. Check if template exists in `/public/pdf-templates/`
2. Copy official template from PDFFile: `cp PDFFile/upl-1_06-08-2.pdf public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
3. System will automatically fallback to pdfmake

### Large Bundle Size

The pdfmake library includes fonts, which adds ~800KB to the bundle.

To reduce bundle size:
```javascript
// In vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfmake-vendor': ['pdfmake', 'pdfmake/build/vfs_fonts']
        }
      }
    }
  }
}
```

## Adding New Forms

To add a new form type using pdfmake:

1. **Define the form type:**
```typescript
// In authorizationFormGenerator.ts
export type FormType = 
  | 'UPL-1' | 'PEL' | 'YOUR-NEW-FORM';
```

2. **Add form metadata:**
```typescript
export const FORM_METADATA: Record<FormType, FormMetadata> = {
  // ... existing forms
  'YOUR-NEW-FORM': {
    type: 'YOUR-NEW-FORM',
    name: 'Your Form Name',
    description: 'Form description',
    complexity: 'simple',
    category: 'pelnomocnictwa',
    requiredFields: ['firstName', 'lastName'],
    optionalFields: ['companyName']
  }
};
```

3. **Create form generator:**
```typescript
// In pdfMakeFiller.ts
export class YourFormGenerator {
  async generateForm(data: any): Promise<Blob> {
    const pdfMakeLib = await getPdfMake();
    
    return new Promise((resolve, reject) => {
      const docDefinition = {
        pageSize: 'A4',
        content: [
          { text: 'Your Form Title', style: 'header' },
          // ... your form content
        ],
        styles: {
          header: { fontSize: 18, bold: true }
        }
      };
      
      const pdfDocGenerator = pdfMakeLib.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => resolve(blob));
    });
  }
}
```

4. **Add to generateForm method:**
```typescript
async generateForm(data: AuthorizationFormData): Promise<Blob> {
  if (data.formType === 'YOUR-NEW-FORM') {
    const generator = new YourFormGenerator();
    return await generator.generateForm(data);
  }
  // ... rest of the code
}
```

## API Reference

### PDFMakeUPL1Filler

```typescript
class PDFMakeUPL1Filler {
  async fillForm(data: UPL1Data): Promise<Uint8Array>
  async fillFormAsBlob(data: UPL1Data): Promise<Blob>
}

interface UPL1Data {
  client: Client;
  employee: User & { pesel?: string };
  scope?: string[];
  startDate?: string;
  endDate?: string;
  taxOffice?: string;
}
```

### PDFMakeFormGenerator

```typescript
class PDFMakeFormGenerator {
  async generatePELForm(client: Client, employee: User): Promise<Blob>
}
```

### AuthorizationFormGenerator

```typescript
class AuthorizationFormGenerator {
  async generateForm(data: AuthorizationFormData): Promise<Blob>
  async downloadForm(data: AuthorizationFormData): Promise<void>
}

interface AuthorizationFormData {
  client: Client;
  employee: User;
  formType: FormType;
  additionalData?: {
    period?: string;
    year?: string;
    taxOffice?: string;
    [key: string]: any;
  };
}
```

## Best Practices

1. **Always use try-catch** when generating PDFs
2. **Provide all required fields** to avoid errors
3. **Use pdfmake for new forms** (best Polish support)
4. **Test in multiple browsers** before deploying
5. **Keep form templates updated** in `/public/pdf-templates/`
6. **Use fallback system** rather than forcing one library

## Resources

- [pdfmake Documentation](http://pdfmake.org/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [jsPDF Documentation](https://parall.ax/products/jspdf)
- [Internal Documentation](../fixes/PDF_LIBRARY_IMPROVEMENT.md)

## Support

For issues or questions:
1. Check this guide
2. Review [PDF_LIBRARY_IMPROVEMENT.md](../fixes/PDF_LIBRARY_IMPROVEMENT.md)
3. Run test suite: `npx tsx scripts/testPdfMake.ts`
4. Open an issue on GitHub
