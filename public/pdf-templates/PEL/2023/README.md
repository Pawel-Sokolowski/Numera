# PEL 2023 Template

✅ **This template is available** - copied from PDFFile folder.

## Source
- Original file: `PDFFile/Formularz PEL. Pełnomocnictwo.pdf`
- Form: Power of Attorney to ZUS (Social Insurance Institution)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('PEL', '2023', formData);
```
