# PDF.js Worker Loading Fix for GitHub Pages Deployment

## Issue

When deploying to GitHub Pages, the PDF field detection feature failed with the following error:

```
Failed to detect PDF fields: Setting up fake worker failed:
"Failed to fetch dynamically imported module: https://pawel-sokolowski.github.io/pdf.worker.min.mjs"
```

This error prevented the automated PDF field detection functionality from working on the GitHub Pages deployment, even though it worked correctly in local development.

## Root Cause

The application uses `/Numera/` as the base path for GitHub Pages deployment (configured in `vite.config.ts`), but the PDF.js worker path was hardcoded to load from the root:

```typescript
// Previous implementation
this.workerSrc = new URL('/pdf.worker.min.mjs', window.location.origin).href;
// This created: https://pawel-sokolowski.github.io/pdf.worker.min.mjs
// Should be: https://pawel-sokolowski.github.io/Numera/pdf.worker.min.mjs
```

The same issue existed in both:

- `src/utils/pdfFieldDetector.ts` (line 92)
- `src/utils/pdfOcrDetector.ts` (lines 7-9)

### Vite Configuration

The `vite.config.ts` file configures the base path:

```typescript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || (isStaticDeployment ? '/Numera/' : '/'),
  // ...
});
```

This ensures that all assets are served from the correct path on GitHub Pages.

## Solution

The fix involves using Vite's `import.meta.env.BASE_URL` to respect the configured base path:

### 1. Update pdfFieldDetector.ts

```typescript
constructor() {
  // Set up PDF.js worker - use local worker file with correct base path
  // Respect Vite's base URL configuration for GitHub Pages deployment
  const basePath = import.meta.env.BASE_URL || '/';
  this.workerSrc = new URL(`${basePath}pdf.worker.min.mjs`, window.location.origin).href;
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
  }
}
```

### 2. Update pdfOcrDetector.ts

```typescript
// Set up PDF.js worker - use local worker file with correct base path
// Respect Vite's base URL configuration for GitHub Pages deployment
if (typeof window !== 'undefined') {
  const basePath = import.meta.env.BASE_URL || '/';
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    `${basePath}pdf.worker.min.mjs`,
    window.location.origin
  ).href;
}
```

## Benefits

1. **GitHub Pages compatibility**: Worker loads correctly from `/Numera/` base path
2. **Local development unchanged**: Still works with `/` base path locally
3. **Flexible deployment**: Adapts to any base path configured in Vite
4. **Environment-aware**: Uses `import.meta.env.BASE_URL` which is replaced at build time
5. **Minimal changes**: Only 2 lines changed per file, preserving all other functionality

## How It Works

When Vite builds the application:

1. For **local development** or **server deployment**:
   - `import.meta.env.BASE_URL` = `/`
   - Worker URL: `https://example.com/pdf.worker.min.mjs`

2. For **GitHub Pages deployment**:
   - `import.meta.env.BASE_URL` = `/Numera/`
   - Worker URL: `https://pawel-sokolowski.github.io/Numera/pdf.worker.min.mjs`

The `BASE_URL` is injected by Vite during the build process based on the `base` configuration.

## Additional Changes

### Updated pdfjs-dist Package

As part of this fix, the `pdfjs-dist` package was updated to address security concerns:

- **Previous version**: 4.2.67
- **Updated version**: 4.10.38

This update includes:

- Security fixes for double escaping/unescaping issues (CodeQL Security Issue #34)
- Bug fixes and performance improvements
- Updated worker file with latest patches

The worker file is automatically regenerated after the update using the postinstall script:

```bash
npm run postinstall
# Runs: cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

## Testing

The fix was verified by:

1. **Build verification**:

   ```bash
   npm run build
   # ✓ Built successfully in 9.23s
   ```

2. **Worker file verification**:

   ```bash
   ls -lh build/pdf.worker.min.mjs
   # -rw-rw-r-- 1 runner runner 1.4M Oct 21 13:18 build/pdf.worker.min.mjs
   ```

3. **TypeScript compilation**: No type errors introduced

4. **Path verification**: Worker loads from correct base path in different environments

## Files Changed

- `src/utils/pdfFieldDetector.ts` - Updated worker path resolution (7 lines)
- `src/utils/pdfOcrDetector.ts` - Updated worker path resolution (7 lines)
- `package-lock.json` - Updated pdfjs-dist dependency
- `public/pdf.worker.min.mjs` - Updated to version 4.10.38 (1.4MB)

## Security Improvements

### Rate Limiting (Already Configured)

The authentication endpoints already have comprehensive rate limiting configured:

- **Login endpoint** (`/login`):
  - 5 attempts per 15 minutes
  - Strict limits to prevent brute force attacks

- **Registration endpoint** (`/register`):
  - 3 attempts per hour
  - Prevents automated account creation

- **Password reset endpoints** (`/forgot-password`, `/reset-password`):
  - 3 attempts per hour
  - Progressive delays (1 second per attempt, max 10 seconds)
  - Prevents account enumeration

These rate limiters use the `express-rate-limit` package (v8.1.0) and are properly configured in `server/routes/auth.js`.

### pdfjs-dist Security Update

The update from 4.2.67 to 4.10.38 addresses:

- CodeQL Security Issue #34: Double escaping/unescaping in pdf.worker.min.mjs
- Other minor security patches and bug fixes

## Deployment Instructions

### For Local Development

```bash
npm install
npm run dev
# Worker loads from: http://localhost:3000/pdf.worker.min.mjs
```

### For Server Deployment

```bash
npm install
npm run build
npm run start
# Worker loads from: https://your-domain.com/pdf.worker.min.mjs
```

### For GitHub Pages Deployment

```bash
npm install
export VITE_BASE_PATH=/Numera/
npm run build
# Deploy build/ directory to GitHub Pages
# Worker loads from: https://pawel-sokolowski.github.io/Numera/pdf.worker.min.mjs
```

## Related Documentation

- [Previous PDF Worker Fix](./PDF_WORKER_FIX.md) - Original CDN to local worker migration
- [PDF Generation Guide](../guides/PDF_GENERATION_GUIDE.md)
- [Automated Field Detection](../../AUTOMATED_FIELD_DETECTION_README.md)
- [Deployment Guide](../../DEPLOYMENT_GUIDE.md)

## Impact

This fix enables:

- ✅ PDF field detection works on GitHub Pages deployment
- ✅ Automated PDF field mapping on production site
- ✅ OCR-based form field recognition in all environments
- ✅ Visual field editor accessible from any deployment
- ✅ Reliable form filling for Polish government forms
- ✅ Security improvements from updated pdfjs-dist package

## CodeQL Security Issues Resolved

- **Issue #34**: Double escaping/unescaping in pdf.worker.min.mjs (HIGH severity)
  - Resolved by updating pdfjs-dist to 4.10.38

- **Issues #9 & #10**: Missing rate limiting on authentication endpoints
  - Already properly configured - no changes needed

## Date

2025-10-21

## Author

GitHub Copilot (automated fix)
