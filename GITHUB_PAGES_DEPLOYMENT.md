# GitHub Pages Deployment

This document describes the GitHub Pages deployment setup for the Office Management System.

## Overview

The application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live URL**: https://pawel-sokolowski.github.io/ManagmentApp/

## How It Works

### Automatic Deployment

1. Push to `main` branch triggers the GitHub Actions workflow
2. The workflow builds the application with production settings
3. Built files are uploaded to GitHub Pages
4. Application is available at the URL above

### Configuration

The deployment uses the following configuration:

- **Base Path**: `/ManagmentApp/` (default for GitHub Pages subdirectory)
- **Build Command**: `npm run build`
- **Output Directory**: `./build`
- **Node Version**: 18
- **Custom Base Path**: Set `VITE_BASE_PATH=/` for other deployments

### Key Features

1. **Dynamic Path Resolution**
   - Service worker automatically detects base path
   - Works in both local development (`/`) and GitHub Pages (`/ManagmentApp/`)

2. **Progressive Web App (PWA)**
   - Installable on desktop and mobile
   - Offline support via service worker
   - Cached resources for faster loading

3. **Automatic Cache Versioning**
   - Service worker version: `v4`
   - Automatic cache invalidation on updates

## Local Development

For local development:

```bash
npm install
npm run dev
```

Access at: http://localhost:3000

## Building for Other Deployments

To build for deployment on other platforms (not GitHub Pages):

```bash
VITE_BASE_PATH=/ npm run build
```

This will build with base path `/` instead of `/ManagmentApp/`.

## Manual Deployment

To manually trigger a deployment:

1. Go to the [Actions tab](../../actions/workflows/github-pages.yml)
2. Click "Run workflow"
3. Select the `main` branch
4. Click "Run workflow"

## Troubleshooting

### Blank Page After Deployment

If the page appears blank:
1. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache and service workers
3. Check browser console for errors

### Service Worker Issues

To reset the service worker:
1. Open browser DevTools
2. Go to Application > Service Workers
3. Click "Unregister" for this application
4. Refresh the page

### Build Failures

Check the [Actions tab](../../actions) for build logs if deployment fails.

## Architecture

### Files Involved

- `.github/workflows/github-pages.yml` - Deployment workflow
- `vite.config.ts` - Base path configuration (production vs development)
- `public/sw.js` - Service worker with dynamic path detection
- `index.html` - Service worker registration with base path handling

### Environment Detection

The application uses `VITE_BASE_PATH` environment variable to determine the base path:
- **Default (no variable)** → uses `/ManagmentApp/` (GitHub Pages)
- **VITE_BASE_PATH=/** → uses `/` (local/other hosting)

## Updating the Deployment

To update the deployed application:

1. Make changes to the code
2. Commit and push to `main` branch
3. GitHub Actions will automatically build and deploy
4. Changes will be live in a few minutes

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions](https://docs.github.com/en/actions)
