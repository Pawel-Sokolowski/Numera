// Service Worker for Office Management System PWA
const CACHE_NAME = 'office-management-v5';

// Dynamically determine the base path from the service worker's location
const swUrl = new URL(self.location.href);
const basePath = swUrl.pathname.substring(0, swUrl.pathname.lastIndexOf('/') + 1);

const urlsToCache = [basePath, basePath + 'index.html'];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
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
        // Return cached version or fetch from network
        return (
          response ||
          fetch(request).then((fetchResponse) => {
            // Don't cache API requests or external resources
            if (request.method === 'GET' && url.origin === self.location.origin) {
              // Cache new resources
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
        // If both cache and network fail, return nothing for non-document requests
        return new Response('Network error', { status: 408 });
      })
  );
});
