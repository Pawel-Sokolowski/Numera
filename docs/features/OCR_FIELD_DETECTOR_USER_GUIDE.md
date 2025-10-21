# OCR Field Detector - User Guide

## Quick Start

The OCR Field Detector is a powerful tool that automatically detects form fields in PDF documents using optical character recognition (OCR) and image processing. This eliminates the need for manual coordinate mapping.

## Accessing the Tool

1. Log into the Numera application
2. Navigate to the sidebar menu
3. Click on **Ustawienia** (Settings)
4. Click on **Detektor Pól PDF** (PDF Field Detector)

## Step-by-Step Usage

### Step 1: Open the Field Detector

Click the "Open Field Detector" button on the main page. This will open the detection dialog.

### Step 2: Upload Your PDF

1. Click the file input or drag and drop a PDF file
2. The system accepts `.pdf` files only
3. Best results with:
   - Native digital PDFs (not scanned)
   - Clear text and form borders
   - Standard A4 size (595×842 points)

### Step 3: Enter Form Information

**Form Type**:

- Enter the official form name (e.g., UPL-1, PEL, ZAW-FA)
- This will be used in the mapping file name

**Form Version**:

- Enter the year or version (e.g., 2023, 2024)
- This helps track form changes over time

### Step 4: Detect Fields

Click the "Detect Fields" button. The system will:

- Render the PDF to image
- Detect rectangular field boxes
- Recognize text labels using OCR
- Match labels to fields
- Classify field types

**Processing Time**:

- Single page: 3-5 seconds
- Multi-page: 5-15 seconds
- Progress shown in real-time

### Step 5: Review Detection Results

Once complete, you'll see:

**Field List** - Each detected field shows:

- **Field Name**: Auto-generated (e.g., `principalName`, `data_urodzenia`)
- **Label**: The text label found near the field
- **Type Badge**:
  - 🔵 Text field (most common)
  - 🟢 Checkbox (small square boxes)
  - 🟣 Signature (large fields)
- **Coordinates**: `Page X | x: Y, y: Z | W×H`
- **Confidence Badge**:
  - 🟢 Green (≥80%): High quality, ready to use
  - 🟡 Yellow (60-79%): Good quality, quick review recommended
  - 🔴 Red (<60%): Low quality, manual review required
- **Match Strategy**: How the label was matched (above, left, inside, nearby)
- **Warnings**: Issues that need attention

**Quality Statistics**:

- Total fields detected
- High/Medium/Low confidence counts
- Average confidence percentage
- Detection metadata

### Step 6: Edit Fields (Optional)

For each field, you can:

**Edit Details**:

1. Click the edit icon (✏️)
2. Modify:
   - Field name
   - Label text
   - X, Y coordinates
   - Width, height
3. Click the checkmark (✓) to save

**Delete Fields**:

- Click the X icon to remove incorrect detections

**Why Edit?**

- Correct mismatched labels
- Adjust coordinates for better alignment
- Remove decorative elements detected as fields
- Rename fields for consistency

### Step 7: Export Mapping

Click "Download Mapping" to save the `mapping.json` file.

**Mapping File Contains**:

```json
{
  "version": "2023",
  "fields": {
    "principalName": {
      "pdfField": "principalName",
      "page": 1,
      "x": 150,
      "y": 720,
      "label": "Nazwa mocodawcy",
      "type": "text",
      "confidence": 0.92
    },
    ...
  },
  "metadata": {
    "generatedBy": "PdfFieldDetector",
    "generatedAt": "2025-01-20T10:00:00.000Z",
    "detectionStats": { ... }
  }
}
```

### Step 8: Use the Mapping

1. Save the mapping file to your form template directory
   - Example: `public/pdf-templates/UPL-1/mapping.json`
2. Use with existing form filling services
3. The system will now automatically fill fields at the detected coordinates

## Understanding Confidence Scores

### High Confidence (≥80%) 🟢

**Meaning**: Field detected with high certainty

- Clear rectangular border
- Strong label match nearby
- Good OCR text recognition
- Typical field dimensions

