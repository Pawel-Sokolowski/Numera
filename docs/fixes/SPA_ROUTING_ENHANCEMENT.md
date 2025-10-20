# SPA Routing Enhancement for GitHub Pages

## Overview

This document describes the enhancements made to enable proper Single Page Application (SPA) routing on GitHub Pages, specifically for the Numera office management system deployed at `https://pawel-sokolowski.github.io/Numera/`.

## Problem Statement

Previously, the application used only internal state (`currentView`) for navigation. This meant:

- Direct navigation to routes like `/Numera/monthly-data` would result in a 404 error
- Browser back/forward buttons didn't work properly
- The URL didn't reflect the current view
- Bookmarking specific pages was not possible
- The service worker didn't properly handle navigation requests

## Solution

### 1. URL Synchronization in App.tsx

Added three `useEffect` hooks to synchronize the URL with the application state:

#### Initial URL Reading (On Mount)

```typescript
useEffect(() => {
  const path = window.location.pathname;
  const basePath = import.meta.env.BASE_URL || '/';
  const route = path.replace(basePath, '').replace(/^\//, '').replace(/\/$/, '');

  if (route && route !== currentView) {
    // Check if route is a valid view
    const validViews: View[] = [
      'dashboard',
      'clients',
      'add-client',
      'edit-client',
      'view-client',
      'chat',
      'email',
      'invoices',
      'calendar',
      'users',
      'email-templates',
      'invoice-templates',
      'profile',
      'documents',
      'monthly-data',
      'settings',
      'bank-integration',
      'contracts',
      'time-tracker',
      'work-time-report',
      'auto-invoicing',
    ];

    if (validViews.includes(route as View)) {
      setCurrentView(route as View);
    }
  }
}, []);
```

#### URL Update on View Change

```typescript
useEffect(() => {
  const basePath = import.meta.env.BASE_URL || '/';
  const currentPath = window.location.pathname;
  const expectedPath = basePath + currentView;

  if (currentPath !== expectedPath && currentUser) {
    window.history.pushState(null, '', expectedPath);
  }
}, [currentView, currentUser]);
```

#### Browser Back/Forward Navigation

