export function registerSW() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[TrustShield PWA] ServiceWorker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('[TrustShield PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}
