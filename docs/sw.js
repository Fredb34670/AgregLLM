const CACHE_NAME = 'agregllm-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Utiliser des chemins relatifs pour l'installation
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourner la réponse du cache si elle existe, sinon fetch
      return response || fetch(event.request).catch((err) => {
        console.error('SW fetch failed:', err);
        // On pourrait retourner une page de secours ici
      });
    })
  );
});
