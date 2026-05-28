/* =============================================
   CHAVEBOY — Service Worker (Offline)
   ============================================= */

const CACHE = 'chaveboy-v1';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
];

// Instala e pré-cacheia os assets principais
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

// Cache-first: serve do cache, cai na rede se não tiver
self.addEventListener('fetch', (e) => {
    // Ignora requisições não-GET (ex: analytics)
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;

            // Busca na rede e armazena em cache
            return fetch(e.request).then(response => {
                // Só cacheia respostas válidas
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE).then(cache => cache.put(e.request, clone));
                return response;
            }).catch(() => {
                // Offline e sem cache: retorna página principal como fallback
                return caches.match('./index.html');
            });
        })
    );
});