```typescript
useEffect(() => {
  const handlePopState = () => {
    const path = window.location.pathname;
    const basePath = import.meta.env.BASE_URL || '/';
    const route = path.replace(basePath, '').replace(/^\//, '').replace(/\/$/, '');

    if (route) {
      const validViews: View[] = [
        'dashboard',
        'clients',
        'add-client',
        'edit-client',
        'view-client',
        'chat',
        'email',
        'invoices',
        'calendar',
        'users',
        'email-templates',
        'invoice-templates',
        'profile',
        'documents',
        'monthly-data',
        'settings',
        'bank-integration',
        'contracts',
        'time-tracker',
        'work-time-report',
        'auto-invoicing',
      ];

      if (validViews.includes(route as View)) {
        setCurrentView(route as View);
      }
    } else {
      setCurrentView('dashboard');
    }
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

### 2. Enhanced index.html Redirect Script

Improved the SPA redirect script to properly handle the base path:

```javascript
(function (l) {
  if (l.search[1] === '/') {
    var decoded = l.search
      .slice(1)
      .split('&')
      .map(function (s) {
        return s.replace(/~and~/g, '&');
      })
      .join('?');
    // Get the base path (e.g., /Numera/)
    var basePath = l.pathname;
    // If pathname ends with / and we have decoded path, combine properly
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }
    window.history.replaceState(null, null, basePath + decoded.slice(1) + l.hash);
  }
})(window.location);
```

### 3. Service Worker Navigation Handling

Updated the service worker to properly handle navigation requests:

```javascript
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests (HTML pages), always serve index.html for SPA routing
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        // If network fails, serve cached index.html
        return caches
          .match(basePath + 'index.html')
          .then((response) => response || caches.match(basePath));
      })
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        return (
          response ||
          fetch(request).then((fetchResponse) => {
            // Don't cache API requests or external resources
            if (request.method === 'GET' && url.origin === self.location.origin) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, fetchResponse.clone());
                return fetchResponse;
              });
            }
            return fetchResponse;
          })
        );
      })
      .catch(() => {
        return new Response('Network error', { status: 408 });
      })
  );
});
```

### 4. Cache Version Update

Bumped the service worker cache version to `office-management-v5` to ensure all clients get the updated service worker.

## How It Works

### Direct Navigation Flow

1. User navigates directly to `https://pawel-sokolowski.github.io/Numera/monthly-data`
2. GitHub Pages returns 404.html (because the route doesn't exist as a file)
3. 404.html redirects to `https://pawel-sokolowski.github.io/Numera/?/monthly-data`
4. index.html loads and the SPA redirect script detects the `?/monthly-data` in the query string
5. The script decodes it and uses `history.replaceState` to change the URL to `https://pawel-sokolowski.github.io/Numera/monthly-data`
6. App.tsx's initial URL reading effect detects the route and sets `currentView` to `'monthly-data'`
7. The correct component is rendered

### View Change Flow

1. User clicks on a menu item, triggering `setCurrentView('monthly-data')`
2. The URL update effect detects the view change
3. `window.history.pushState` updates the URL to `/Numera/monthly-data`
4. The browser's address bar updates without reloading the page

### Back/Forward Button Flow

1. User clicks the browser's back button
2. The `popstate` event fires
3. The popstate handler extracts the route from the URL
4. `setCurrentView` is called with the extracted route
5. The correct component is rendered

## Testing

To test the routing:

1. Build the project: `npm run build`
2. Start the preview server: `npm run preview`
3. Navigate to `http://localhost:4174/Numera/`
4. Test direct navigation:
   - Manually enter `http://localhost:4174/Numera/monthly-data` in the address bar
   - The monthly-data view should load correctly
5. Test view changes:
   - Click on different menu items
   - The URL should update to match the view
6. Test back/forward:
   - Click through several views
   - Use browser back/forward buttons
   - The correct views should load

## Supported Routes

All routes defined in `menuConfig.ts` are supported:

- `/Numera/` or `/Numera/dashboard` - Dashboard
- `/Numera/clients` - Client list
- `/Numera/add-client` - Add client form
- `/Numera/edit-client` - Edit client form
- `/Numera/view-client` - View client details
- `/Numera/chat` - Team chat
- `/Numera/email` - Email center
- `/Numera/invoices` - Invoice manager
- `/Numera/calendar` - Calendar
- `/Numera/users` - User management
- `/Numera/email-templates` - Email templates
- `/Numera/invoice-templates` - Invoice templates
- `/Numera/profile` - User profile
- `/Numera/documents` - Document manager
- `/Numera/monthly-data` - Monthly data panel
- `/Numera/settings` - System settings
- `/Numera/bank-integration` - Bank integration
- `/Numera/contracts` - Contract management
- `/Numera/time-tracker` - Time tracker
- `/Numera/work-time-report` - Work time report
- `/Numera/auto-invoicing` - Automatic invoicing

## Files Modified

1. **src/App.tsx**
   - Added URL synchronization effects
   - Added browser navigation support

2. **index.html**
   - Improved SPA redirect script for better base path handling

3. **public/sw.js**
   - Enhanced navigation request handling
   - Improved caching strategy
   - Updated cache version

## Configuration Files (Already Correct)

These files were already configured correctly:

1. **vite.config.ts**
   - Base path set to `/Numera/` for GitHub Pages

2. **public/404.html**
   - SPA redirect script with `pathSegmentsToKeep = 1`

3. **public/.nojekyll**
   - Prevents GitHub Pages from treating it as Jekyll site

4. **.github/workflows/github-pages.yml**
   - Proper build and deployment workflow

## Benefits

- ✅ Direct navigation to any route works
- ✅ Browser back/forward buttons work correctly
- ✅ URLs can be bookmarked
- ✅ URLs can be shared
- ✅ Service worker doesn't interfere with routing
- ✅ Offline support maintained
- ✅ No breaking changes to existing functionality

## Maintenance

When adding new routes:

1. Add the route to the `View` type in `src/config/menuConfig.ts`
2. Add the route to the `validViews` array in all three effects in `src/App.tsx`
3. No changes needed to 404.html, index.html, or the service worker

## References

- [SPA GitHub Pages solution](https://github.com/rafgraph/spa-github-pages)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
