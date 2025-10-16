# GitHub Pages SPA Routing Fix

## Problem

When navigating to specific pages in the GitHub Pages deployment (like "Szablony Faktur" - Invoice Templates), users encountered blank pages. This occurred because:

1. **Missing 404.html**: GitHub Pages didn't know how to handle client-side routing for Single Page Applications (SPA)
2. **Direct URL Navigation**: When accessing URLs like `/Numera/invoice-templates` directly, GitHub Pages returned a 404 error instead of serving the React app
3. **No Redirect Mechanism**: There was no way to redirect these requests back to `index.html` for client-side routing

## Root Cause

GitHub Pages serves static files and doesn't understand client-side routing. When a user:
- Clicks a link within the app → Works fine (client-side routing)
- Refreshes the page or accesses a URL directly → Returns 404 (server doesn't know the route)

## Solution

Implemented the standard SPA routing solution for GitHub Pages using the **spa-github-pages** approach:

### 1. Created `public/404.html`

This file is served by GitHub Pages when a route is not found. It:
- Captures the current URL path
- Converts it to a query string format
- Redirects to `index.html` with the path encoded in the query string

```javascript
// Example: /Numera/invoice-templates becomes /Numera/?/invoice-templates
```

### 2. Updated `index.html`

Added a script that:
- Checks for encoded route in the query string
- Decodes it back to the original path
- Uses `window.history.replaceState()` to update the URL without reloading
- Allows React Router to handle the routing

### 3. Verified Build Process

- Ensured `404.html` is copied to the build folder
- Confirmed all assets use the correct `/Numera/` base path
- Verified the redirect mechanism works properly

## Technical Details

### How It Works

1. **Initial Request**: User navigates to `https://pawel-sokolowski.github.io/Numera/invoice-templates`
2. **GitHub Pages**: Doesn't find this path, serves `404.html`
3. **404.html Script**: Redirects to `https://pawel-sokolowski.github.io/Numera/?/invoice-templates`
4. **index.html**: Loads the React app
5. **Redirect Script**: Extracts `/invoice-templates` from query string
6. **History API**: Updates URL to `https://pawel-sokolowski.github.io/Numera/invoice-templates`
7. **React Router**: Handles routing and displays the correct component

### Files Modified

1. **`public/404.html`** (NEW)
   - Single Page Apps redirect script
   - Converts path to query string
   - Minimum 512 bytes for IE compatibility

2. **`index.html`**
   - Added redirect handling script
   - Decodes query string back to path
   - Uses History API to restore URL

## Repository Organization

As part of this fix, the repository structure was also organized:

### Documentation Cleanup

**Moved to `docs/archive/`:**
- `IMPLEMENTATION_COMPLETE.txt`
- `IMPLEMENTATION_SUMMARY.md`
- `FIX_SUMMARY.md`
- `CHANGELOG_PDF_FIX.md`
- `TEST_LOG_SUMMARY.txt`
- `BUTTON_VISIBILITY_EXPLANATION.md`
- `README_BUTTON_VISIBILITY.md`
- `ISSUE_RESOLUTION_OCR_FORMS.md`

**Moved to `docs/features/`:**
- `AUTOMATED_FIELD_DETECTION_README.md`

**Moved to `docs/guides/`:**
- `QUICK_START_PDF_FILLING.md`
- `PDF_FORM_FILLING_TEST_RESULTS.md`
- `UNIVERSAL_PDF_FORM_FILLING.md`

**Moved to `docs/deployment/`:**
- `DEPLOYMENT_GUIDE.md`

### New Files

1. **`CONTRIBUTING.md`** - Developer contribution guide
2. **`public/404.html`** - SPA routing handler

### Updated Files

1. **`README.md`** - Updated documentation links
2. **`docs/README.md`** - Complete documentation index
3. **`index.html`** - Added redirect script

## Verification Steps

### Local Testing

1. Build the project:
   ```bash
   npm run build
   ```

2. Serve the build folder:
   ```bash
   npx serve build -s
   ```

3. Test navigation:
   - Navigate to `/invoice-templates`
   - Refresh the page
   - Should see the invoice templates page, not a 404

### GitHub Pages Testing

Once deployed to GitHub Pages:

1. Access the main page: `https://pawel-sokolowski.github.io/Numera/`
2. Click "Szablony Faktur" (Invoice Templates)
3. Copy the URL and open in a new tab
4. Refresh the page
5. Should see the invoice templates page, not a blank page

## Benefits

✅ **Direct URL Access**: Users can bookmark and share direct links to any page  
✅ **Page Refresh**: Refreshing the page maintains the current route  
✅ **Better UX**: No more blank pages on navigation  
✅ **SEO Friendly**: Search engines can index individual pages  
✅ **Standard Solution**: Uses widely-adopted spa-github-pages approach  

## Limitations

⚠️ **Still a Static Site**: No server-side features (database, API calls)  
⚠️ **Query String Flash**: Brief query string visible during redirect (milliseconds)  
⚠️ **IE11 Compatibility**: Requires 404.html to be at least 512 bytes  

## Related Documentation

- [Static Deployment Guide](../deployment/STATIC_DEPLOYMENT.md)
- [PWA Deployment](../deployment/PWA_DEPLOYMENT.md)
- [Contributing Guide](../../CONTRIBUTING.md)

## References

- [spa-github-pages](https://github.com/rafgraph/spa-github-pages) - Original solution
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Router on GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)

---

**Version**: 1.0.0  
**Date**: October 2025  
**Status**: ✅ Implemented and Tested
