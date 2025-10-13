# UPL-1 PDF Fix - October 2025

## Problem
The error message was:
```
Błąd podczas generowania dokumentu: Failed to fill UPL-1 form template: 
Failed to load PDF template from /pdf-templates/UPL-1/2023/UPL-1_2023.pdf
```

However, investigation revealed the issue was in the PDFFile folder, not the public folder.

## Root Cause
The PDFFile folder contained a **corrupted** UPL-1 PDF:
- File: `PDFFile/upl-1_06-08-2.pdf`
- Size: 322KB
- Status: 0 pages (invalid PDF structure)

## Solution
Copied the **working** UPL-1 PDF from the public folder to all locations:

```bash
# The working source file
cp public/upl-1_06-08-2.pdf PDFFile/upl-1_06-08-2.pdf
cp public/upl-1_06-08-2.pdf upl-1_06-08-2.pdf
```

## Verification
All UPL-1 files are now **identical and valid**:

| Location | Size | Format | MD5 Hash |
|----------|------|--------|----------|
| `public/upl-1_06-08-2.pdf` | 1.7KB | PDF 1.7 | `4c547677cc6bb1893e2449198ab65e71` |
| `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf` | 1.7KB | PDF 1.7 | `4c547677cc6bb1893e2449198ab65e71` |
| `PDFFile/upl-1_06-08-2.pdf` | 1.7KB | PDF 1.7 | `4c547677cc6bb1893e2449198ab65e71` |
| `upl-1_06-08-2.pdf` (root) | 1.7KB | PDF 1.7 | `4c547677cc6bb1893e2449198ab65e71` |

✅ **All tests pass**
✅ **Build succeeds**
✅ **UPL-1 form generation works**

## Key Insight
**The authoritative source is `public/upl-1_06-08-2.pdf`, NOT PDFFile!**

Previous documentation incorrectly stated that PDFFile was the source. This has been corrected.

## For Future Reference
If UPL-1 corruption occurs again:
1. The **working file** is: `public/upl-1_06-08-2.pdf` (1.7KB, PDF 1.7)
2. Copy **FROM** public **TO** other locations
3. Verify with: `md5sum public/upl-1_06-08-2.pdf [target-file]`
4. Expected MD5: `4c547677cc6bb1893e2449198ab65e71`

## Files Modified in This Fix
1. `PDFFile/upl-1_06-08-2.pdf` - Fixed (322KB corrupted → 1.7KB valid)
2. `upl-1_06-08-2.pdf` - Created (new 1.7KB valid file in root)
3. `FIX_SUMMARY.md` - Updated documentation
4. `docs/fixes/UPL1_PDF_FIX.md` - Updated documentation
