# UPL-1 PDF Form Filling - Coordinate Guide

## Overview

The UPL-1 form is filled using pdf-lib by drawing text at specific coordinates on the official PDF template. This guide explains how to adjust coordinates for optimal form filling.

## PDF Coordinate System

- Origin (0,0) is at the **bottom-left** corner
- X increases to the right
- Y increases upward
- UPL-1 form is A4 size: **595 x 842 points**

## Current Coordinate Mapping

The coordinates are defined in `src/utils/upl1PdfFiller.ts` in the `UPL1_FIELD_COORDINATES` object.

### Principal (Mocodawca) Section

Located in the upper portion of the form (y: 620-720):

```typescript
principalName: { x: 150, y: 720 },      // Full name
principalNIP: { x: 150, y: 695 },       // Tax ID
principalREGON: { x: 150, y: 670 },     // Business registry number
principalAddress: { x: 150, y: 645 },   // Street address
principalCity: { x: 150, y: 620 },      // Postal code and city
```

### Attorney (Pełnomocnik) Section

Located in the middle portion (y: 485-560):

```typescript
attorneyName: { x: 150, y: 560 },       // Attorney full name
attorneyPESEL: { x: 150, y: 535 },      // Personal ID number
attorneyAddress: { x: 150, y: 510 },    // Street address
attorneyCity: { x: 150, y: 485 },       // Postal code and city
```

### Scope of Authorization Section

Located in the middle-lower portion (y: 320-420):

```typescript
scope1: { x: 50, y: 420 },              // First scope item
scope2: { x: 50, y: 400 },              // Second scope item
scope3: { x: 50, y: 380 },              // Third scope item
scope4: { x: 50, y: 360 },              // Fourth scope item
scope5: { x: 50, y: 340 },              // Fifth scope item
scope6: { x: 50, y: 320 },              // Sixth scope item
```

### Dates and Validity Period

Located in the lower portion (y: 180-270):

```typescript
startDate: { x: 150, y: 270 },          // Authorization start date
endDate: { x: 350, y: 270 },            // Authorization end date
issueDate: { x: 150, y: 180 },          // Document issue date
issuePlace: { x: 350, y: 180 },         // Issue location
```

### Signatures

Located at the bottom (y: 100):

```typescript
principalSignature: { x: 100, y: 100 }, // Principal signature line
attorneySignature: { x: 400, y: 100 },  // Attorney signature line
```

## Adjusting Coordinates

### Method 1: Visual Inspection

1. Generate a test PDF with the current coordinates
2. Open the PDF and compare with blank form
3. Measure offset needed
4. Update coordinates in `src/utils/upl1PdfFiller.ts`

### Method 2: Grid Overlay Tool

Use the provided grid overlay script to create a reference PDF:

```bash
node /tmp/analyze-pdf-structure.js
```

This creates a PDF with coordinate grid overlay showing:
- Grid lines every 50 points
- Coordinate labels every 100 points
- Helps identify exact positions of form fields

### Method 3: Test Fill Script

Run the test fill script to generate a sample filled PDF:

```bash
node /tmp/test-upl1-filler.js
```

This generates `/tmp/upl-1-filled-test.pdf` with:
- Sample data in BLUE color (for visibility)
- All coordinate positions labeled
- Easy comparison with blank form

## Font and Text Sizing

### Current Settings

- **Font**: Helvetica (StandardFonts.Helvetica)
- **Size**: 10pt for most fields, 9pt for scope items
- **Color**: Black (rgb(0, 0, 0))

### Polish Character Support

StandardFonts.Helvetica has limited Polish character support. For full diacritics support:

1. Embed a custom font (e.g., Liberation Sans, Noto Sans)
2. Update the font embedding in `upl1PdfFiller.ts`

Example:
```typescript
// Instead of:
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

// Use custom font with Polish characters:
const fontBytes = await fetch('/fonts/NotoSans-Regular.ttf').then(r => r.arrayBuffer());
const font = await pdfDoc.embedFont(fontBytes);
```

## Testing Changes

After adjusting coordinates:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Test in development**:
   ```bash
   npm run dev
   ```

3. **Generate a test form** using the UI:
   - Go to Authorization Forms dialog
   - Select UPL-1 form type
   - Fill client and employee data
   - Generate and download

4. **Compare output** with official blank UPL-1 form

## Common Issues

### Text Not Appearing

- Check if coordinates are within page bounds (0-595 x, 0-842 y)
- Verify font is properly embedded
- Check if text color is visible (not white)

### Text Misaligned

- Measure exact offset from expected position
- Adjust corresponding coordinate in `UPL1_FIELD_COORDINATES`
- Remember: Y coordinates are from bottom, not top

### Polish Characters Displaying Incorrectly

- Embed a font with full Polish character support
- Use the `sanitizeText()` method to clean special characters
- Consider using Unicode-compatible fonts

## Coordinate Fine-Tuning Tips

1. **Start with one field**: Adjust principal name first as a reference
2. **Use increments of 5-10 points**: Small adjustments for precision
3. **Check both pages**: If form spans multiple pages
4. **Test with long text**: Ensure text doesn't overflow field boundaries
5. **Document changes**: Add comments explaining why specific coordinates were chosen

## Future Enhancements

Possible improvements to consider:

1. **Dynamic coordinate detection**: OCR-based field detection
2. **Multiple form versions**: Support different UPL-1 form revisions
3. **Coordinate configuration**: External JSON file for easy updates
4. **Visual coordinate editor**: Web-based tool for adjusting positions
5. **Field validation**: Check text length before rendering
6. **Multi-page support**: Handle forms spanning multiple pages
7. **Advanced font support**: Embed fonts with full Polish support

## Support

For issues with coordinate adjustment:

1. Check the test output in `/tmp/upl-1-filled-test.pdf`
2. Compare with grid overlay in `/tmp/upl-1-with-grid.pdf`
3. Review console logs for any errors
4. Verify PDF template is correctly loaded from `/public/upl-1_06-08-2.pdf`
