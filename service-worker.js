// Minimal service worker: cache-first for app shell, network-first for everything else.
// On version bump (CACHE_NAME), all old caches are purged on activate.

const CACHE_NAME = 'aise26-v15';
const SHELL = [
  './index.html',
  './styles/tokens.css',
  './styles/base.css',
  './styles/layout.css',
  './styles/components.css',
  './styles/surfaces.css',
  './styles/map.css',
  './styles/motion.css',
  './styles/print.css',
  './js/app.js',
  './js/runtime.js',
  './vendor/force-graph.min.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
      .catch(() => null)        // best-effort
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // Cache-first for shell + static assets
  if (SHELL.some(u => url.pathname.endsWith(u.replace('./', '/')))
      || /\.(css|js|woff2?|ttf|svg|png|jpg|webp|wasm|json)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html')))
    );
    return;
  }

  // For HTML navigations, network first with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
  }
});
