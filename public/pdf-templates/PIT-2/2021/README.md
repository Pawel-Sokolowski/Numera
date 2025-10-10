# PIT-2 2021 Template

✅ **This template is available** - copied from PDFFile folder.

## Source
- Original file: `PDFFile/pit-2_06_2021.pdf`
- Form: Annual Tax Statement (Roczne rozliczenie podatku)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('PIT-2', '2021', formData);
```