**Action**: Ready to use as-is

### Medium Confidence (60-79%) 🟡

**Meaning**: Good detection, minor uncertainty

- Slightly ambiguous label positioning
- Multiple fields near same label
- Less clear borders

**Action**: Quick visual review recommended

### Low Confidence (<60%) 🔴

**Meaning**: Detection may be incorrect

- Decorative lines detected as fields
- Poor OCR text quality
- No label found nearby
- Unusual field dimensions

**Action**: Manual review and adjustment required

## Field Type Recognition

### Text Fields 🔵

**Characteristics**:

- Medium to large rectangular boxes
- Width typically 100-400 pixels
- Height typically 15-40 pixels
- Associated with text labels

**Examples**:

- Name fields (Imię, Nazwisko)
- Address fields (Ulica, Miasto)
- ID numbers (PESEL, NIP)
- Dates (Data urodzenia)

### Checkboxes 🟢

**Characteristics**:

- Small square boxes
- Width and height < 35 pixels
- Aspect ratio close to 1:1
- Keywords: "tak", "nie", "yes", "no"

**Examples**:

- Yes/No selections
- Option checkboxes
- Consent indicators

### Signature Fields 🟣

**Characteristics**:

- Large rectangular areas
- Area > 8000 square pixels
- Wide aspect ratio (> 2:1)
- Keywords: "podpis", "signature", "pieczęć"

**Examples**:

- Signature areas
- Stamp areas
- Authorization signatures

## Match Strategies

The system uses multiple strategies to match text labels to field boxes:

### Above ⬆️

**Most Common**: Label positioned directly above the field

- Works for: Header-style labels
- Polish forms: Very common
- Confidence bonus: 30%

### Left ⬅️

**Common**: Label to the left of the field

- Works for: Row-style forms
- Table forms: Common
- Confidence bonus: 20%

### Inside 📦

**Special**: Label inside the field box

- Works for: Labeled checkboxes
- Pre-filled fields
- Confidence bonus: Based on OCR quality

### Table Header 📊

**Structured**: Label in table column header

- Works for: Grid/table layouts
- Multi-row forms
- Confidence bonus: Based on alignment

### Nearby 📍

**Fallback**: General proximity matching

- Works for: Complex layouts
- Non-standard positioning
- Confidence bonus: 15%

## Polish Field Recognition

The system recognizes common Polish form fields:

### Personal Information

- **Imię**: First name
- **Nazwisko**: Last name
- **PESEL**: Personal identification number
- **Data urodzenia**: Date of birth
- **Miejsce urodzenia**: Place of birth

### Address

- **Ulica**: Street
- **Miasto**: City
- **Kod pocztowy**: Postal code
- **Województwo**: Province

### Business

- **NIP**: Tax identification number
- **REGON**: Business registration number
- **Nazwa firmy**: Company name

### Dates

- **Data wystawienia**: Issue date
- **Data ważności**: Expiration date
- **Data rozpoczęcia**: Start date
- **Data zakończenia**: End date

## Troubleshooting

### Problem: No Fields Detected

**Possible Causes**:

- PDF is scanned image without clear borders
- Form fields too small (< 40×12 pixels)
- Very faint borders

**Solutions**:

1. Ensure PDF is high quality
2. Check that form has visible rectangular borders
3. Try a different version of the form
4. Manually add fields if automatic detection fails

### Problem: Wrong Labels Matched

**Possible Causes**:

- Complex form layout
- Multiple fields near same label
- Unusual label positioning

**Solutions**:

1. Use the edit function to correct labels
2. Check field coordinates and adjust if needed
3. Delete incorrect matches
4. Consider the form's structure (tables, sections)

### Problem: Low Confidence Scores

**Possible Causes**:

- Low-quality PDF scan
- Poor OCR text recognition
- Decorative elements detected as fields

**Solutions**:

1. Review all fields with confidence < 80%
2. Delete decorative elements
3. Manually correct field names and coordinates
4. Use higher quality PDF if available

