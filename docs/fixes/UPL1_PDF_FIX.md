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

**Note:** This issue has occurred multiple times. The PDF file gets corrupted during development or deployment, requiring regeneration.

## Solution
Copied the working UPL-1 PDF template from `PDFFile/upl-1_06-08-2.pdf` to all required locations.

### Steps Taken:
1. Identified that `PDFFile/upl-1_06-08-2.pdf` contained a valid working template
2. Copied this file to all required locations:
   - `public/upl-1_06-08-2.pdf`
   - `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
   - `upl-1_06-08-2.pdf` (root)
3. Verified the PDF:
   - File size: 1,708 bytes (1.7KB)
   - Format: Valid PDF 1.7 document
   - Contains proper form structure

### Files Changed:
- `public/upl-1_06-08-2.pdf` - Copied from PDFFile (was 329KB corrupted → now 1.7KB valid)
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` - Copied from PDFFile (was 329KB corrupted → now 1.7KB valid)
- `upl-1_06-08-2.pdf` - Copied from PDFFile (unchanged, 1.7KB valid)
- `public/pdf-templates/UPL-1/2023/README.md` - Updated with source information

All four copies are now identical to the original working file from PDFFile (MD5: `4c547677cc6bb1893e2449198ab65e71`).

## Verification
- ✅ PDF loads correctly with `pdf-lib`
- ✅ Project builds successfully (`npm run build`)
- ✅ All file copies are valid and identical
- ✅ Documentation updated with regeneration instructions

## Prevention
If this issue occurs again in the future, copy the working template from PDFFile:
```bash
cp PDFFile/upl-1_06-08-2.pdf public/upl-1_06-08-2.pdf
cp PDFFile/upl-1_06-08-2.pdf public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
cp PDFFile/upl-1_06-08-2.pdf upl-1_06-08-2.pdf
```

The PDFFile folder contains the official working templates that should be used as the source.

## Technical Details
The `UPL1PdfFiller` class:
- Loads the template from the public folder using multiple fallback paths
- Fills in client and employee data at specific coordinates
- Draws text using `pdf-lib`
- Returns the filled PDF as bytes/blob

The official template source:
- Location: `PDFFile/upl-1_06-08-2.pdf`
- This file should be treated as the authoritative source
- Other locations are copies for application use
