// Improved Service Worker for Anno Messages App
// Strategy: Always fetch from network first, no caching for HTML and API requests
// Cache only used as fallback when offline

const CACHE_VERSION = 'v3';
const STATIC_CACHE = `anno-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `anno-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/anno-192.png',
  '/icons/anno-512.png'
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
    ])
  );
});

// Helper: Always try network first, cache only as fallback
async function networkFirst(request) {
  try {
    // Add cache-busting query parameter to force fresh content
    const url = new URL(request.url);
    url.searchParams.set('cache-bust', Date.now());
    
    // Force network fetch with no-cache and no-store
    const fetchReq = new Request(url, {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const response = await fetch(fetchReq);
    
    // Only cache successful responses as fallback for offline
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Helper: cache-first for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // API requests (assumes backend under /api)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle message-related paths
  if (url.pathname.includes('/messages') || url.pathname.includes('/chat')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML navigation requests -> network-first
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets -> cache-first
  event.respondWith(cacheFirst(request));
});

// No message listener: service worker will activate on next page reload (default behavior)