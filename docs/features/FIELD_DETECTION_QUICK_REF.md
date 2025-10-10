# Field Detection Quick Reference

## 🚀 Quick Start (3 Lines)

```typescript
import { FormFieldService } from '../utils/formFieldService';
const service = new FormFieldService();
const { mapping } = await service.detectAndGenerateMapping(pdfFile, 'UPL-1', '2023');
```

## 📦 Installation

Already included! Dependencies added:
- `pdfjs-dist@4.0.269` - PDF rendering
- `tesseract.js@5.0.4` - OCR engine

## 🎯 Common Tasks

### Detect Fields from File Upload

```typescript
const file = event.target.files[0];
const service = new FormFieldService();
const { mapping, metadata } = await service.detectAndGenerateMapping(file, 'UPL-1', '2023');
console.log(`Detected ${metadata.fieldCount} fields`);
```

### Detect from URL

```typescript
const detector = new PdfFieldDetector();
const result = await detector.detectFieldsFromUrl('/pdf-templates/UPL-1/2023/UPL-1_2023.pdf');
```

### Export Mapping

```typescript
const service = new FormFieldService();
service.exportMappingToFile(mapping, 'UPL-1', '2023');
// Downloads: UPL-1_2023_mapping.json
```

### Validate Mapping

```typescript
const { valid, errors } = await service.validateMapping(pdfFile, mapping);
if (!valid) console.error(errors);
```

### Merge with Existing

```typescript
const merged = service.mergeWithExistingMapping(detectionResult, existingMapping, {
  onlyAddNew: true,
  minConfidence: 0.7
});
```

## 🎨 UI Component

```tsx
import { PdfFieldDetectorDialog } from './components/PdfFieldDetectorDialog';

<PdfFieldDetectorDialog open={open} onOpenChange={setOpen} />
```

## 🔧 Advanced

### Batch Process

```typescript
const forms = [
  { file: uplFile, formType: 'UPL-1', version: '2023' },
  { file: pelFile, formType: 'PEL', version: '2023' }
];
const results = await service.batchDetectFields(forms);
```

### Custom Field Names

```typescript
const name = service.suggestFieldName('Imię i nazwisko'); // → 'firstName'
```

### Compare Mappings

```typescript
const diff = service.compareMappings(oldMapping, newMapping);
console.log('Added:', diff.added);
console.log('Modified:', diff.modified);
```

## 📊 Detection Result Structure

```typescript
{
  fields: [
    {
      name: 'principalName',      // Generated field name
      label: 'Nazwa mocodawcy',   // Detected label
      x: 150,                      // X coordinate
      y: 720,                      // Y coordinate (from bottom)
      width: 300,                  // Field width
      height: 20,                  // Field height
      page: 1,                     // Page number
      confidence: 0.92,            // Detection confidence
      type: 'text'                 // text | checkbox | signature
    }
  ],
  rectangles: [ /* detected boxes */ ],
  texts: [ /* OCR results */ ],
  pageCount: 1,
  pageSize: { width: 595, height: 842 }
}
```

## 🎛️ Configuration

### Detection Parameters (in pdfFieldDetector.ts)

```typescript
const minWidth = 50;        // Min field width
const minHeight = 15;       // Min field height
const maxWidth = width * 0.8;  // Max field width
const maxHeight = 100;      // Max field height
const maxDistance = 100;    // Max label-field distance
```

### OCR Settings

```typescript
{
  lang: 'pol',              // Polish language
  logger: m => console.log(m)  // Progress logging
}
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No fields detected | Check PDF has visible borders |
| Low confidence | Use higher resolution PDF |
| Polish text issues | Verify 'pol' language loaded |
| Slow detection | Reduce scale or page count |
| Canvas errors | Run in browser environment |

## 📝 Field Type Detection

| Field Type | Criteria |
|------------|----------|
| `checkbox` | Small square (<30×30), equal dimensions |
| `signature` | Large area (>5000px²), "podpis" in label |
| `text` | Everything else (default) |

## 🔗 Integration with TaxFormService

```typescript
// 1. Detect fields
const { mapping } = await service.detectAndGenerateMapping(pdfFile, 'UPL-1', '2023');

// 2. Save to public/pdf-templates/UPL-1/mapping.json

// 3. Use with TaxFormService
const taxService = new TaxFormService();
const pdfBytes = await taxService.fillForm('UPL-1', '2023', formData);
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/utils/pdfFieldDetector.ts` | Core detection engine |
| `src/utils/formFieldService.ts` | High-level service |
| `src/components/PdfFieldDetectorDialog.tsx` | React UI |
| `docs/features/AUTOMATED_FIELD_DETECTION.md` | Full docs |
| `docs/features/FIELD_DETECTION_USAGE_GUIDE.md` | Usage examples |

## 🎯 Supported Forms

✅ UPL-1, UPL-1P, PEL, ZAW-FA (Pełnomocnictwa)  
✅ PIT-37, PIT-R, PIT-OP, PIT-2 (Tax declarations)  
✅ IFT-1 (Information forms)  
✅ OPD-1, OPL-1, OPO-1, OPS-1, PPD-1, PPO-1, PPS-1 (Declaration forms)  
✅ Any custom PDF form with visible fields

## 💡 Pro Tips

1. **Always review** detected fields before using
2. **Check confidence** scores (>0.7 is good)
3. **Validate mappings** before production use
4. **Cache results** to avoid re-detection
5. **Use UI editor** for fine-tuning

## 🎓 Learning Resources

- Full Documentation: `docs/features/AUTOMATED_FIELD_DETECTION.md`
- Usage Guide: `docs/features/FIELD_DETECTION_USAGE_GUIDE.md`
- Test Script: `node scripts/test-field-detection.js`
- Example Component: `src/components/FormFieldDetectorExample.tsx`

## 🤝 Support

For issues:
1. Check troubleshooting section
2. Review console errors
3. Test with sample PDFs
4. Create issue with details

---

**Need Help?** See full documentation in `docs/features/AUTOMATED_FIELD_DETECTION.md`
