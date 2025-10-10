# Field Detection Usage Guide

## Quick Start

### 1. Basic Detection (Programmatic)

```typescript
import { PdfFieldDetector } from '../utils/pdfFieldDetector';

// Create detector instance
const detector = new PdfFieldDetector();

// Load your PDF
const response = await fetch('/pdf-templates/UPL-1/2023/UPL-1_2023.pdf');
const arrayBuffer = await response.arrayBuffer();

// Detect fields
const result = await detector.detectFields(arrayBuffer);

// Review results
console.log(`Detected ${result.fields.length} fields`);
result.fields.forEach(field => {
  console.log(`- ${field.name}: ${field.label} (${field.confidence.toFixed(2)})`);
});

// Generate mapping
const mapping = detector.generateMapping(result, '2023');

// Download mapping
const blob = new Blob([JSON.stringify(mapping, null, 2)], 
  { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'UPL-1_mapping.json';
a.click();
```

### 2. Using the Service (Recommended)

```typescript
import { FormFieldService } from '../utils/formFieldService';

const service = new FormFieldService();

// From file upload
const file = event.target.files[0]; // File from input
const { mapping, metadata } = await service.detectAndGenerateMapping(
  file,
  'UPL-1',
  '2023'
);

console.log(`Detected ${metadata.fieldCount} fields`);
console.log(`Average confidence: ${(metadata.confidence * 100).toFixed(1)}%`);

// Export to file
service.exportMappingToFile(mapping, 'UPL-1', '2023');
```

### 3. Using the UI Component

```tsx
import { FormFieldDetectorExample } from '../components/FormFieldDetectorExample';

// In your app or admin panel
function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <FormFieldDetectorExample />
    </div>
  );
}
```

## Advanced Usage

### Validating a Mapping

```typescript
import { FormFieldService } from '../utils/formFieldService';
import { TaxFormService } from '../utils/taxFormService';

const service = new FormFieldService();
const taxService = new TaxFormService();

// Load mapping
const mapping = await taxService.loadMappings('UPL-1', '2023');

// Load PDF for validation
const pdfFile = await fetch('/pdf-templates/UPL-1/2023/UPL-1_2023.pdf')
  .then(r => r.arrayBuffer());

// Validate
const { valid, errors } = await service.validateMapping(pdfFile, mapping);

if (!valid) {
  console.error('Validation errors:');
  errors.forEach(error => console.error(`- ${error}`));
} else {
  console.log('✓ Mapping is valid!');
}
```

### Merging with Existing Mapping

```typescript
import { FormFieldService } from '../utils/formFieldService';

const service = new FormFieldService();

// Load existing mapping
const existingMapping = await fetch('/pdf-templates/UPL-1/mapping.json')
  .then(r => r.json());

// Detect fields from updated PDF
const updatedPdfFile = /* ... */;
const detector = new PdfFieldDetector();
const detectionResult = await detector.detectFields(updatedPdfFile);

// Merge: add new fields, keep manual adjustments
const merged = service.mergeWithExistingMapping(
  detectionResult,
  existingMapping,
  {
    overwriteExisting: false,  // Keep manual adjustments
    onlyAddNew: true,           // Only add newly detected fields
    minConfidence: 0.7          // Only add high-confidence fields
  }
);

// Compare changes
const diff = service.compareMappings(existingMapping, merged);
console.log('Added fields:', diff.added);
console.log('Removed fields:', diff.removed);
console.log('Modified fields:', diff.modified);

// Export merged mapping
service.exportMappingToFile(merged, 'UPL-1', '2023');
```

### Batch Processing Multiple Forms

```typescript
import { FormFieldService } from '../utils/formFieldService';

const service = new FormFieldService();

// Prepare files
const forms = [
  { 
    file: await fetch('/pdf-templates/UPL-1/2023/UPL-1_2023.pdf').then(r => r.arrayBuffer()),
    formType: 'UPL-1',
    version: '2023'
  },
  { 
    file: await fetch('/pdf-templates/PEL/2023/PEL_2023.pdf').then(r => r.arrayBuffer()),
    formType: 'PEL',
    version: '2023'
  },
  { 
    file: await fetch('/pdf-templates/ZAW-FA/2023/ZAW-FA_2023.pdf').then(r => r.arrayBuffer()),
    formType: 'ZAW-FA',
    version: '2023'
  }
];

// Batch detect
const results = await service.batchDetectFields(forms);

// Process results
results.forEach(result => {
  if (result.error) {
    console.error(`❌ ${result.formType}: ${result.error}`);
  } else {
    console.log(`✓ ${result.formType}: ${result.metadata.fieldCount} fields detected`);
    service.exportMappingToFile(result.mapping, result.formType, result.metadata.version);
  }
});
```

