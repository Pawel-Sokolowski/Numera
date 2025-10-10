# PIT-OP 2024 Template

✅ **This template is available** - copied from PDFFile folder.

## Source
- Original file: `PDFFile/PIT-OP_*_2024.pdf`
- Form: Tax Advance Payment (Zaliczka na podatek dochodowy)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('PIT-OP', '2024', formData);
```
