# Automated Form Field Detection

## Overview

The Automated Form Field Detection system uses OCR (Optical Character Recognition) and image processing to automatically detect form fields in PDF documents, eliminating the need for manual coordinate mapping.

## Features

### Core Capabilities

1. **Automatic Field Detection**
   - Detects rectangles/boxes in PDF forms
   - Uses OCR to identify field labels
   - Matches labels to boxes to determine field purpose
   - Generates field mappings automatically

2. **Smart Field Recognition**
   - Recognizes field types (text, checkbox, signature)
   - Identifies Polish form conventions (PESEL, NIP, REGON, etc.)
   - Generates semantic field names from labels
   - Provides confidence scores for each detection

3. **Visual Editor**
   - Review detected fields
   - Manually adjust coordinates
   - Edit field names and labels
   - Delete incorrect detections
   - Real-time preview of changes

4. **Mapping Generation**
   - Generates mapping.json files automatically
   - Compatible with existing TaxFormService
   - Includes metadata (confidence, page size, etc.)
   - Supports versioning

## Architecture

### Components

1. **PdfFieldDetector** (`src/utils/pdfFieldDetector.ts`)
   - Core detection engine
   - Uses pdf.js for PDF rendering
   - Uses Tesseract.js for OCR
   - Implements image processing algorithms

2. **FormFieldService** (`src/utils/formFieldService.ts`)
   - High-level service for field detection
   - Validation and merging utilities
   - Batch processing support
   - Import/export functionality

3. **PdfFieldDetectorDialog** (`src/components/PdfFieldDetectorDialog.tsx`)
   - React UI component
   - File upload interface
   - Visual field editor
   - Mapping export

### Technologies

- **pdf.js**: Renders PDF pages as images
- **Tesseract.js**: OCR engine for text detection
- **Canvas API**: Image processing and analysis
- **React**: UI components
- **TypeScript**: Type-safe implementation

## Usage

### Basic Usage

```typescript
import { PdfFieldDetector } from './utils/pdfFieldDetector';

// Create detector instance
const detector = new PdfFieldDetector();

// Detect fields from PDF
const pdfFile = /* PDF as ArrayBuffer or Uint8Array */;
const result = await detector.detectFields(pdfFile);

// Generate mapping
const mapping = detector.generateMapping(result, '2023');

// Save to file
const blob = new Blob([JSON.stringify(mapping, null, 2)], 
  { type: 'application/json' });
```

### Using the Service

```typescript
import { FormFieldService } from './utils/formFieldService';

const service = new FormFieldService();

// Detect and generate mapping
const { mapping, metadata } = await service.detectAndGenerateMapping(
  pdfFile,
  'UPL-1',
  '2023'
);

console.log(`Detected ${metadata.fieldCount} fields`);
console.log(`Average confidence: ${(metadata.confidence * 100).toFixed(1)}%`);
```

### Using the UI Component

```tsx
import { PdfFieldDetectorDialog } from './components/PdfFieldDetectorDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Detect Form Fields
      </Button>
      <PdfFieldDetectorDialog 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}
```

## Detection Process

### Step 1: PDF Rendering

1. Load PDF using pdf.js
2. Render each page to canvas at 2x scale
3. Extract image data for processing

### Step 2: Rectangle Detection

1. Convert image to grayscale
2. Apply edge detection (Sobel-like algorithm)
3. Find horizontal and vertical lines
4. Detect rectangular regions
5. Filter by size (min/max dimensions)

### Step 3: OCR Text Detection

1. Run Tesseract.js on each page
2. Extract words with coordinates
3. Filter by confidence threshold (>50%)
4. Store text positions and content

### Step 4: Field Matching

1. For each rectangle:
   - Find nearest text (above or left)
   - Calculate distance threshold (100px)
   - Match label to field
2. Generate field name from label
3. Determine field type (text/checkbox/signature)
4. Convert coordinates to PDF system (from bottom)

### Step 5: Mapping Generation

1. Create mapping.json structure
2. Include field coordinates and metadata
3. Add confidence scores
4. Include page information

## Field Types

### Text Fields
- Standard input fields
- Detected by size and label
- Most common field type

### Checkboxes
- Small square boxes (<30×30 pixels)
- Nearly equal width and height
- Often multiple per page

### Signatures
- Large boxes (>5000 pixels²)
- Label contains "podpis"
- Special handling required

## Configuration

### Detection Parameters

```typescript
// In pdfFieldDetector.ts
const minWidth = 50;      // Minimum field width
const minHeight = 15;     // Minimum field height
const maxWidth = width * 0.8;  // Max 80% page width
const maxHeight = 100;    // Maximum field height
const maxDistance = 100;  // Max label-field distance
```

### OCR Settings

```typescript
// Tesseract configuration
{
  logger: m => console.log(m),
  lang: 'pol',  // Polish language
}
```

## Validation

### Coordinate Validation

```typescript
const { valid, errors } = await service.validateMapping(
  pdfFile,
  mapping
);

if (!valid) {
  console.error('Mapping validation errors:', errors);
}
```

### Common Issues

- **Coordinates outside page bounds**: Adjust x/y values
- **Overlapping fields**: Review and delete duplicates
- **Low confidence**: Manual review recommended
- **Missing labels**: Text too small or unclear

## Best Practices

### For Best Detection Results

1. **PDF Quality**
   - Use high-resolution PDFs
   - Ensure forms have clear borders
   - Avoid scanned documents with poor quality

2. **Form Structure**
   - Forms with visible rectangles work best
   - Labels should be near fields
   - Consistent formatting helps

