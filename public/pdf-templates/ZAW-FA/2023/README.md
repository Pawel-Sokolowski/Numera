# ZAW-FA 2023 Template

✅ **This template is available** - copied from PDFFile folder.

## Source
- Original file: `PDFFile/zaw-fa-01-18.pdf`
- Form: Employee Tax Card (Karta podatkowa pracownika)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('ZAW-FA', '2023', formData);
```
