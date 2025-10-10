# UPL-1 2023 Template

✅ **This template is available** - generated from scripts/generateUPL1Template.ts

## Source
- Generated file: `scripts/generateUPL1Template.ts`
- Also available in: `public/upl-1_06-08-2.pdf` and `PDFFile/upl-1_06-08-2.pdf`
- Form: Power of Attorney to Tax Office (Pełnomocnictwo do Urzędu Skarbowego)

## Regenerating the Template
If the PDF file becomes corrupted or needs to be regenerated, run:

```bash
npx tsx scripts/generateUPL1Template.ts
```

This will regenerate all copies of the UPL-1 template:
- `PDFFile/upl-1_06-08-2.pdf`
- `public/upl-1_06-08-2.pdf`
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
- `upl-1_06-08-2.pdf` (root)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('UPL-1', '2023', formData);
```

## Note
This is the same file that was previously used in the UPL1PdfFiller implementation.
