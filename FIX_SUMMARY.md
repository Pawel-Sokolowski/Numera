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
Copied the working UPL-1 PDF template from `PDFFile/upl-1_06-08-2.pdf` to all required locations.

### Steps Taken
1. Identified that `PDFFile/upl-1_06-08-2.pdf` contained a valid working template (1.7KB, 1 page)
2. The public folder locations had corrupted 322KB files with 0 pages
3. Copied the working template from PDFFile to all locations
4. Verified the copied PDFs are valid

### Results
All corrupted PDF copies were replaced with the working template from PDFFile:
- `public/upl-1_06-08-2.pdf` - 322KB corrupted → 1.7KB valid (copied from PDFFile)
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` - 322KB corrupted → 1.7KB valid (copied from PDFFile)
- `upl-1_06-08-2.pdf` (root) - unchanged (already valid)
- `PDFFile/upl-1_06-08-2.pdf` - unchanged (source file, already valid)

All copies are now:
- **Valid PDF 1.7 documents**
- **1,708 bytes (1.7KB) each**
- **Identical to the PDFFile source** (MD5: `4c547677cc6bb1893e2449198ab65e71`)
- **Contain 1 page** with proper UPL-1 form structure

## Verification
✅ PDF loads correctly with `pdf-lib`  
✅ Project builds successfully (`npm run build`)  
✅ All file copies are valid and identical  
✅ Existing tests pass (`scripts/testUPL1Filler.ts`)  
✅ Integration test confirms end-to-end functionality  
✅ Build output includes valid PDF templates  

## Prevention
This issue has occurred multiple times. If it happens again, copy the working template from PDFFile:

```bash
# Navigate to project directory
cd /home/runner/work/Numera/Numera

# Copy the working template from PDFFile to all locations
cp PDFFile/upl-1_06-08-2.pdf public/upl-1_06-08-2.pdf
cp PDFFile/upl-1_06-08-2.pdf public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
cp PDFFile/upl-1_06-08-2.pdf upl-1_06-08-2.pdf

# Verify the files
file public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
```

## Technical Details

### The Source File
- **Location**: `PDFFile/upl-1_06-08-2.pdf`
- **Purpose**: Official working UPL-1 template that serves as the authoritative source
- **Should not be modified**: Treat this as read-only; copy from it, don't regenerate it

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

All public locations should be copies of `PDFFile/upl-1_06-08-2.pdf`.

## Files Changed
- `public/upl-1_06-08-2.pdf` - Copied from PDFFile (replaced corrupted 322KB with working 1.7KB)
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` - Copied from PDFFile (replaced corrupted 322KB with working 1.7KB)
- `upl-1_06-08-2.pdf` - No change (already valid)
- `PDFFile/upl-1_06-08-2.pdf` - No change (source file, already valid)
- `docs/fixes/UPL1_PDF_FIX.md` - Updated to reflect copy approach instead of regeneration
- `public/pdf-templates/UPL-1/2023/README.md` - Updated to reference PDFFile as source

## References
- Previous fix documentation: `docs/fixes/UPL1_PDF_FIX.md`
- Template documentation: `public/pdf-templates/UPL-1/2023/README.md`
- Generation script: `scripts/generateUPL1Template.ts`
- UPL1 PDF Filler: `src/utils/upl1PdfFiller.ts`
