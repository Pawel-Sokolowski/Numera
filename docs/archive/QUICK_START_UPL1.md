# UPL-1 Quick Start Guide

## Overview

Automated UPL-1 (Pełnomocnictwo do Urzędu Skarbowego) form generation is now available using the official PDF template.

## Usage

### In Your Code

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();

// Generate and download UPL-1
await generator.downloadForm({
  client: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    nip: '1234567890',
    address: {
      street: 'ul. Testowa 123',
      zipCode: '00-001',
      city: 'Warszawa'
    }
  },
  employee: {
    firstName: 'Anna',
    lastName: 'Nowak',
    pesel: '98765432101'
  },
  formType: 'UPL-1',
  additionalData: {
    startDate: '01.10.2024',
    endDate: '31.12.2024'
  }
});
```

### Via UI

1. Open Authorization Forms dialog
2. Select **UPL-1** from form type
3. Select client and employee
4. Click **Generate**
5. PDF downloads automatically

## Testing Coordinates

If you need to adjust field positions:

```bash
# Generate test PDF with visible coordinates
node scripts/test-upl1-coordinates.js

# Review output
open build/upl-1-test-filled.pdf

# Adjust coordinates in src/utils/upl1PdfFiller.ts
# Then test again
```

## Key Files

- **Implementation**: `src/utils/upl1PdfFiller.ts`
- **Template PDF**: `public/upl-1_06-08-2.pdf`
- **Test Script**: `scripts/test-upl1-coordinates.js`
- **Full Guide**: `UPL1_COORDINATE_GUIDE.md`
- **Summary**: `UPL1_IMPLEMENTATION_SUMMARY.md`

## Troubleshooting

**PDF not generating?**
- Check that `public/upl-1_06-08-2.pdf` exists
- Verify you're using `await` for async methods
- Check browser console for errors

**Text in wrong position?**
- Run test script: `node scripts/test-upl1-coordinates.js`
- Adjust coordinates in `src/utils/upl1PdfFiller.ts`
- See `UPL1_COORDINATE_GUIDE.md` for details

**Polish characters display issues?**
- Current limitation with basic font
- See enhancement section in `UPL1_IMPLEMENTATION_SUMMARY.md`

## Documentation

- 📘 **[UPL1_IMPLEMENTATION_SUMMARY.md](./UPL1_IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- 📐 **[UPL1_COORDINATE_GUIDE.md](./UPL1_COORDINATE_GUIDE.md)** - Coordinate adjustment guide
- 📋 **[FORM_AND_PAYMENT_INTEGRATION_GUIDE.md](./FORM_AND_PAYMENT_INTEGRATION_GUIDE.md)** - All forms documentation

## Next Steps

1. **Test the implementation**: Generate a UPL-1 form via UI
2. **Verify coordinates**: Run test script and compare with blank form
3. **Adjust if needed**: Fine-tune coordinates for perfect alignment
4. **Optional**: Add custom font for full Polish character support

## API Reference

### AuthorizationFormGenerator

```typescript
class AuthorizationFormGenerator {
  // Generate form as Blob (async)
  async generateForm(data: AuthorizationFormData): Promise<Blob>
  
  // Generate and trigger download (async)
  async downloadForm(data: AuthorizationFormData): Promise<void>
}
```

### UPL1PdfFiller

```typescript
class UPL1PdfFiller {
  constructor(pdfTemplatePath: string = '/upl-1_06-08-2.pdf')
  
  // Fill form and return bytes
  async fillForm(data: UPL1Data): Promise<Uint8Array>
  
  // Fill form and return blob
  async fillFormAsBlob(data: UPL1Data): Promise<Blob>
}
```

## Status

✅ **Implemented and working**
- Official PDF template loading
- Coordinate-based text filling
- Async operation support
- Test utilities
- Comprehensive documentation

📝 **Requires user action**
- Coordinate fine-tuning (run test script)
- Optional: Custom font for Polish characters

## Support

For issues or questions:
1. Check [UPL1_IMPLEMENTATION_SUMMARY.md](./UPL1_IMPLEMENTATION_SUMMARY.md) troubleshooting section
2. Review [UPL1_COORDINATE_GUIDE.md](./UPL1_COORDINATE_GUIDE.md) for coordinate adjustments
3. Run test script: `node scripts/test-upl1-coordinates.js`
