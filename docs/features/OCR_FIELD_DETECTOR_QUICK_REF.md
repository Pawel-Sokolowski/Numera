# OCR Field Detector - Quick Reference

## Navigation

**Menu Path**: Ustawienia → Detektor Pól PDF

## Basic Workflow

1. Upload PDF → 2. Enter form info → 3. Detect → 4. Review → 5. Edit if needed → 6. Export

## Confidence Levels

- 🟢 **High (≥80%)**: Ready to use
- 🟡 **Medium (60-79%)**: Quick review
- 🔴 **Low (<60%)**: Manual check required

## Field Types

- 🔵 **Text**: Regular input fields
- 🟢 **Checkbox**: Small square boxes
- 🟣 **Signature**: Large signature areas

## Match Strategies

- ⬆️ **Above**: Label above field (most common)
- ⬅️ **Left**: Label to the left
- 📦 **Inside**: Label inside field
- 📊 **Table Header**: Column header
- 📍 **Nearby**: General proximity

## Processing Time

- **Single page**: 3-5 seconds
- **Multi-page**: 5-15 seconds
- **Large forms**: 20-40 seconds

## Polish Fields Auto-Recognized

- **PESEL**: Personal ID
- **NIP**: Tax ID
- **REGON**: Business ID
- **Województwo**: Province
- **Data urodzenia**: Birth date
- **Data wystawienia**: Issue date
- **Imię/Nazwisko**: First/Last name

## Editing Actions

- **✏️ Edit**: Modify name, label, coordinates
- **✓ Save**: Confirm changes
- **✗ Delete**: Remove field

## Export Format

```json
{
  "version": "2023",
  "fields": {
    "fieldName": {
      "page": 1,
      "x": 150,
      "y": 720,
      "type": "text"
    }
  }
}
```

## Best Practices

✅ Use native digital PDFs  
✅ Review fields with confidence < 80%  
✅ Verify critical fields (PESEL, NIP)  
✅ Test mapping with sample data  
✅ Version control mappings

## Common Issues

### No fields detected

- Check PDF has clear borders
- Ensure minimum field size (40×12 pixels)

### Wrong labels

- Use edit function to correct
- Delete incorrect matches

### Low confidence

- Review all red-badged fields
- Delete decorative elements
- Manually adjust coordinates

## Keyboard Shortcuts

_Note: Shortcuts not currently implemented - use mouse/touch_

## Supported Forms

- UPL-1, UPL-1P (Authorization)
- PEL (Special authorization)
- ZAW-FA (Change notification)
- PIT-37, PIT-R (Tax returns)
- Custom A4 forms with clear borders

## Technical Limits

- **Min field size**: 40×12 pixels
- **Max distance**: 200 pixels (label to field)
- **OCR confidence min**: 30%
- **Supported size**: A4 (595×842 points)

## Detection Algorithm Steps

1. PDF → Canvas (2x scale)
2. Edge detection (Sobel operator)
3. Morphological operations
4. Rectangle detection
5. OCR preprocessing
6. Text recognition (Polish)
7. Structure analysis
8. Spatial matching
9. Field classification

## Programmatic Usage

```typescript
import { PdfFieldDetector } from './utils/pdfFieldDetector';

const detector = new PdfFieldDetector();
const result = await detector.detectFields(pdfArrayBuffer);
const mapping = detector.generateMapping(result, '2023');
```

## API Methods

- `detectFields(pdfFile)`: Detect all fields
- `generateMapping(result, version)`: Create mapping
- `detectFieldsFromUrl(url)`: Detect from URL
- `createDebugVisualization()`: Debug overlay

## Quality Statistics

- **Total fields**: Number of detected fields
- **Confidence breakdown**: High/Medium/Low counts
- **Average confidence**: Overall quality score
- **Rectangles detected**: Total boxes found
- **Texts detected**: Total text labels found

## File Locations

- **Core Engine**: `src/utils/pdfFieldDetector.ts`
- **UI Dialog**: `src/components/PdfFieldDetectorDialog.tsx`
- **Demo Page**: `src/components/FormFieldDetectorExample.tsx`
- **Documentation**: `AUTOMATED_FIELD_DETECTION_README.md`

## Need Help?

1. Check User Guide: `docs/features/OCR_FIELD_DETECTOR_USER_GUIDE.md`
2. Check Main Docs: `AUTOMATED_FIELD_DETECTION_README.md`
3. Run test: `node scripts/test-field-detection.js`
4. Contact support with screenshots

## Version

**Current**: 1.1.0 (2025-01-20)

---

**Print this card for quick reference while using the OCR Field Detector!**
