# Multi-Page PDF Forms and Editable Fields

## Overview

This document describes the multi-page PDF form support and the new editable fields feature in the Numera office management system.

## Features

### 1. Multi-Page PDF Form Support

The system now fully supports PDF forms that span multiple pages. Field mappings can specify which page each field should be placed on.

#### How It Works

- **Field Mapping**: Each field in `mapping.json` includes a `page` property (1-based index)
- **Automatic Page Selection**: The filling service automatically selects the correct page for each field
- **All Pages Filled**: All pages of the PDF are processed, not just the first page

#### Example Mapping

```json
{
  "version": "2023",
  "fields": {
    "taxpayerName": { "pdfField": "nazwisko_imie", "page": 1, "x": 150, "y": 720 },
    "employmentIncome": { "pdfField": "przychod_stosunku_pracy", "page": 2, "x": 400, "y": 650 },
    "childDeduction": { "pdfField": "odliczenie_dzieci", "page": 3, "x": 400, "y": 500 }
  }
}
```

This example shows fields distributed across 3 pages of a PIT-37 form.

### 2. Editable PDF Fields

PDFs can now be generated with fields that remain editable after filling, allowing users to:

- Review and modify pre-filled data
- Add additional information manually
- Complete fields that weren't filled automatically

#### Two Filling Methods

1. **Coordinate-Based Filling** (Default)
   - Draws text directly on the PDF at specified coordinates
   - When `keepFieldsEditable: false` - fields are flattened (cannot be edited)
   - When `keepFieldsEditable: true` - original Acroform fields remain interactive

2. **Acroform Field Filling** (When `keepFieldsEditable: true`)
   - Detects and fills interactive PDF form fields
   - Preserves field editability
   - Supports text fields, checkboxes, radio buttons, and dropdowns

## API Reference

### TaxFormService

#### New Interface

```typescript
export interface TaxFormFillingOptions {
  /** If true, keeps form fields editable instead of flattening them */
  keepFieldsEditable?: boolean;
}
```

#### Updated Methods

```typescript
async fillForm(
  formType: string,
  year: string,
  formData: TaxFormData,
  options: TaxFormFillingOptions = {}
): Promise<Uint8Array>

async fillFormAsBlob(
  formType: string,
  year: string,
  formData: TaxFormData,
  options: TaxFormFillingOptions = {}
): Promise<Blob>
```

#### Example Usage

```typescript
import { TaxFormService } from './utils/taxFormService';

const service = new TaxFormService();

// Generate editable PDF
const pdfBytes = await service.fillForm('PIT-37', '2023', formData, {
  keepFieldsEditable: true,
});

// Generate flattened PDF (default)
const flattenedPdf = await service.fillForm('PIT-37', '2023', formData);
```

### UniversalPdfFiller

#### Updated Interface

```typescript
export interface FillingOptions {
  sanitizePolishChars?: boolean;
  fontSize?: number;
  fontColor?: { r: number; g: number; b: number };
  smartPositioning?: boolean;
  fuzzyMatching?: boolean;
  validateFields?: boolean;
  keepFieldsEditable?: boolean; // NEW
}
```

#### Example Usage

```typescript
import { UniversalPdfFiller } from './utils/universalPdfFiller';

const filler = new UniversalPdfFiller();

const { pdfBytes, result } = await filler.fillForm(pdfTemplate, formData, {
  keepFieldsEditable: true,
});
```

### AuthorizationFormGenerator

#### Updated Methods

```typescript
async generateForm(
  data: AuthorizationFormData,
  keepFieldsEditable: boolean = false
): Promise<Blob>

async downloadForm(
  data: AuthorizationFormData,
  keepFieldsEditable: boolean = false
): Promise<void>
```

#### Example Usage

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();

// Generate editable form
const blob = await generator.generateForm(formData, true);

// Download editable form
await generator.downloadForm(formData, true);
```

### UPL1PdfFiller

The UPL-1 filler already had this feature:

```typescript
export interface UPL1FillingOptions {
  keepFieldsEditable?: boolean;
}

async fillForm(data: UPL1Data, options: UPL1FillingOptions = {}): Promise<Uint8Array>
```

## User Interface

### Authorization Form Dialog

A new checkbox has been added to the form generation dialog:

```
☐ Zachowaj pola formularza edytowalne
  (umożliwia późniejsze uzupełnianie pól w PDF)
