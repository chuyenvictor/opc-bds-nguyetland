// Nguyet Land Progressive Web App (PWA) Service Worker - 2026
const CACHE_NAME = 'nguyetland-pwa-v3'; // Modular SaaS Architecture Cache Version
const STATIC_ASSETS = [
  '/',
  '/news',
  '/studio',
  '/dossier',
  '/manifest.webmanifest',
  '/img/nguyet-bds.png',
  '/js/modules/mortgage-calculator.js',
  '/js/modules/cashflow-heatmap.js',
  '/js/modules/tv-news-ticker.js',
  '/js/modules/ai-voice-player.js',
  '/js/modules/news-hub-controller.js',
  '/js/modules/mobile-drawer.js',
  '/js/auth-and-lead-engine.js',
  '/js/pwa-install-engine.js',
  '/js/ai-concierge-dossier-engine.js',
  '/js/live-social-proof-notifications.js',
  '/js/first-visit-welcome-overlay.js',
  '/js/lead-celebration-modal.js'
];

// Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Nguyet Land PWA] Pre-caching offline shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Nguyet Land PWA] Cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Nguyet Land PWA] Removing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first with Cache Fallback for dynamic data, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API mutations
  if (event.request.method !== 'GET') return;

  // Static Assets (Images, Fonts, Scripts): Stale-While-Revalidate
  if (
    url.origin === self.origin &&
    (url.pathname.startsWith('/img/') ||
     url.pathname.startsWith('/js/') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.webmanifest'))
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // HTML Pages: Network First, Fallback to Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
  }
});