3. **Post-Detection Review**
   - Always review detected fields
   - Adjust coordinates as needed
   - Verify field names are semantic
   - Check confidence scores

4. **Iterative Refinement**
   - Start with automatic detection
   - Manually adjust problem areas
   - Test generated mapping
   - Re-detect if form updates

### Field Naming Conventions

Follow these conventions for field names:

- Use camelCase (e.g., `firstName`, `taxOffice`)
- Be descriptive (e.g., `principalName` not `name1`)
- Match Polish conventions:
  - `pesel` for PESEL numbers
  - `nip` for NIP numbers
  - `regon` for REGON numbers
  - `principal*` for mocodawca
  - `attorney*` for pełnomocnik

## Integration with Existing System

### TaxFormService Compatibility

Generated mappings are fully compatible with `TaxFormService`:

```typescript
import { TaxFormService } from './utils/taxFormService';

const taxFormService = new TaxFormService();

// Use auto-generated mapping
const pdfBytes = await taxFormService.fillForm(
  'UPL-1',
  '2023',
  formData
);
```

### Updating Existing Mappings

```typescript
// Load existing mapping
const existingMapping = await taxFormService.loadMappings('UPL-1');

// Detect new fields
const detection = await detector.detectFields(pdfFile);

// Merge with existing
const merged = service.mergeWithExistingMapping(
  detection,
  existingMapping,
  { onlyAddNew: true }  // Don't overwrite manual adjustments
);
```

## Performance

### Benchmarks

- **PDF Loading**: ~100-200ms
- **Page Rendering**: ~500ms per page
- **OCR Processing**: ~2-5s per page
- **Rectangle Detection**: ~200-500ms per page
- **Total (1-page form)**: ~3-6 seconds

### Optimization Tips

1. **Scale Factor**: Default 2x is good balance
2. **Parallel Processing**: Process pages in parallel (future)
3. **Caching**: Cache OCR results for repeated detection
4. **Selective OCR**: Only OCR regions with text

## Troubleshooting

### Detection Issues

**Problem**: No fields detected
- **Solution**: Check PDF has visible rectangles, try adjusting threshold parameters

**Problem**: Too many false positives
- **Solution**: Increase minimum field size, adjust edge detection threshold

**Problem**: Labels not matching fields
- **Solution**: Adjust max distance parameter, review OCR results

**Problem**: Low confidence scores
- **Solution**: Use higher resolution PDF, improve OCR language settings

### OCR Issues

**Problem**: Polish characters not recognized
- **Solution**: Ensure 'pol' language is loaded, update Tesseract.js

**Problem**: OCR too slow
- **Solution**: Reduce PDF scale, process fewer pages, use progressive loading

**Problem**: Text position incorrect
- **Solution**: Verify canvas scaling, check coordinate conversion

## Future Enhancements

### Planned Features

1. **Advanced Detection**
   - Machine learning for better field recognition
   - Support for multi-column forms
   - Detect field relationships (parent-child)

2. **Enhanced OCR**
   - Multi-language support
   - Custom training data for Polish forms
   - Better handling of handwritten text

3. **Visual Improvements**
   - Live PDF preview with overlays
   - Drag-and-drop field adjustment
   - Visual field type selection

4. **Batch Processing**
   - Process multiple forms at once
   - Detect form versions automatically
   - Compare mappings across versions

5. **Cloud Integration**
   - Save mappings to database
   - Share mappings across team
   - Version control for mappings

## Examples

### Example 1: Detect Fields from URL

```typescript
const detector = new PdfFieldDetector();
const result = await detector.detectFieldsFromUrl(
  '/pdf-templates/UPL-1/2023/UPL-1_2023.pdf'
);

console.log(`Found ${result.fields.length} fields`);
result.fields.forEach(field => {
  console.log(`- ${field.name}: ${field.label} (${field.confidence})`);
});
```

### Example 2: Batch Processing

```typescript
const service = new FormFieldService();

const forms = [
  { file: uplFile, formType: 'UPL-1', version: '2023' },
  { file: pelFile, formType: 'PEL', version: '2023' },
  { file: zawFile, formType: 'ZAW-FA', version: '2023' }
];

const results = await service.batchDetectFields(forms);

results.forEach(result => {
  if (result.error) {
    console.error(`${result.formType}: ${result.error}`);
  } else {
    console.log(`${result.formType}: ${result.metadata.fieldCount} fields detected`);
    service.exportMappingToFile(result.mapping, result.formType, result.metadata.version);
  }
});
```

### Example 3: Merge with Existing Mapping

```typescript
// Load existing mapping
const existing = await fetch('/pdf-templates/UPL-1/mapping.json')
  .then(r => r.json());

// Detect new fields
const detection = await detector.detectFields(updatedPdfFile);

// Merge, keeping manual adjustments
const merged = service.mergeWithExistingMapping(
  detection,
  existing,
  { 
    overwriteExisting: false,
    onlyAddNew: true,
    minConfidence: 0.7
  }
);

// Compare changes
const diff = service.compareMappings(existing, merged);
console.log('Added fields:', diff.added);
console.log('Removed fields:', diff.removed);
console.log('Modified fields:', diff.modified);
```

## Support

For issues or questions about the automated field detection system:

1. Check this documentation
2. Review code comments in source files
3. Test with sample PDFs
4. Create an issue with:
   - PDF form type
   - Detection results
   - Expected vs actual behavior
   - Console errors

## Related Documentation

- [Tax Form Service Guide](./TAX_FORM_SERVICE_GUIDE.md)
- [UPL-1 Implementation](./UPL1_IMPLEMENTATION_SUMMARY.md)
- [PDF Template Guide](../../public/pdf-templates/README.md)