```

**Location**: Authorization Form Dialog → Before action buttons  
**Default**: Unchecked (fields will be flattened)  
**When checked**: PDF fields remain editable after generation

## Testing

### Manual Testing

1. **Test Multi-Page Support**

   ```bash
   npm run test:pdf-filling
   ```

2. **Test Editable Fields**

   ```bash
   npx ts-node scripts/testMultiPageEditableFields.ts
   ```

3. **Visual Verification**
   - Generate a PDF with `keepFieldsEditable: true`
   - Open the PDF in Adobe Acrobat Reader or similar
   - Verify that fields can be clicked and edited
   - Compare with a flattened PDF (default behavior)

### Test Forms

Forms to test multi-page support:

- **PIT-37** (3 pages)
- **IFT-1** (multiple pages)
- **OPL-1P** (multiple pages)

### Expected Behavior

| Option                      | Form Fields | Editability  | Use Case                       |
| --------------------------- | ----------- | ------------ | ------------------------------ |
| `keepFieldsEditable: false` | Flattened   | Not editable | Final documents, archiving     |
| `keepFieldsEditable: true`  | Interactive | Editable     | Review, completion, correction |

## Implementation Details

### How It Works Internally

1. **PDF Loading**

   ```typescript
   const pdfDoc = await PDFDocument.load(pdfBytes);
   const form = pdfDoc.getForm();
   const formFields = form.getFields();
   ```

2. **Method Selection**

   ```typescript
   if (options.keepFieldsEditable && formFields.length > 0) {
     // Use Acroform filling - keeps fields editable
     await this.fillAcroformFields(pdfDoc, form, data, mappings);
   } else {
     // Use coordinate-based filling
     // Draw text at specified coordinates
   }
   ```

3. **Saving**
   ```typescript
   if (options.keepFieldsEditable) {
     // Save without flattening
     return await pdfDoc.save({ useObjectStreams: false });
   } else {
     // Default save (may flatten)
     return await pdfDoc.save();
   }
   ```

### Acroform Field Matching

The system uses intelligent field matching:

1. **Direct Mapping**: Uses `pdfField` from `mapping.json`
2. **Fuzzy Matching**: Case-insensitive partial matching
3. **Field Type Detection**: Automatically handles different field types

```typescript
// Field types supported
- PDFTextField    → setText()
- PDFCheckBox     → check() / uncheck()
- PDFRadioGroup   → select()
- PDFDropdown     → select()
```

## Best Practices

### When to Use Editable Fields

✅ **Use editable fields when:**

- Users need to review and verify pre-filled data
- Some fields cannot be filled automatically
- Users need to add additional information later
- Creating draft documents for review

❌ **Don't use editable fields when:**

- Creating final, archived documents
- PDF will be signed digitally (must be flattened)
- Ensuring data integrity is critical
- Sending official documents to authorities

### Performance Considerations

- **Editable PDFs** are slightly larger (contain form field definitions)
- **Flattened PDFs** are more compatible with older PDF readers
- **Coordinate-based filling** is faster than Acroform detection

### Security Considerations

- Editable PDFs can be modified by recipients
- Use flattened PDFs for official submissions
- Consider digital signatures for non-editable documents

## Troubleshooting

### Issue: Fields Not Editable

**Possible causes:**

1. `keepFieldsEditable` option not set to `true`
2. PDF doesn't have Acroform fields (uses coordinate filling only)
3. PDF reader doesn't support interactive forms

**Solution:**

- Check that option is passed correctly
- Verify PDF has form fields: `await universalFiller.analyzePdf(pdfBytes)`
- Use Adobe Acrobat Reader for testing

### Issue: Fields Not Filled on All Pages

**Possible causes:**

1. Mapping doesn't include fields for all pages
2. Page numbers in mapping are incorrect
3. PDF template has fewer pages than expected

**Solution:**

- Review `mapping.json` - ensure all pages have field definitions
- Verify page numbers are 1-based (not 0-based)
- Check actual PDF page count

### Issue: Text Overlaps or Misaligned

**Possible causes:**

1. Coordinates in mapping are incorrect
2. Font size too large
3. Multi-line text not handled properly

**Solution:**

- Adjust x/y coordinates in `mapping.json`
- Use smaller font size in options
- Split long text into multiple fields

## Migration Guide

### Existing Code

If you have existing code that generates PDFs:

```typescript
// Old code
const service = new TaxFormService();
const pdfBytes = await service.fillForm('PIT-37', '2023', formData);
```

### Adding Editable Support

```typescript
// New code - editable
const pdfBytes = await service.fillForm('PIT-37', '2023', formData, {
  keepFieldsEditable: true,
});

// New code - flattened (explicit)
const pdfBytes = await service.fillForm('PIT-37', '2023', formData, {
  keepFieldsEditable: false,
});
```

**No breaking changes** - all existing code continues to work with default behavior (flattened).

## Future Enhancements

Planned improvements:

1. **Field Validation**: Validate filled field values
2. **Signature Support**: Add digital signature fields
3. **Field Locking**: Lock specific fields while keeping others editable
4. **Conditional Fields**: Show/hide fields based on data
5. **Preview Mode**: In-app PDF editor before download

## Related Documentation

- [Tax Form Service Guide](TAX_FORM_SERVICE_GUIDE.md)
- [PDF Generation Guide](../guides/PDF_GENERATION_GUIDE.md)
- [Universal PDF Filler](../../src/utils/universalPdfFiller.ts)
- [UPL-1 Coordinate Guide](../guides/UPL1_COORDINATE_GUIDE.md)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review console logs for specific errors
3. Test with official PDF templates
4. Verify mapping.json configuration

## Changelog

### v1.1.0 (2025-10-20)

- ✨ Added `keepFieldsEditable` option to TaxFormService
- ✨ Added `keepFieldsEditable` option to UniversalPdfFiller
- ✨ Added Acroform field filling support
- ✨ Added UI checkbox for editable fields in AuthorizationFormDialog
- 🐛 Fixed multi-page field filling (was already supported, now documented)
- 📝 Added comprehensive documentation and tests
