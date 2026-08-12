// Bump this whenever the caching rules change — the activate handler deletes
// every cache that isn't the current name, so a new name purges the old one.
const CACHE_NAME = 'kidlearn-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Only content-hashed build output is safe to serve cache-first: its filename
// changes whenever the content does. Caching anything else cache-first means
// a stale copy can be served indefinitely — which is exactly what happened to
// unhashed dev modules under the previous version of this file.
const isImmutable = (url) =>
  url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // HTML: network-first, so a deploy is picked up immediately; fall back to
  // the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Hashed build assets and icons: cache-first (safe — the URL changes when
  // the content does).
  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }))
    );
    return;
  }

  // Everything else: network-first with a cache fallback for offline use.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
