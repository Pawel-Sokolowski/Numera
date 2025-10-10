# PIT-R 2022 Template

✅ **This template is available** - copied from PDFFile folder.

## Source
- Original file: `PDFFile/PIT-R_*_2022.pdf`
- Form: Tax Return for Business Income (Zeznanie podatkowe od przychodów z działalności gospodarczej)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('PIT-R', '2022', formData);
```

## Note
PIT-R is for entrepreneurs with business income. It can be used as an alternative to PIT-37 for testing the template system.
