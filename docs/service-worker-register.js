// Service Worker registration script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Utiliser un chemin relatif pour l'enregistrement du SW
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('AgregLLM: ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.error('AgregLLM: ServiceWorker registration failed: ', err);
      });
  });
}
