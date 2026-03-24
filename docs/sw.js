const CACHE_NAME = 'agregllm-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // Prendre le contrôle immédiatement
  );
});

self.addEventListener('fetch', (event) => {
  // Stratégie : Network First pour HTML et JS, Cache First pour le reste
  const isCritical = event.request.mode === 'navigate' || 
                     event.request.destination === 'script' || 
                     event.request.destination === 'style';

  if (isCritical) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mettre à jour le cache avec la nouvelle version
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
});