### Problem: Missing Expected Fields

**Possible Causes**:

- Fields too small to detect
- No clear rectangular border
- Field is actually plain text area

**Solutions**:

1. Check if the field has a visible border
2. Manually measure coordinates if needed
3. Use visual debugging to see what was detected
4. Add missing fields manually to the mapping

## Best Practices

### For Best Detection Results

1. **Use Native PDFs**: Digital forms work better than scanned documents
2. **High Quality**: Clear text and borders improve accuracy
3. **Standard Layout**: A4 size with standard field dimensions
4. **Clean Forms**: Minimal decorative elements

### For Efficient Workflow

1. **Start with Detection**: Let the system detect most fields automatically
2. **Focus on Low Confidence**: Review fields with confidence < 80%
3. **Verify Critical Fields**: Double-check important fields (PESEL, NIP, signatures)
4. **Save Incrementally**: Export mapping after major corrections
5. **Test Before Use**: Test with sample data before production use

### For Maintenance

1. **Version Control**: Keep mappings in source control
2. **Document Changes**: Note why manual adjustments were made
3. **Regular Updates**: Re-run detection when forms change
4. **Backup Mappings**: Keep backup of working mappings

## Advanced Features

### Debug Visualization

When developing or troubleshooting, the system can generate debug overlays showing:

- Detected rectangles (blue)
- Text positions (green)
- Matched fields (red)
- Confidence scores
- Field names

_Note: This feature is available programmatically for developers._

### Batch Processing

While the UI handles one PDF at a time, the API supports batch processing:

```typescript
// Process multiple PDFs
for (const pdf of pdfFiles) {
  const result = await detector.detectFields(pdf);
  const mapping = detector.generateMapping(result);
  // Save each mapping
}
```

### Custom Configuration

Developers can adjust detection parameters in the source code:

- Edge detection threshold
- Minimum field dimensions
- OCR confidence threshold
- Spatial matching weights

See `AUTOMATED_FIELD_DETECTION_README.md` for configuration details.

## Tips & Tricks

### Naming Conventions

The system auto-generates field names from labels. For consistency:

- Polish characters are transliterated (ą→a, ł→l)
- Spaces become underscores
- Special characters are removed

**Examples**:

- "Imię i nazwisko" → `imie_i_nazwisko`
- "Data urodzenia" → `data_urodzenia`
- "NIP" → `nip`

### Date Field Recognition

The system recognizes various date types:

- `data_urodzenia`: Birth date
- `data_wystawienia`: Issue date
- `data_waznosci`: Expiration date
- `data_rozpoczecia`: Start date
- `data_zakonczenia`: End date

This helps with date formatting in form filling.

### Table Forms

For forms with table layouts:

- Fields are detected in rows and columns
- Headers are matched to column fields
- Structure analysis improves matching

### Multi-Page Forms

The system processes all pages:

- Page number is recorded for each field
- Coordinates are page-relative
- Fields from all pages appear in one mapping

## Support & Resources

### Documentation

- Main README: `AUTOMATED_FIELD_DETECTION_README.md`
- Technical Guide: `docs/features/OCR_FIELD_DETECTION_UPGRADE.md`
- Test Script: `scripts/test-field-detection.js`

### Getting Help

If you encounter issues:

1. Check this user guide
2. Review detection statistics and warnings
3. Try with a different PDF version
4. Contact support with:
   - PDF form (if possible to share)
   - Detection results screenshot
   - Description of the issue

### Known Limitations

- Works best with native digital PDFs
- Requires clear rectangular borders around fields
- Polish language optimized (other languages may work but with lower accuracy)
- Handwritten forms not supported
- Minimum field size: 40×12 pixels

### Future Improvements

Planned enhancements:

- Support for more languages
- Machine learning for form-specific detection
- Improved handwriting recognition
- Mobile app support
- Cloud-based processing

---

**Last Updated**: 2025-01-20  
**Version**: 1.1.0  
**Questions?** Check the main documentation or contact the development team.
