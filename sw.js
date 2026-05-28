/* =============================================
   CHAVEBOY — Service Worker (Offline)
   ============================================= */

const CACHE = 'chaveboy-v2';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon.svg',
];

// Instala e pré-cacheia os assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    // Navegações (HTML com ou sem ?game=...) → sempre serve index.html do cache
    if (e.request.mode === 'navigate') {
        e.respondWith(
            caches.match('./index.html').then(cached => cached || fetch(e.request))
        );
        return;
    }

    // Assets estáticos → cache-first, depois rede
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;

            return fetch(e.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE).then(cache => cache.put(e.request, clone));
                return response;
            }).catch(() => caches.match('./index.html'));
        })
    );
});