### Custom Field Name Suggestions

```typescript
import { FormFieldService } from '../utils/formFieldService';

const service = new FormFieldService();

// Get field name suggestions
const labels = [
  'Imię i nazwisko',
  'Numer PESEL',
  'NIP',
  'Adres zamieszkania',
  'Miasto',
  'Podpis'
];

labels.forEach(label => {
  const fieldName = service.suggestFieldName(label, { formType: 'UPL-1' });
  console.log(`"${label}" → ${fieldName}`);
});

// Output:
// "Imię i nazwisko" → firstName
// "Numer PESEL" → pesel
// "NIP" → nip
// "Adres zamieszkania" → address
// "Miasto" → city
// "Podpis" → signature
```

## Integration Examples

### Integration with TaxFormService

```typescript
import { FormFieldService } from '../utils/formFieldService';
import { TaxFormService } from '../utils/taxFormService';

// Step 1: Detect fields from new form
const fieldService = new FormFieldService();
const { mapping } = await fieldService.detectAndGenerateMapping(
  pdfFile,
  'NEW-FORM',
  '2023'
);

// Step 2: Save mapping to public/pdf-templates/NEW-FORM/mapping.json
// (In production, this would be done via backend API)

// Step 3: Use with TaxFormService
const taxService = new TaxFormService();
const formData = {
  principalName: 'Jan Kowalski',
  principalNIP: '1234567890',
  attorneyName: 'Anna Nowak',
  // ... other fields
};

const pdfBytes = await taxService.fillForm('NEW-FORM', '2023', formData);

// Step 4: Download filled PDF
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'NEW-FORM_filled.pdf';
a.click();
```

### Creating a Detection Workflow Component

```tsx
import React, { useState } from 'react';
import { FormFieldService } from '../utils/formFieldService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

export function DetectionWorkflow() {
  const [file, setFile] = useState<File | null>(null);
  const [formType, setFormType] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    if (!file || !formType) {
      setError('Please provide both file and form type');
      return;
    }

    setDetecting(true);
    setError(null);

    try {
      const service = new FormFieldService();
      const { mapping, metadata } = await service.detectAndGenerateMapping(
        file,
        formType,
        '2023'
      );

      setResult({ mapping, metadata });
      
      // Auto-download mapping
      service.exportMappingToFile(mapping, formType, '2023');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file">PDF File</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div>
        <Label htmlFor="formType">Form Type</Label>
        <Input
          id="formType"
          placeholder="e.g., UPL-1, PEL"
          value={formType}
          onChange={(e) => setFormType(e.target.value.toUpperCase())}
        />
      </div>

      <Button onClick={handleDetect} disabled={detecting || !file || !formType}>
        {detecting ? 'Detecting...' : 'Detect Fields'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert>
          <AlertDescription>
            Successfully detected {result.metadata.fieldCount} fields 
            (avg confidence: {(result.metadata.confidence * 100).toFixed(1)}%)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Review Detected Fields

```typescript
const result = await detector.detectFields(pdfFile);

// Check confidence scores
const lowConfidenceFields = result.fields.filter(f => f.confidence < 0.7);
if (lowConfidenceFields.length > 0) {
  console.warn('Low confidence fields require review:');
  lowConfidenceFields.forEach(f => {
    console.warn(`- ${f.name}: ${f.label} (${f.confidence.toFixed(2)})`);
  });
}
```

### 2. Validate Before Using

```typescript
const service = new FormFieldService();
const { valid, errors } = await service.validateMapping(pdfFile, mapping);

if (!valid) {
  // Handle validation errors
  console.error('Validation failed:', errors);
  // Show errors to user, don't use invalid mapping
} else {
  // Safe to use
  await taxService.fillForm(formType, version, formData);
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await detector.detectFields(pdfFile);
  // Process result
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Canvas')) {
      console.error('Browser environment required for field detection');
    } else if (error.message.includes('OCR')) {
      console.error('OCR failed, check Tesseract.js configuration');
    } else {
      console.error('Detection failed:', error.message);
    }
  }
  // Fallback to manual mapping
}
```

### 4. Cache Detection Results

```typescript
class DetectionCache {
  private cache = new Map<string, FieldDetectionResult>();

