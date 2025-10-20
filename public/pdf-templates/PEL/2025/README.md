# PEL 2025 Template

✅ **This template is available** - copied from 2023 version.

## Source
- Original file: Based on `PEL_2023.pdf`
- Form: Power of Attorney to ZUS (Social Insurance Institution)

## Usage
This form is ready to use with the TaxFormService.

```typescript
const service = new TaxFormService();
await service.fillFormAsBlob('PEL', '2025', formData);
```

## Notes
- Uses the same field mappings as PEL 2023
- Form structure remains compatible with 2023 version
