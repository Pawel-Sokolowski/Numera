# UPL-1 PDF Fix - "Failed to load PDF pełnomocnictwo"

## Issue
The UPL-1 (Pełnomocnictwo do Urzędu Skarbowego) PDF files were corrupted, causing the error "failed to load pdf pełnomocnictwo" when attempting to generate authorization forms.

### Root Cause
All UPL-1 PDF files in the repository were corrupted:
- File showed as "PDF document, version 1.4, **0 page(s)**"
- The `file` utility reported valid PDF headers but no pages
- PDF loading with pdf-lib would fail or produce empty documents

Affected files:
- `PDFFile/upl-1_06-08-2.pdf`
- `public/upl-1_06-08-2.pdf` 
- `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
- Root `upl-1_06-08-2.pdf`

## Solution
Created a valid UPL-1 PDF template programmatically using pdf-lib with the correct form structure.

### Implementation

#### 1. Generated Valid PDF Template
Created `scripts/generateUPL1Template.ts` that:
- Generates a proper A4-sized PDF (595 x 842 points)
- Includes all required form sections:
  - **MOCODAWCA** (Principal) - with fields for name, NIP, REGON, address
  - **PEŁNOMOCNIK** (Attorney) - with fields for name, PESEL, address
  - **ZAKRES PEŁNOMOCNICTWA** (Scope of Authority) - 6 lines
  - **OKRES OBOWIĄZYWANIA** (Validity Period) - start/end dates
  - Date and place of issuance
  - Signature lines for both parties
- Uses Standard Helvetica fonts (ascii-safe characters)
- Properly formatted with pdf-lib (version 1.7)

#### 2. Replaced Corrupted Files
Script replaces all 4 corrupted PDF files with the valid generated template.

#### 3. Verified Functionality
Created `scripts/testFormFilling.ts` to verify:
- PDF loads successfully with pdf-lib
- Form fields can be filled programmatically
- Generated PDFs are valid and readable

### Results
- ✅ Valid PDF generated (version 1.7, 1 page, 1.7KB)
- ✅ PDF loads successfully in pdf-lib
- ✅ Form filling works correctly
- ✅ Built application includes valid PDFs
- ✅ Test output shows filled PDF at 2.5KB

## Usage

### Generate New Template
```bash
npx tsx scripts/generateUPL1Template.ts
```

This will replace all UPL-1 PDF files with a fresh generated template.

### Test Form Filling
```bash
npx tsx scripts/testFormFilling.ts
```

This will:
1. Load the UPL-1 template
2. Fill it with test data
3. Save to `test-output-upl1.pdf`
4. Report success/failure

### Test PDF Loading
```bash
npx tsx scripts/testUPL1Filler.ts
```

This verifies that pdf-lib can successfully load the template.

## Technical Details

### PDF Structure
- **Format**: PDF 1.7
- **Page Size**: A4 (595 x 842 points)
- **Font**: Helvetica / Helvetica-Bold (StandardFonts)
- **Color**: Black (RGB 0,0,0)

### Coordinate System
The form uses PDF coordinate system with origin (0,0) at bottom-left:
- Mocodawca section: y ≈ 720-620
- Pełnomocnik section: y ≈ 560-485
- Scope section: y ≈ 420-320
- Period section: y ≈ 270
- Date/signatures: y ≈ 180-100

### Files Modified
1. **PDF Files** (Binary)
   - `PDFFile/upl-1_06-08-2.pdf`
   - `public/upl-1_06-08-2.pdf`
   - `public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
   - `upl-1_06-08-2.pdf`

2. **Scripts** (New)
   - `scripts/generateUPL1Template.ts` - Generator script
   - `scripts/testUPL1Filler.ts` - PDF loading test
   - `scripts/testFormFilling.ts` - Form filling test

3. **Configuration**
   - `.gitignore` - Added test output files

## Verification Steps

1. **Check PDF validity**:
   ```bash
   file public/upl-1_06-08-2.pdf
   # Should show: PDF document, version 1.7
   ```

2. **Build application**:
   ```bash
   npm run build
   file build/upl-1_06-08-2.pdf
   # Should show valid PDF in build output
   ```

3. **Run tests**:
   ```bash
   npx tsx scripts/testUPL1Filler.ts
   npx tsx scripts/testFormFilling.ts
   # Both should report success
   ```

## Notes

- The generated PDF uses ASCII-safe characters (without Polish diacritics in form labels)
- The `UPL1PdfFiller` class handles Polish character sanitization when filling forms
- The template is a blank form; actual form filling happens at runtime via `UPL1PdfFiller.fillForm()`
- All PDF files are identical (same MD5 hash) across all locations for consistency

## Related Files
- `src/utils/upl1PdfFiller.ts` - Main UPL-1 form filler class
- `src/utils/authorizationFormGenerator.ts` - Uses UPL1PdfFiller
- `public/pdf-templates/UPL-1/2023/README.md` - Template documentation
