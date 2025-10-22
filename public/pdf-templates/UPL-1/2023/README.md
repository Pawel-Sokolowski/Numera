# UPL-1 2023 Template

✅ **This template is available** - copied from PDFFile/upl-1_06-08-2.pdf

## Source
- Original file: `PDFFile/upl-1_06-08-2.pdf` (official working template)
- Also available in: `public/upl-1_06-08-2.pdf` and root `upl-1_06-08-2.pdf`
- Form: Power of Attorney to Tax Office (Pełnomocnictwo do Urzędu Skarbowego)

## Restoring the Template
If the PDF file becomes corrupted, copy from the PDFFile folder:

```bash
cp PDFFile/upl-1_06-08-2.pdf public/upl-1_06-08-2.pdf
cp PDFFile/upl-1_06-08-2.pdf public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
cp PDFFile/upl-1_06-08-2.pdf upl-1_06-08-2.pdf
```

The PDFFile folder contains the authoritative source files.

## Usage
This form is ready to use with the UPL1PdfFiller or TaxFormService.

### Using UPL1PdfFiller (Recommended)
The UPL1PdfFiller automatically loads coordinates from the `mapping.json` file:

```typescript
import { UPL1PdfFiller } from './utils/upl1PdfFiller';

const filler = new UPL1PdfFiller();
const pdfBlob = await filler.fillFormAsBlob({
  client: clientData,
  employee: employeeData,
  scope: ['Representative authorization', 'Tax document filing'],
  startDate: '01.01.2024',
  endDate: '31.12.2024'
});
```

### Using TaxFormService
```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('UPL-1', '2023', formData);
```

## Coordinate Mapping
The form field coordinates are defined in `../mapping.json`. This file contains:
- Field names (e.g., principalName, attorneyPESEL)
- X/Y coordinates for each field on the PDF
- Page numbers for multi-page forms

The UPL1PdfFiller automatically loads these coordinates when filling the form. If the mapping file is not available, it falls back to hardcoded coordinates for backward compatibility.

To update field positions, edit the `mapping.json` file rather than modifying code.

## Note
This is the same file that was previously used in the UPL1PdfFiller implementation.
