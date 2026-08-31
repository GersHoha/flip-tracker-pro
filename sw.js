/* Flip Tracker Pro — service worker: app shell cached for offline use. */
const CACHE = 'ftp-v2';
const SHELL = [
  './',
  'index.html',
  'nocturne-styles.css',
  'app.css',
  'phosphor-embedded.css',
  'app-data.js',
  'app-core.js',
  'app-viewmodels.js',
  'app-render-shell.js',
  'app-render-screens.js',
  'app-render-modals.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Fonts (Google Fonts) and other cross-origin GETs: cache-first, fill cache from network.
  if (url.origin !== location.origin) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // Same-origin app shell: network-first so updates land, cache fallback for offline.
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html')))
  );
});
