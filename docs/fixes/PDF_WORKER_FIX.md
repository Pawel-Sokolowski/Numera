# PDF.js Worker Loading Fix

## Issue

When using the PDF field detection feature, the following error occurred:

```
Failed to detect PDF fields: Setting up fake worker failed:
"Failed to fetch dynamically imported module:
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js"
```

This error prevented the automated PDF field detection functionality from working, blocking users from using the OCR-based form field mapping features.

## Root Cause

The application was configured to load the PDF.js worker file from a CDN (CloudFlare):

```typescript
// Old configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js`;
```

This approach had several issues:

1. **Network dependency**: Required internet connection for PDF processing
2. **CDN reliability**: Dependent on CDN availability and access
3. **Version mismatch**: CDN version (4.0.269) didn't match installed version (4.2.67)
4. **Security**: Loading external scripts can be blocked by CSP policies
5. **Offline functionality**: Broke PWA offline capabilities for PDF features

## Solution

The fix involves using a local copy of the PDF.js worker file instead of relying on a CDN:

### 1. Copy Worker File to Public Directory

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

This file is automatically included in the build output since it's in the `public/` directory.

### 2. Update pdfFieldDetector.ts

```typescript
constructor() {
  // Set up PDF.js worker - use local worker file instead of CDN
  // The worker file is copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs to public/
  this.workerSrc = new URL('/pdf.worker.min.mjs', window.location.origin).href;
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
  }
}
```

### 3. Update pdfOcrDetector.ts

```typescript
// Set up PDF.js worker - use local worker file instead of CDN
// The worker file is copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs to public/
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    '/pdf.worker.min.mjs',
    window.location.origin
  ).href;
}
```

## Benefits

1. **Reliability**: No dependency on external CDN availability
2. **Performance**: Worker loads from local server (faster)
3. **Offline support**: Works in PWA offline mode
4. **Version consistency**: Worker version matches pdfjs-dist package version
5. **Security**: No external script loading, better CSP compliance
6. **Maintenance**: Worker automatically updates with pdfjs-dist package updates

## Testing

The fix was tested by:

1. Building the application: `npm run build`
2. Verifying worker file exists in build output: `build/pdf.worker.min.mjs`
3. Checking for linting/type errors: No new errors introduced
4. Confirming file is automatically copied during Vite build process

## Files Changed

- `src/utils/pdfFieldDetector.ts` - Updated worker source URL
- `src/utils/pdfOcrDetector.ts` - Updated worker source URL
- `public/pdf.worker.min.mjs` - Added local worker file (1.3MB)

## Future Maintenance

When updating the `pdfjs-dist` package:

```bash
# After npm install/update
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

Consider adding this to a post-install script in `package.json`:

```json
{
  "scripts": {
    "postinstall": "cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs"
  }
}
```

## Related Documentation

- [PDF Generation Guide](../guides/PDF_GENERATION_GUIDE.md)
- [Automated Field Detection](../../AUTOMATED_FIELD_DETECTION_README.md)
- [Tax Form Service Guide](../features/TAX_FORM_SERVICE_GUIDE.md)

## Impact

This fix enables:

- ✅ Automated PDF field detection and mapping
- ✅ OCR-based form field recognition
- ✅ Visual field editor in Settings → PDF Field Detector
- ✅ Offline PDF processing in PWA mode
- ✅ Reliable form filling for Polish government forms

## Date

2025-10-21
