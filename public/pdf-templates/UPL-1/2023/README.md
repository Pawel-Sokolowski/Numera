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
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('UPL-1', '2023', formData);
```

## Note
This is the same file that was previously used in the UPL1PdfFiller implementation.