  async getOrDetect(pdfUrl: string, detector: PdfFieldDetector): Promise<FieldDetectionResult> {
    if (this.cache.has(pdfUrl)) {
      return this.cache.get(pdfUrl)!;
    }

    const result = await detector.detectFieldsFromUrl(pdfUrl);
    this.cache.set(pdfUrl, result);
    return result;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new DetectionCache();
const result = await cache.getOrDetect(pdfUrl, detector);
```

### 5. Progressive Enhancement

```typescript
// Try automatic detection first
let mapping;

try {
  const service = new FormFieldService();
  const result = await service.detectAndGenerateMapping(pdfFile, formType, version);
  mapping = result.mapping;
  
  console.log('✓ Automatic detection successful');
} catch (error) {
  console.warn('Automatic detection failed, using manual mapping');
  
  // Fallback to manual mapping
  mapping = await fetch(`/pdf-templates/${formType}/mapping.json`)
    .then(r => r.json());
}

// Use mapping either way
await taxService.fillForm(formType, version, formData);
```

## Troubleshooting

### Detection Not Working

**Problem**: No fields detected

```typescript
// Solution 1: Check PDF quality
const result = await detector.detectFields(pdfFile);
console.log('Rectangles found:', result.rectangles.length);
console.log('Texts found:', result.texts.length);

// If rectangles.length is 0, the PDF might not have visible borders
// If texts.length is 0, OCR might have failed

// Solution 2: Try with higher scale
// Modify pdfFieldDetector.ts line:
// const viewport = page.getViewport({ scale: 3.0 }); // Increase from 2.0
```

**Problem**: Low confidence scores

```typescript
// Filter by confidence and review
const highConfidence = result.fields.filter(f => f.confidence > 0.8);
const lowConfidence = result.fields.filter(f => f.confidence <= 0.8);

console.log(`High confidence: ${highConfidence.length}`);
console.log(`Need review: ${lowConfidence.length}`);

// Manually review low confidence fields using the UI editor
```

**Problem**: OCR not recognizing Polish text

```typescript
// Ensure Polish language is loaded
// In pdfFieldDetector.ts, verify:
// await Tesseract.recognize(canvas, 'pol', { ... })

// If still failing, try:
await Tesseract.recognize(canvas, 'pol+eng', { ... })
```

### Performance Issues

**Problem**: Detection is slow

```typescript
// Solution: Reduce scale or process fewer pages
const detector = new PdfFieldDetector();

// Only process first page if form is single-page
// Modify detectFields to accept page range parameter

// Or use progressive detection
const result = await detector.detectFields(pdfFile);
// Show loading progress to user
```

## API Reference

### PdfFieldDetector

```typescript
class PdfFieldDetector {
  // Detect fields from PDF
  async detectFields(pdfFile: ArrayBuffer | Uint8Array): Promise<FieldDetectionResult>
  
  // Detect from URL
  async detectFieldsFromUrl(pdfUrl: string): Promise<FieldDetectionResult>
  
  // Generate mapping
  generateMapping(result: FieldDetectionResult, version: string): object
}
```

### FormFieldService

```typescript
class FormFieldService {
  // All-in-one detection
  async detectAndGenerateMapping(
    pdfFile: ArrayBuffer | File,
    formType: string,
    version: string
  ): Promise<{ mapping: object; metadata: FormFieldMetadata }>
  
  // Validate mapping
  async validateMapping(
    pdfFile: ArrayBuffer | File,
    mapping: FormMapping
  ): Promise<{ valid: boolean; errors: string[] }>
  
  // Merge mappings
  mergeWithExistingMapping(
    detection: FieldDetectionResult,
    existing: FormMapping,
    options?: MergeOptions
  ): FormMapping
  
  // Compare mappings
  compareMappings(
    mapping1: FormMapping,
    mapping2: FormMapping
  ): ComparisonResult
  
  // Export/Import
  exportMappingToFile(mapping: object, formType: string, version: string): void
  async importMappingFromFile(file: File): Promise<FormMapping>
  
  // Utilities
  suggestFieldName(label: string, context?: { formType?: string }): string
  async batchDetectFields(files: BatchInput[]): Promise<BatchResult[]>
}
```

## Next Steps

1. **Try the Examples**: Copy and run the code examples above
2. **Read Full Documentation**: See [AUTOMATED_FIELD_DETECTION.md](./AUTOMATED_FIELD_DETECTION.md)
3. **Integrate into Your App**: Add the UI component to your admin panel
4. **Customize Detection**: Adjust parameters in `pdfFieldDetector.ts`
5. **Report Issues**: If you encounter problems, check troubleshooting section
