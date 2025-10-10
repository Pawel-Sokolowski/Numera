# UPL-1 PDF Template Fix

## Problem
The application was failing with the error:
```
Błąd podczas generowania dokumentu: Failed to load PDF template from /pdf-templates/UPL-1/2023/UPL-1_2023.pdf: . Please ensure the PDF file exists in the public folder.
```

## Root Cause
The PDF file at `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` existed but was corrupted:
- File size: 329,597 bytes (329KB)
- Pages: 0 (empty PDF)
- Status: Invalid/corrupted PDF structure

This caused `pdf-lib` to fail when trying to load and fill the template.

## Solution
Regenerated the UPL-1 PDF template using the existing script `scripts/generateUPL1Template.ts`.

### Steps Taken:
1. Installed project dependencies: `npm install`
2. Ran the generation script: `npx tsx scripts/generateUPL1Template.ts`
3. Verified the new PDF:
   - File size: 1,708 bytes (1.7KB)
   - Format: Valid PDF 1.7 document
   - Contains proper form structure
4. Updated documentation in `public/pdf-templates/UPL-1/2023/README.md`

### Files Changed:
- `PDFFile/upl-1_06-08-2.pdf` - Regenerated (329KB → 1.7KB)
- `public/upl-1_06-08-2.pdf` - Regenerated (329KB → 1.7KB)
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` - Regenerated (329KB → 1.7KB)
- `upl-1_06-08-2.pdf` - Regenerated (329KB → 1.7KB)
- `public/pdf-templates/UPL-1/2023/README.md` - Added regeneration instructions

All four copies are now identical (MD5: `4c547677cc6bb1893e2449198ab65e71`).

## Verification
- ✅ PDF loads correctly with `pdf-lib`
- ✅ Project builds successfully (`npm run build`)
- ✅ All file copies are valid and identical
- ✅ Documentation updated with regeneration instructions

## Prevention
If this issue occurs again in the future, regenerate the template by running:
```bash
npx tsx scripts/generateUPL1Template.ts
```

This script creates a blank UPL-1 form with all necessary fields and saves it to all required locations.

## Technical Details
The `generateUPL1Template.ts` script:
- Uses `pdf-lib` to create a new PDF document
- Adds a blank A4 page (595 x 842 points)
- Embeds standard fonts (Helvetica, HelveticaBold)
- Draws form structure with labeled fields
- Saves to multiple locations for compatibility

The `UPL1PdfFiller` class then:
- Loads the template from the public folder
- Fills in client and employee data
- Draws text at specific coordinates
- Returns the filled PDF as bytes/blob
