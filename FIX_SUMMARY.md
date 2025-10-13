# Fix Summary: UPL-1 PDF Template Loading Error

## Issue
The application was failing with the error:
```
Błąd podczas generowania dokumentu: Failed to fill UPL-1 form template: Failed to load PDF template from /pdf-templates/UPL-1/2023/UPL-1_2023.pdf: . Please ensure the official PDF file exists in the public folder at the correct path.
```

Despite the file existing at the correct location, the error persisted.

## Root Cause
The PDF file at `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` was **corrupted**:
- File size: 322KB (unusually large for a template)
- PDF version reported: 1.4
- **Critical issue**: 0 pages in the PDF
- Status: Invalid/corrupted PDF structure that `pdf-lib` could not load

## Solution
Regenerated all UPL-1 PDF templates using the existing generation script `scripts/generateUPL1Template.ts`.

### Steps Taken
1. Installed project dependencies: `npm install`
2. Installed `tsx` for TypeScript execution: `npm install --save-dev tsx`
3. Ran the generation script: `npx tsx scripts/generateUPL1Template.ts`
4. Verified the regenerated PDFs are valid

### Results
All four PDF copies were regenerated:
- `PDFFile/upl-1_06-08-2.pdf` - 322KB → 1.7KB
- `public/upl-1_06-08-2.pdf` - 322KB → 1.7KB
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` - 322KB → 1.7KB
- `upl-1_06-08-2.pdf` (root) - 322KB → 1.7KB

All copies are now:
- **Valid PDF 1.7 documents**
- **1,709 bytes (1.7KB) each**
- **Identical** (MD5: `eead6133bd87723ffa8b2919783922e2`)
- **Contain 1 page** with proper UPL-1 form structure

## Verification
✅ PDF loads correctly with `pdf-lib`  
✅ Project builds successfully (`npm run build`)  
✅ All file copies are valid and identical  
✅ Existing tests pass (`scripts/testUPL1Filler.ts`)  
✅ Integration test confirms end-to-end functionality  
✅ Build output includes valid PDF templates  

## Prevention
This issue has occurred multiple times. If it happens again:

```bash
# Navigate to project directory
cd /home/runner/work/Numera/Numera

# Install dependencies if not already installed
npm install

# Regenerate the template
npx tsx scripts/generateUPL1Template.ts

# Verify the fix
npx tsx scripts/testUPL1Filler.ts
```

## Technical Details

### The Generation Script (`scripts/generateUPL1Template.ts`)
- Uses `pdf-lib` to create a new PDF document
- Creates a blank A4 page (595 x 842 points)
- Embeds standard fonts (Helvetica, HelveticaBold)
- Draws UPL-1 form structure with labeled fields:
  - MOCODAWCA (Principal) section
  - PELNOMOCNIK (Attorney) section
  - ZAKRES PELNOMOCNICTWA (Scope) section
  - OKRES OBOWIAZYWANIA (Validity period)
  - Signature fields
- Saves to all four locations for compatibility

### The UPL1PdfFiller Class (`src/utils/upl1PdfFiller.ts`)
- Loads the template from the public folder using `fetch()`
- Falls back to alternative paths for backward compatibility
- Fills in client and employee data at specific coordinates
- Converts Polish characters to ASCII equivalents
- Returns the filled PDF as bytes or Blob

### Alternative Paths
The filler tries these paths in order:
1. Primary: `/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
2. Legacy: `/upl-1_06-08-2.pdf`

## Files Changed
- `package.json` - Added `tsx` as dev dependency
- `package-lock.json` - Updated with `tsx` installation
- `PDFFile/upl-1_06-08-2.pdf` - Regenerated template
- `public/upl-1_06-08-2.pdf` - Regenerated template
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` - Regenerated template
- `upl-1_06-08-2.pdf` - Regenerated template
- `docs/fixes/UPL1_PDF_FIX.md` - Updated MD5 hash and added recurrence note

## References
- Previous fix documentation: `docs/fixes/UPL1_PDF_FIX.md`
- Template documentation: `public/pdf-templates/UPL-1/2023/README.md`
- Generation script: `scripts/generateUPL1Template.ts`
- UPL1 PDF Filler: `src/utils/upl1PdfFiller.ts`
