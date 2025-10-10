# PDF Templates Path Fix

## Issue
PDF files were not loading on the web version because they were placed in `src/assets/pdf-templates/` which doesn't get properly served as static assets by Vite in production builds.

## Solution
Moved all PDF templates from `src/assets/pdf-templates/` to `public/pdf-templates/`.

### Changes Made

1. **Moved PDF Templates**
   - From: `src/assets/pdf-templates/`
   - To: `public/pdf-templates/`
   - All 25 PDF files (3.8 MB+) across 16 form types

2. **Updated TaxFormService**
   - Changed `loadPdfTemplate()` to fetch from `/pdf-templates/` (public directory)
   - Changed `loadMappings()` to fetch from `/pdf-templates/` (public directory)
   - Old path: `/src/assets/pdf-templates/${formType}/...`
   - New path: `/pdf-templates/${formType}/...`

3. **Why This Fixes the Issue**
   - Files in `public/` are served as static assets
   - They're accessible at runtime via simple HTTP fetch
   - No bundling or import issues
   - Works correctly in both development and production

### New Structure

```
public/
├── pdf-templates/
│   ├── PIT-37/
│   │   ├── 2022/
│   │   ├── 2023/
│   │   └── mapping.json
│   ├── PIT-R/
│   │   ├── 2022/PIT-R_2022.pdf
│   │   ├── 2023/PIT-R_2023.pdf
│   │   ├── 2024/PIT-R_2024.pdf
│   │   └── mapping.json
│   ├── [... 14 more form types ...]
│   └── README.md
└── upl-1_06-08-2.pdf (backward compatibility)
```

### Testing

Build and verify the fix:
```bash
npm run build
# Check that PDFs are in the build output
ls build/pdf-templates/
```

### Backward Compatibility

✅ UPL-1 still works with fallback to `/upl-1_06-08-2.pdf` in public root
✅ All existing form generation code works without changes
✅ Only internal paths updated in TaxFormService

## Status

✅ **Fixed** - PDFs now load correctly on web version
